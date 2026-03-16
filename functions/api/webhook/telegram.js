// Author: Jeremy Quadri
// functions/api/webhook/telegram.js
// Receives Telegram Bot webhook POSTs when a support agent replies to a forwarded message.
// Parses the session ID from the original message and stores the reply in KV.
// Multi-tenant: resolves tenantId from the incoming chat_id via env var lookup.

// Resolves tenantId from the incoming Telegram chat ID using hybrid routing:
//   1. Check dedicated tenant env vars: TG_CHAT_ID_{TENANT_ID_UPPER} → tenantId
//   2. Fall back to global TELEGRAM_CHAT_ID → 'devsecure'
// Returns null if the chat ID is not authorized.
function resolveTenantFromChatId(env, incomingChatId) {
  const id = incomingChatId?.toString();
  if (!id) return null;

  // Check tenant-specific env vars (e.g. TG_CHAT_ID_DEVSECURE, TG_CHAT_ID_ACME)
  for (const [key, val] of Object.entries(env)) {
    if (key.startsWith('TG_CHAT_ID_') && val?.toString() === id) {
      return key.replace('TG_CHAT_ID_', '').toLowerCase();
    }
  }

  // Fall back to shared global resource
  if (env.TELEGRAM_CHAT_ID?.toString() === id) return 'devsecure';

  return null; // unauthorized
}

export async function onRequestPost({ request, env }) {
  const update = await safeJson(request);
  const message = update?.message;

  console.log('[webhook] env check', { hasKV: Boolean(env.CHAT_STATE), hasTG: Boolean(env.TELEGRAM_BOT_TOKEN) });
  console.log('[webhook] update received', JSON.stringify({
    hasMessage: Boolean(message),
    chatId: message?.chat?.id,
    hasText: Boolean(message?.text),
    hasReplyTo: Boolean(message?.reply_to_message),
  }));

  // Resolve tenantId from the incoming chat ID — hybrid routing model.
  const tenantId = resolveTenantFromChatId(env, message?.chat?.id);
  if (!message?.text || tenantId === null) {
    console.log('[webhook] DROPPED: unauthorized chat ID or no text', {
      got: message?.chat?.id?.toString(),
    });
    return new Response('OK');
  }

  // Tenant-scoped KV key names — formalized namespace: tenant:{tenant_id}:<resource>
  const KV_SESSION    = `tenant:${tenantId}:session`;
  const KV_SESSION_TS = `tenant:${tenantId}:session_ts`;
  const KV_HANDOFF    = `tenant:${tenantId}:handoff`;

  // Tenant-resolved Telegram chat ID for outbound confirmations
  const tgChatId = env[`TG_CHAT_ID_${tenantId.toUpperCase()}`] || env.TELEGRAM_CHAT_ID;

  // --- HANDOFF EXIT ---
  if (/^(done|exit|end|bye)$/i.test(message.text.trim())) {
    const activeSession = env.CHAT_STATE ? await env.CHAT_STATE.get(KV_SESSION) : null;
    if (activeSession && env.CHAT_STATE) {
      await env.CHAT_STATE.put(`tenant:${tenantId}:reply:${activeSession}:${Date.now()}`, '__RELEASE_AI__', { expirationTtl: 86400 });
      await env.CHAT_STATE.put(`version:${activeSession}`, Date.now().toString(), { expirationTtl: 86400 });
      await env.CHAT_STATE.delete(KV_SESSION);
      await env.CHAT_STATE.delete(KV_SESSION_TS);
      await env.CHAT_STATE.delete(KV_HANDOFF);
      console.log('[webhook] RELEASE_AI queued for session', activeSession, '(tenant=' + tenantId + ')');
    }
    if (env.TELEGRAM_BOT_TOKEN && tgChatId) {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: tgChatId, text: '✅ Handed back to AI.' }),
      }).catch(e => console.error('[webhook] CONFIRM_SEND_ERROR', e?.message));
    }
    return new Response('OK');
  }
  // --- END HANDOFF EXIT ---

  // Try reply_to_message first; fall back to tenant-scoped last active session.
  // Also extract tenant directly from the message tag so routing is always exact,
  // regardless of which Telegram chat the reply arrives from.
  const originalText = message.reply_to_message?.text || '';
  const tenantMatch  = originalText.match(/\[Tenant: ([a-zA-Z0-9_-]+)\]/);
  const resolvedTenantId = tenantMatch ? tenantMatch[1].toLowerCase() : tenantId;

  // Re-derive KV keys if the embedded tenant differs from the chat-ID-resolved one
  const KV_SESSION_R    = `tenant:${resolvedTenantId}:session`;
  const KV_SESSION_TS_R = `tenant:${resolvedTenantId}:session_ts`;
  const KV_HANDOFF_R    = `tenant:${resolvedTenantId}:handoff`;

  const match = originalText.match(/\[Session: ([a-f0-9-]{36})\]/);
  let sessionId;
  if (match) {
    sessionId = match[1];
    console.log('[webhook] sessionId from reply_to_message', sessionId, '(resolvedTenant=' + resolvedTenantId + ')');
  } else {
    const fallback = env.CHAT_STATE ? await env.CHAT_STATE.get(KV_SESSION_R) : null;
    if (!fallback) {
      console.log('[webhook] DROPPED: no reply_to_message and no active session in KV (tenant=' + resolvedTenantId + ')');
      return new Response('OK');
    }
    sessionId = fallback;
    console.log('[webhook] sessionId from KV session fallback', sessionId, '(tenant=' + resolvedTenantId + ')');
  }
  console.log('[webhook] storing reply for session', sessionId, '(tenant=' + resolvedTenantId + ')');

  const msgKey = `tenant:${resolvedTenantId}:reply:${sessionId}:${Date.now()}`;
  console.log('[webhook] KV write start', { msgKey, sessionId, resolvedTenantId, hasKV: Boolean(env.CHAT_STATE) });
  await env.CHAT_STATE.put(msgKey, message.text, { expirationTtl: 86400 });
  console.log('[webhook] KV write success: reply key', msgKey);
  await env.CHAT_STATE.put(`version:${sessionId}`, Date.now().toString(), { expirationTtl: 86400 });
  console.log('[webhook] KV write success: version key', `version:${sessionId}`);

  return new Response('OK');
}

async function safeJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
