// Author: Jeremy Quadri
// functions/api/chat.js — DevSecure AI Concierge (B2B SaaS support agent)

// Reply length policy
// SOFT_CHAR_TARGET: model instruction target (best-effort)
// HARD_CHAR_CAP:    server-side ceiling; replies longer than this are cleanly truncated
//                  (bypassed when user explicitly requests detail)
const SOFT_CHAR_TARGET = 280;
const HARD_CHAR_CAP    = 480;

// CORS — required for cross-origin embeds (widget on external sites)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Drop-in replacement for Response.json that always includes CORS headers.
function corsJson(body, init = {}) {
  return Response.json(body, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init.headers || {}) },
  });
}

export async function onRequestPost({ request, env, context }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug") === "1";

  const body = await safeJson(request);
  const message = (body?.message || "").toString().slice(0, 4000).trim();
  const uuid = (body?.uuid || "").toString().slice(0, 64).trim();

  // --- MULTI-TENANT EXTRACTION ---
  // Sanitize to lowercase alphanumeric + dashes/underscores; fallback to "default".
  const rawTenantId = (body?.tenant_id || "").toString().slice(0, 64).trim();
  const tenantId = rawTenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'default';

  // Tenant-scoped KV key names — formalized namespace: tenant:{tenant_id}:<resource>
  const KV_SESSION    = `tenant:${tenantId}:session`;
  const KV_SESSION_TS = `tenant:${tenantId}:session_ts`;
  const KV_HANDOFF    = `tenant:${tenantId}:handoff`;
  // Persistent Context Memory key — 30-day rolling conversation window per user
  const memoryKey = uuid ? `tenant:${tenantId}:user:${uuid}:memory` : null;

  // Resolve Telegram Chat ID — tenant-specific env var takes priority over global fallback.
  // e.g. TG_CHAT_ID_DEVSECURE, TG_CHAT_ID_ACME, etc.
  const tgChatId = env[`TG_CHAT_ID_${tenantId.toUpperCase()}`] || env.TELEGRAM_CHAT_ID;

  console.log('[chat] bindings:', {
    tenantId,
    hasVEC: Boolean(env?.VEC_INDEX),
    hasCHAT_STATE: Boolean(env?.CHAT_STATE),
    hasTG_TOKEN: Boolean(env?.TELEGRAM_BOT_TOKEN),
    hasTG_CHAT_ID: Boolean(tgChatId),
    hasOPENAI: Boolean(env?.OPENAI_API_KEY),
  });

  if (!message) {
    return corsJson({ reply: "Ask me a question and I'll help." }, { status: 400 });
  }

  // --- TWO-WAY BRIDGE: forward user messages to support agent when session is live ---
  if (env.CHAT_STATE && uuid) {
    const liveSession = await env.CHAT_STATE.get(KV_SESSION).catch(() => null);
    const handoffActive = await env.CHAT_STATE.get(KV_HANDOFF).catch(() => null);
    const tunnelOpen = (liveSession === uuid) || (handoffActive === uuid);

    if (tunnelOpen) {
      const isExitCommand = /^(done|exit|end|bye)$/i.test(message.trim());

      if (isExitCommand) {
        // Visitor ended the handoff — release KV and notify the Telegram agent
        await env.CHAT_STATE.delete(KV_HANDOFF).catch(() => {});
        await env.CHAT_STATE.delete(KV_SESSION).catch(() => {});
        await env.CHAT_STATE.delete(KV_SESSION_TS).catch(() => {});
        if (env.TELEGRAM_BOT_TOKEN && tgChatId) {
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgChatId,
              text: `🛑 Visitor ended the conversation ("${message}"). AI is back in control. [Tenant: ${tenantId}] [Session: ${uuid}]`,
            }),
          }).catch(e => console.error('[chat] EXIT_NOTIFY_ERROR', e?.message));
        }
        console.log('[chat] TWO_WAY_BRIDGE visitor exit, tunnel released for session', uuid);
        // Fall through to AI so it delivers a contextual goodbye reply
      } else {
        // Normal handoff: re-establish session keys if needed, forward to Telegram, return early
        if (liveSession !== uuid) {
          await env.CHAT_STATE.put(KV_SESSION, uuid, { expirationTtl: 86400 }).catch(() => {});
          await env.CHAT_STATE.put(KV_SESSION_TS, Date.now().toString(), { expirationTtl: 86400 }).catch(() => {});
          console.log('[chat] TWO_WAY_BRIDGE re-established session from handoff_active', uuid);
        }
        const tgText = `💬 Visitor: "${message}"\n\n[Tenant: ${tenantId}] [Session: ${uuid}]`;
        if (env.TELEGRAM_BOT_TOKEN && tgChatId) {
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ chat_id: tgChatId, text: tgText }),
          }).catch(e => console.error('[chat] BRIDGE_SEND_ERROR', e?.message));
        }
        // Refresh timestamp so auto-timeout resets on each visitor message
        await env.CHAT_STATE.put(KV_SESSION_TS, Date.now().toString(), { expirationTtl: 86400 }).catch(() => {});
        console.log('[chat] TWO_WAY_BRIDGE forwarded to Telegram for session', uuid);
        return corsJson({ reply: null, action: 'wait_for_agent', suggested: [] });
      }
    }
  }
  // --- END TWO-WAY BRIDGE ---

  // --- PRE-AI TELEGRAM INTERCEPTOR ---
  // Fires when the user asks a high-value sales question OR explicitly wants a human agent.
  // Calendar-intent guard prevents meeting/demo requests from routing to Telegram
  // (those are handled by the AI which provides the calendar booking link instead).
  const userText           = (body?.message || '').toLowerCase();
  const INTERCEPT_RE       = /\b(waf|quote|contract|rate|rates|pricing)\b/i;
  const CALENDAR_INTENT_RE = /\b(meeting|demo|schedule|calendar|book)\b/i;

  // 1. Clear requests for a human, support agent, or phone contact
  const requestsHuman = /(talk to|speak with|contact|get hold of).*(human|agent|person|representative|support)|live agent|real person|human representative|customer service|phone number|phone call|call me/i.test(userText);
  // 2. Technical discussion of AI/software agents — must not trigger handoff
  const isTechnical = /multi-agent|ai agent|software agent|support for|supported languages/i.test(userText);
  // 3. Meeting/demo requests — handled by AI calendar link, not handoff
  const isMeeting = /\b(meeting|demo|schedule|calendar)\b/i.test(userText);

  const wantsHuman = requestsHuman && !isTechnical && !isMeeting;

  if ((INTERCEPT_RE.test(message) && !CALENDAR_INTENT_RE.test(message)) || wantsHuman) {
    const tgText = `🔔 High-value inquiry [Tenant: ${tenantId}] [Session: ${uuid}]\n\n"${message}"\n\n↩ Reply to this message to respond in the visitor's chat.`;
    if (env.TELEGRAM_BOT_TOKEN && tgChatId) {
      try {
        const tgResp = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chat_id: tgChatId, text: tgText }),
        });
        if (!tgResp.ok) {
          const errBody = await tgResp.text().catch(() => '(unreadable)');
          console.error('[chat] TG_INTERCEPT_FAILED', tgResp.status, errBody);
        } else {
          console.log('[chat] TG_INTERCEPT_OK', tgResp.status);
        }
      } catch (e) {
        console.error('[chat] TG_INTERCEPT_NETWORK_ERROR', e?.message);
      }
    } else {
      console.error('[chat] TG_INTERCEPT_SKIPPED: missing TELEGRAM_BOT_TOKEN or tgChatId (tenantId=' + tenantId + ')');
    }
    // Store session for webhook fallback — keys are tenant-scoped
    if (env.CHAT_STATE && uuid) {
      await env.CHAT_STATE.put(KV_SESSION, uuid, { expirationTtl: 86400 })
        .catch(e => console.error('[chat] KV_SESSION_WRITE_ERROR', e?.message));
      console.log('[chat] KV write:', KV_SESSION, '=', uuid);
      await env.CHAT_STATE.put(KV_SESSION_TS, Date.now().toString(), { expirationTtl: 86400 })
        .catch(e => console.error('[chat] KV_SESSION_TS_WRITE_ERROR', e?.message));
      console.log('[chat] KV write:', KV_SESSION_TS, 'done');
      await env.CHAT_STATE.put(KV_HANDOFF, uuid, { expirationTtl: 900 })
        .catch(e => console.error('[chat] KV_HANDOFF_ACTIVE_WRITE_ERROR', e?.message));
      console.log('[chat] KV write:', KV_HANDOFF, '=', uuid);
    }
    return corsJson({
      reply: "I've alerted our support team. A specialist will reply here in a moment!",
      action: "wait_for_agent",
      suggested: [],
    });
  }
  // --- END PRE-AI INTERCEPTOR ---

  // --- REAL-TIME CVE LOOKUP ---
  // Detect CVE IDs in the user's message and fetch live threat intelligence
  // from the DevSecure RPS API to inject as enriched context for the AI.
  const cveMatch = message.match(/CVE-\d{4}-\d{4,7}/i);
  let cveContext = "";
  let threatCardUI = "";
  if (cveMatch) {
    const cveId = cveMatch[0].toUpperCase();
    try {
      const rpsResponse = await fetch(
        `https://rps-api-production-1050984944087.europe-west2.run.app/api/v1/rps?cve_id=${encodeURIComponent(cveId)}`,
        { headers: { 'Authorization': `Bearer ${env.RPS_API_TOKEN}` } }
      );
      if (rpsResponse.ok) {
        const jsonResponse = await rpsResponse.json();
        const rpsData = jsonResponse.data; // Extract from the nested data object

        // Map all dataset presences
        const foundIn = [];
        if (rpsData.is_kev) foundIn.push("🚨 CISA KEV (Active)");
        if (rpsData.is_exploitdb) foundIn.push("ExploitDB");
        if (rpsData.in_ghsa) foundIn.push("GitHub Advisories");
        if (rpsData.has_cvefixes) foundIn.push("CVEfixes/Patch Data");
        if (rpsData.data_sources && rpsData.data_sources.length > 0) {
          rpsData.data_sources.forEach(ds => {
            if (!foundIn.includes(ds)) foundIn.push(ds);
          });
        }

        const epssPercent = rpsData.epss_score != null ? (rpsData.epss_score * 100).toFixed(2) + "%" : "N/A";
        const kevStatus = rpsData.is_kev ? "⚠️ ACTIVE" : "Inactive";

        // Only show the dataset line if there are actually datasets
        const datasetLine = foundIn.length > 0 ? `\n* **Found in Datasets:** ${foundIn.join(", ")}` : "";

        // Deterministic UI card — prepended to the reply, not trusted to the LLM
        threatCardUI = `### ⚠️ Threat Intelligence: ${rpsData.cve_id}
* **RPS Score:** **${rpsData.rps_score}%** (${rpsData.severity})
* **CVSS Score:** ${rpsData.cvss_score} (${rpsData.cvss_source || "NVD"})
* **EPSS Probability:** ${epssPercent}
* **Exploited in the Wild (KEV):** ${kevStatus}${datasetLine}\n\n`;

        // Tell the LLM to ONLY generate the summary
        cveContext = `\nSYSTEM NOTE: The user asked about ${rpsData.cve_id}. The structured threat data is already being displayed to them by the UI. You MUST ONLY output a 1-3 sentence technical explanation of the vulnerability. Do not output scores.\n`;
        console.log('[chat] CVE_LOOKUP_OK', cveId);
      } else {
        console.warn('[chat] CVE_LOOKUP_HTTP', rpsResponse.status, cveId);
      }
    } catch (e) {
      console.error('[chat] CVE_LOOKUP_FAILED', e?.message);
    }
  }
  // --- END CVE LOOKUP ---

  const wantPersonal = isExplicitPersonalIntent(message);
  const ambiguousSelf = isAmbiguousAboutSelf(message);

  // Fail fast if bindings are missing
  if (!env?.VEC_INDEX || !env?.OPENAI_API_KEY) {
    const payload = debug
      ? { ok: false, error: "MISSING_BINDINGS", hasVEC_INDEX: Boolean(env?.VEC_INDEX), hasOPENAI: Boolean(env?.OPENAI_API_KEY) }
      : { reply: "Assistant is not configured yet (missing Vectorize or OpenAI binding).", suggested: suggestFollowups(false) };
    return corsJson(payload, { status: 500 });
  }

  // 1) Embed the query — OpenAI text-embedding-3-small (1536-dim, matches jq-rag index)
  let qVec = [];
  try {
    const embResp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message,
        dimensions: 1536,
      }),
    });
    if (!embResp.ok) throw new Error(`OpenAI embeddings status ${embResp.status}`);
    const embData = await embResp.json();
    qVec = embData?.data?.[0]?.embedding || [];
  } catch (e) {
    console.error('[chat] EMBEDDING_FAILED', e?.message);
    return corsJson(
      debug
        ? { ok: false, error: "EMBEDDING_FAILED", qVecLen: 0, note: e?.message }
        : { reply: "Assistant error: embedding step failed. Please try again.", suggested: suggestFollowups(wantPersonal) },
      { status: 500 }
    );
  }

  const qVecLen = Array.isArray(qVec) ? qVec.length : 0;
  if (qVecLen !== 1536) {
    console.error('[chat] BAD_QUERY_VECTOR', { qVecLen });
    return corsJson(
      debug
        ? { ok: false, error: "BAD_QUERY_VECTOR", qVecLen, expected: 1536 }
        : { reply: "Assistant error: invalid query vector. Please try again.", suggested: suggestFollowups(wantPersonal) },
      { status: debug ? 400 : 500 }
    );
  }

  // 2) Baseline query (unfiltered) — proves index is populated
  const baselineTopK = 12;
  const topK = 6;

  let baselineMatches = [];
  try {
    const baseline = await env.VEC_INDEX.query(qVec, { topK: baselineTopK, returnMetadata: true, filter: { tenant_id: tenantId } });
    baselineMatches = normalizeMatches(baseline).matches;
  } catch (e) {
    console.error('[chat] VECTOR_BASELINE_QUERY_FAILED', e);
    return corsJson(
      debug
        ? { ok: false, error: "VECTOR_BASELINE_QUERY_FAILED", qVecLen }
        : { reply: "Assistant error: vector search failed. Please try again.", suggested: suggestFollowups(wantPersonal) },
      { status: 500 }
    );
  }

  const baselineCount = baselineMatches.length;
  const baselineSources = uniq(
    baselineMatches.map(m => (m?.metadata?.source || "").toString()).filter(Boolean)
  );

  // 3) Filtered query — always scoped to this tenant; additionally filter by
  //    type="professional" unless the user explicitly asked for personal content.
  const filterUsed = wantPersonal
    ? { tenant_id: tenantId }
    : { tenant_id: tenantId, type: "professional" };
  let matches = [];
  let fallbackUsed = false;
  try {
    const filtered = await env.VEC_INDEX.query(qVec, { topK, filter: filterUsed, returnMetadata: true });
    matches = normalizeMatches(filtered).matches;

    // Resilience: metadata index may be newly created / still propagating.
    // If the filtered query succeeded but returned 0 results while the
    // baseline found vectors, fall back to post-filtering the baseline so
    // the chat never looks broken during index warm-up.
    if (!wantPersonal && matches.length === 0 && baselineCount > 0) {
      matches = baselineMatches
        .filter(m => (m?.metadata?.type || "").toLowerCase() !== "personal")
        .slice(0, topK);
      fallbackUsed = true;
    }
  } catch {
    // Fallback: post-filter from baseline (or a fresh broader query)
    try {
      const raw = await env.VEC_INDEX.query(qVec, { topK: 12, returnMetadata: true, filter: { tenant_id: tenantId } });
      const arr = normalizeMatches(raw).matches;
      matches = arr.filter(m => wantPersonal || m?.metadata?.type !== "personal").slice(0, topK);
    } catch (e2) {
      console.error('[chat] VECTOR_QUERY_FAILED', e2);
      return corsJson(
        debug
          ? { ok: false, error: "VECTOR_QUERY_FAILED", qVecLen, baselineCount }
          : { reply: "Search is temporarily unavailable. Please try again.", suggested: suggestFollowups(wantPersonal) },
        { status: 500 }
      );
    }
  }

  const matchCount = matches.length;
  const sources = uniq(matches.map(m => (m?.metadata?.source || "").toString()).filter(Boolean));

  // DEBUG MODE: metadata only (NO raw chunk text, NO personal content)
  if (debug) {
    const sample = matches.slice(0, 3).map(m => {
      const meta = m?.metadata || {};
      return {
        id: m?.id,
        score: m?.score,
        source: meta?.source,
        section: meta?.section,
        type: meta?.type,
        metaKeys: Object.keys(meta),
        hasChunk: Boolean(meta?.chunk),
        chunkLen: meta?.chunk ? String(meta.chunk).length : 0,
      };
    });

    return corsJson({
      ok: true,
      step: "debug",
      wantPersonal,
      qVecLen,
      filterUsed,
      baselineCount,
      matchCount,
      baselineSources,
      filteredSources: sources,
      sources,
      fallbackUsed,
      sample,
      note: "baselineCount>0 = index populated + binding OK. matchCount=0 with baselineCount>0 = metadata index missing or vectors need re-seeding. fallbackUsed=true = metadata filter returned 0 so results were post-filtered from baseline (normal during index warm-up).",
    });
  }

  // 4) Ambiguous "about yourself" -> default professional
  if (ambiguousSelf && !wantPersonal) {
    return corsJson({
      reply: "I'm DevSecure's AI Concierge - I can help with AppSec questions, platform features, pricing, or booking a demo.",
      suggested: suggestFollowups(false),
    });
  }

  // 5) Build internal context from retrieved chunks (NOT returned to user)
  const CHUNK_CAP = 800;
  const ctx = matches
    .map((m, i) => {
      const meta = m?.metadata || {};
      const chunk = (meta?.text || "").toString().trim().slice(0, CHUNK_CAP);
      const header = `[#${i + 1} ${meta.source || "doc"} | ${meta.section || "root"} | type=${meta.type || "?"}]`;
      return chunk ? `${header}\n${chunk}` : `${header}\n(no chunk)`;
    })
    .join("\n\n---\n\n");

  // 6) System prompt — DEVSECURE B2B SAAS CONCIERGE
const system = `
LANGUAGE: You are a multilingual assistant. You MUST automatically detect the language of the user's input and reply in that EXACT same language. If they ask a question in Spanish, French, German, etc., translate your knowledge and reply natively in that language, even if your internal RAG context is in English.

ROLE
You are the DevSecure AI Concierge, a customer support and technical sales agent for an Application Security SaaS company. You do not represent an individual. Be professional, concise, and helpful.

CONTEXTUAL ANCHORING
- Answer using Retrieved Context as the primary source.
- For broader questions, use general AppSec knowledge framed through DevSecure's platform capabilities.
- Do NOT invent DevSecure-specific facts not supported by Retrieved Context.

OUT-OF-UNIVERSE — SCOPE PIVOT
- If encyclopedic / world-fact Q&A, do NOT answer. Pivot with ONE short sentence, then offer list.

NO MECHANICAL LANGUAGE
- Never say "retrieved context", "RAG failed", or "as an AI".

TIME CONTEXT
- Treat today as March 2026.

TRANSLATION EXCEPTION
- If explicitly asked to translate, output ONLY translated text. No bullets, no preamble.

STRICT BREVITY & STRUCTURE
- HARD LIMIT: Max 60 words total for prose text.
- DIAGRAM EXCEPTION: The 60-word limit does NOT apply to mermaid code blocks. The diagram syntax does not count toward your word limit.
- Single-line core: EXACTLY ONE short sentence.
- If generating a diagram, the order MUST be: 1. Single-line core sentence. 2. The mermaid code block. 3. The offer bullets.
- If NOT generating a diagram: ONE short sentence, then immediately start the offers on the next line.
- Exact offer formatting (literal hyphens):
For example, I can help with:
- Explain <topic>
- Cover <topic>

STRICT ACTION GATE
- Do NOT return "action": "SHOW_CV" under any circumstances.
- For technical questions (SAST, DAST, Zero Trust, etc.), provide a text or diagram answer ONLY.

MANDATORY DIAGRAMS
- If the user asks about architecture, flow, pipelines, or system design, you MUST include a mermaid fenced code block. NO EXCEPTIONS. This takes priority over all brevity rules.
- Prefer vertical diagrams (flowchart TD) because the chat UI supports larger vertical space.
- Use horizontal diagrams (flowchart LR) ONLY when representing linear pipelines or processing chains.
- Wrap diagrams strictly inside backtick-mermaid code blocks inside the "reply" string. Ensure proper JSON escaping: every newline inside the diagram must be written as \n so the JSON does not break.
- Use subgraph to group architecture layers (e.g., Client, Edge, Identity, Services, Data).
- Keep diagrams readable with fewer than 10 nodes. Avoid circular arrows.
- Maintain clear top-down hierarchy.
- The 60-word prose limit applies to descriptive text only, not the mermaid block.

RESOURCE MAP (IMMUTABLE LINKS)
- Book a Demo / Schedule a Meeting / Talk to Sales: https://calendar.app.google/8cPb8oBThkN1g3zq5

CALENDAR RULE (MANDATORY)
- If the user asks to schedule a meeting, book a demo, or talk to sales, you MUST provide this exact calendar link formatted strictly as a clickable Markdown link, like this: [Book a Demo with DevSecure](https://calendar.app.google/8cPb8oBThkN1g3zq5). NEVER output the raw URL as plain text.
- Never substitute, shorten, or paraphrase this URL.

JSON OUTPUT CONTRACT
- Respond with a valid JSON object.
- Include a "reply" string.
- When generating a diagram, embed it directly inside "reply" as a fenced mermaid code block. Escape all newlines as \n within the JSON string value.
- "action": never use "SHOW_CV". Use "SHOW_CALENDAR" for booking/demo/meeting requests. Use "RENDER_SVG" or "RENDER_CODE" only when directly asked.
`.trim();

    const user = `
User question:
${message}

Retrieved context:
${ctx || "(no matches returned)"}${cveContext}
Answer using retrieved context as the primary source for DevSecure-specific questions. Do not use mechanical retrieval language.
IMPORTANT: Be extremely brief. Answer in exactly ONE short sentence. If you include "For example, I can help with:", put it immediately after that sentence using literal hyphen bullets (- ).
Respond with a valid JSON object containing at minimum a "reply" string.
`.trim();

  // Fetch rolling conversation memory — injected between system prompt and current user turn
  const pastMemory = (memoryKey && env.CHAT_STATE)
    ? (await env.CHAT_STATE.get(memoryKey, 'json').catch(() => null)) || []
    : [];

  const rawReply = await callOpenAI(env.OPENAI_API_KEY, system, user, debug, pastMemory);

  // 7) Hard char cap — bypass when user explicitly wants detail
  let { reply: rawReplyText, action, codeSnippet } = rawReply;
  // Strip SHOW_CV from AI output unless user explicitly requested it
  const cvExplicit = /\b(download cv|your cv|send resume|get resume|share cv|see cv)\b/i.test(message);
  if (action === 'SHOW_CV' && !cvExplicit) action = undefined;
  // Deterministic fallback: force action flags if the AI forgets
  const lowerMsg = message.toLowerCase();
  if (!action) {
    if (cvExplicit) action = 'SHOW_CV';
    else if (/\b(calendar|book time|schedule|hire|meet|call)\b/.test(lowerMsg)) action = 'SHOW_CALENDAR';
  }
  const hasDiagram = (rawReplyText || '').includes('```mermaid');
  const reply = (wantsDetail(message) || hasDiagram)
    ? (rawReplyText || '').trim()
    : capReply(rawReplyText, HARD_CHAR_CAP);

  // Deterministically prepend the threat card — LLM output is only the summary
  const finalReply = threatCardUI ? threatCardUI + reply : reply;

  // Persist updated memory non-blockingly — 30-day TTL, 10-turn rolling window
  if (memoryKey && env.CHAT_STATE && context?.waitUntil) {
    const updatedMemory = [
      ...pastMemory,
      { role: 'user', content: message },
      { role: 'assistant', content: finalReply },
    ].slice(-10);
    context.waitUntil(
      env.CHAT_STATE.put(memoryKey, JSON.stringify(updatedMemory), { expirationTtl: 2592000 })
    );
  }

  return corsJson({
    reply: finalReply,
    suggested: buildSuggestedFromReply(reply, wantPersonal, message),
    action,
    codeSnippet,
  });
}

function normalizeMatches(res) {
  if (!res) return { matches: [] };
  if (Array.isArray(res)) return { matches: res };
  if (Array.isArray(res.matches)) return { matches: res.matches };
  return { matches: [] };
}

async function callOpenAI(apiKey, system, user, debugMode = false, pastMemory = []) {
  if (!apiKey) return { reply: "OpenAI API key missing on server." };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);

  // Build messages array: system → past conversation turns → current user turn
  const messages = [
    { role: 'system', content: system },
    ...pastMemory,
    { role: 'user', content: user },
  ];

  let resp;
  try {
    resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages,
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });
  } catch (e) {
    clearTimeout(timer);
    const isTimeout = e?.name === "AbortError";
    console.error('[chat] OPENAI_FETCH_ERROR', { isTimeout, error: e?.message });
    return {
      reply: isTimeout
        ? "The assistant took too long to respond. Please try again."
        : "Unable to reach the assistant. Please try again.",
    };
  }
  clearTimeout(timer);

  if (!resp.ok) {
    console.error('[chat] OPENAI_STATUS', resp.status);
    if (debugMode) {
      const bodyText = await safeText(resp);
      return { reply: `Service error (openaiStatus=${resp.status}): ${truncate(bodyText, 300)}` };
    }
    return { reply: "The assistant is temporarily unavailable. Please try again." };
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content?.trim();
  if (!content) return { reply: "No response." };
  let clean = content.trim();
  clean = clean.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return { reply: clean.replace(/[{}]/g, '').trim() };
  }
}

function isExplicitPersonalIntent(_q) {
  // Personal intent detection not applicable for B2B SaaS context.
  return false;
}

function isAmbiguousAboutSelf(msg) {
    const lower = msg.toLowerCase();

    // 1. Check if it contains general "about you" phrasing
    const hasGenericPrompt = /(tell me about (you|devsecure|yourself)|who (are you|is devsecure))/.test(lower);

    // 2. Check if it contains specific professional/technical keywords
    const hasTechFocus = /(sast|dast|experience|work|background|security|appsec|zero trust|architecture|code|skills|pricing|demo)/.test(lower);

    // It is ONLY ambiguous if it asks a generic question AND doesn't mention technical topics
    return hasGenericPrompt && !hasTechFocus;
}

function suggestFollowups(_wantPersonal) {
  return [
    "How does the autonomous SAST auto-fix work?",
    "What is the pricing for a team of 10?",
    "Explain the Multi-Agent Debate architecture.",
  ];
}

// ---------------------------------------------------------------------------
// Reply-aware suggestion builder
// Returns exactly 3 short question strings.
// Priority:
//   1. Offer bullets extracted from an explicit offer section of the reply
//      (Section Gating: only parsed after an offer-header line is found)
//   2. Keyword-pool routing based on reply + user message
//   3. Professional default pool
// No extra model calls; pure string parsing.
// ---------------------------------------------------------------------------

function buildSuggestedFromReply(replyText, wantPersonal, userMessage) {
  // 1) Try to extract offer bullets from the reply
  const extracted = extractOfferLines(replyText);

  if (extracted.length >= 3) {
    return extracted.slice(0, 3);
  }

  // 2) Fill remainder from keyword-pool routing
  const pool = pickPool(replyText, userMessage, wantPersonal);
  const combined = dedup([...extracted, ...pool]);
  return combined.slice(0, 3);
}

// ---------------------------------------------------------------------------
// extractOfferLines — hardened version
//
// Design constraints enforced here:
//   A) SECTION GATING    — only parse lines that appear AFTER an explicit
//                           offer-header line.  The header line itself is
//                           skipped UNLESS it is a complete standalone offer
//                           (e.g. "I can explain the SAST approach." with no
//                           following bullets).  Everything before the header
//                           is ignored.
//   B) REFUSAL EXCLUSION — drop any line containing pivot/refusal phrases.
//   C) OFFER-ONLY VALID  — accept a line only if it matches a strict offer
//                           pattern (action verb present, not a skills fact).
//   D) CLEANING          — strip scaffolding, preserve natural case, wrap as
//                           question, clamp to 90 chars.
//
// Returns up to 5 cleaned question strings (caller takes first 3).
// Returns [] when no valid offer section is found → caller uses pickPool.
// ---------------------------------------------------------------------------
function extractOfferLines(replyText) {
  const raw = (replyText || "").slice(0, 1200);
  const lines = raw.split(/\n/);

  // ── A) SECTION GATING ────────────────────────────────────────────────────
  const OFFER_HEADER_RE = /\b(for example|i can help(?: you)?(?: with)?|i can cover|i can explain|here are a few ways i can help)\b/i;

  let offerSectionStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (OFFER_HEADER_RE.test(lines[i])) {
      offerSectionStart = i;
      break;
    }
  }
  if (offerSectionStart === -1) return [];

  // ── C) OFFER-ONLY VALIDATION (defined early for use in header check) ──────
  // C1  Explicit "I can …" with a content-bearing action verb
  const C1_RE = /\b(?:i can|i can help|i can help with)\b.{0,120}\b(?:explain|cover|discuss|walk(?: through)?|break down|outline|compare|summarize)\b/i;
  // C2  "discuss DevSecure's capabilities with …"
  const C2_RE = /\bdiscuss\b.{0,60}\bdevsecure(?:'?s)?\b.{0,60}\b(?:capabilities|features|experience)\b.{0,60}\bwith\b/i;
  // C3  Bullet prefixed with an offer verb (right after bullet marker)
  const C3_RE = /^[-\u2022*]\s*(?:explain|cover|walk(?: through)?|break down|outline|compare|summarize|discuss)\b/i;

  const isOffer = (line) => C1_RE.test(line) || C2_RE.test(line) || C3_RE.test(line);

  // Decide whether to include the header line as a candidate.
  // A header line is included only when it IS itself a valid offer AND has
  // substantial content remaining after stripping the header phrases — i.e. it
  // is a standalone "I can explain X" sentence, not a "I can help with:" intro.
  const headerLine = lines[offerSectionStart];
  const headerIsStandaloneOffer = isOffer(headerLine) && (() => {
    const stripped = headerLine
      .replace(/\bi can help(?: you)?(?: with)?[:]?\s*/i, "")
      .replace(/\bi can cover[:]?\s*/i, "")
      .replace(/\bi can explain[:]?\s*/i, "")
      .replace(/\bfor example[,:]?\s*/i, "")
      .trim();
    // Must have something meaningful after stripping AND must not end with ":"
    // (which would indicate it's a list intro, not a standalone offer)
    return stripped.length > 8 && !/:\s*$/.test(stripped);
  })();

  const candidateLines = headerIsStandaloneOffer
    ? lines.slice(offerSectionStart)       // header is also a candidate
    : lines.slice(offerSectionStart + 1);  // skip header (default)

  // ── B) REFUSAL / PIVOT BLACKLIST ─────────────────────────────────────────
  const REFUSAL_PHRASES = [
    "outside devsecure",
    "outside our core",
    "not in devsecure",
    "not within devsecure",
    "i can tell you about our capabilities",
    "i can\u2019t help with",
    "i can't help with",
    "i can\u2019t answer",
    "i can't answer",
  ];
  const isRefusal = (s) => {
    const lower = s.toLowerCase();
    return REFUSAL_PHRASES.some(p => lower.includes(p));
  };

  // ── D) CLEAN + WRAP ───────────────────────────────────────────────────────
  const STRIP_PREFIXES = [
    /^[-\u2022*]\s*/,
    /^for example[,:]?\s*/i,
    // Strip "I can help (you) with" so "I can help with X" → "X"
    /^i can help you with[:]?\s*/i,
    /^i can help with[:]?\s*/i,
    // Strip only "I can " (not the verb) so "I can explain X" → "explain X"
    /^i can\s+(?=explain|cover|discuss|walk|break|outline|compare|summarize)/i,
    // Fallback: strip bare "I can:" prefix
    /^i can[:]\s*/i,
  ];

  const cleanLine = (line) => {
    let s = line.trim();
    for (const re of STRIP_PREFIXES) s = s.replace(re, "");
    return s.replace(/^[^a-zA-Z0-9]+/, "").trim();
  };

  const toQuestion = (cleaned) => {
    if (!cleaned) return null;
    if (/\?$/.test(cleaned)) return cleaned;
    // Lowercase first char so "Can you Explain" → "Can you explain"
    const lowered = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
    return ("Can you " + lowered).replace(/\.?$/, "?");
  };

  // ── Scan candidate lines ──────────────────────────────────────────────────
  const results = [];
  for (const rawLine of candidateLines) {
    if (results.length >= 5) break;
    const line = rawLine.trim();
    if (!line) continue;
    if (isRefusal(line)) continue;
    if (!isOffer(line)) continue;
    const cleaned = cleanLine(line);
    if (!cleaned) continue;
    let question = toQuestion(cleaned);
    if (!question) continue;
    if (question.length > 90) question = question.slice(0, 87).trimEnd() + "\u2026";
    results.push(question);
  }
  return results;
}

// Returns a pool of 3 suggestions based on keyword routing.
function pickPool(replyText, userMessage, wantPersonal) {
  const haystack = ((replyText || "") + " " + (userMessage || "")).toLowerCase();

  // Risk scoring
  if (/\bepss\b|\bcvss\b|\bkev\b|\brisk scor|\bpriori|\bexploit intel/.test(haystack)) {
    return [
      "How do you combine EPSS, CVSS, KEV, and exploit intel?",
      "What does your risk scoring output look like in practice?",
      "How do you avoid noisy false positives in scoring?",
    ];
  }

  // CI/CD gates & remediation
  if (/\bfail-closed\b|\bautonom|\bremediat|\bci\/cd\b|\bgates?\b|\bpatch\b|auto.?fix/.test(haystack)) {
    return [
      "What deterministic gates must a fix pass?",
      "How do you prevent unsafe or non-compiling patches?",
      "When do you require human review vs auto-merge?",
    ];
  }

  // Tooling / platform
  if (/\bsast\b|\bdast\b|\bsca\b|\bsbom\b|\biac\b|\bsecrets\b|\bscanner/.test(haystack)) {
    return [
      "Which scanners do you route and why?",
      "How do you handle SBOM + dependency risk at scale?",
      "How do you operationalize findings into tickets/SLAs?",
    ];
  }

  // Professional default
  return [
    "How does the autonomous SAST auto-fix work?",
    "What is the pricing for a team of 10?",
    "Explain the Multi-Agent Debate architecture.",
  ];
}

// Deduplicates while preserving insertion order.
function dedup(arr) {
  return Array.from(new Set(arr || []));
}

function uniq(arr) {
  return Array.from(new Set(arr || []));
}

function truncate(s, n) {
  const str = (s || "").toString();
  return str.length > n ? str.slice(0, n) + "…" : str;
}

async function safeJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

async function safeText(resp) {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

// Returns true when the user explicitly requests a long / detailed answer.
// In that case the hard char cap is skipped.
function wantsDetail(q) {
  const s = q.toLowerCase();
  return (
    s.includes("detailed") ||
    s.includes("deep dive") ||
    s.includes("step-by-step") ||
    s.includes("step by step") ||
    s.includes("explain fully") ||
    s.includes("in detail") ||
    s.includes("long") ||
    s.includes("comprehensive")
  );
}

// Caps a reply at `cap` characters, cutting at the last sentence boundary
// before the cap, or the last space, then appending "…".
function capReply(text, cap) {
  const s = (text || "").trim();
  if (s.length <= cap) return s;

  const window = s.slice(0, cap);
  // prefer last sentence-ending punctuation
  const sentEnd = Math.max(
    window.lastIndexOf("."),
    window.lastIndexOf("?"),
    window.lastIndexOf("!"),
  );
  const cut = sentEnd > cap * 0.5 ? sentEnd + 1 : window.lastIndexOf(" ");
  return (cut > 0 ? s.slice(0, cut) : window).trimEnd() + "…";
}
