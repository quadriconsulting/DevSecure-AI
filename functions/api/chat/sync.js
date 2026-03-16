// Author: Jeremy Quadri
// functions/api/chat/sync.js
// Single-check + 2s wait: returns within ~2s, client polls at adaptive 1.5-5s intervals.
// 2 list() ops max per request (vs 18 in the old 18s loop). handoff_active gate skips all if idle.

const WAIT_MS = 2000;

// CORS — required for cross-origin embeds (widget on external sites).
// Merged into noStore so every Response.json in this file inherits them automatically.
const noStore = {
  headers: {
    'Cache-Control': 'no-store',
    'Cloudflare-CDN-Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  },
};

export async function onRequestGet({ request, env }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  const url = new URL(request.url);
  const sessionId = (url.searchParams.get('sessionId') || '').slice(0, 64).trim();

  // --- MULTI-TENANT EXTRACTION ---
  // Must match the sanitization used in chat.js so KV prefixes align.
  const rawTenantId = (url.searchParams.get('tenant_id') || '').slice(0, 64).trim();
  const tenantId = rawTenantId.toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'default';

  // Tenant-scoped KV key names — must mirror the constants in chat.js.
  const KV_SESSION    = `tenant:${tenantId}:session`;
  const KV_SESSION_TS = `tenant:${tenantId}:session_ts`;
  const KV_HANDOFF    = `tenant:${tenantId}:handoff`;

  if (!sessionId || !env.CHAT_STATE) {
    return Response.json({ messages: [] }, noStore);
  }

  // Kill-switch: frontend detected 15-min idle — clean up KV and release AI
  if (url.searchParams.get('end') === '1') {
    if (env.CHAT_STATE) {
      await env.CHAT_STATE.delete(KV_SESSION).catch(() => {});
      await env.CHAT_STATE.delete(KV_SESSION_TS).catch(() => {});
      await env.CHAT_STATE.delete(KV_HANDOFF).catch(() => {});
      console.log('[sync] session killed by 15-min idle for', sessionId, '(tenant=' + tenantId + ')');
    }
    return Response.json({ messages: ['__RELEASE_AI__'] }, noStore);
  }

  // Gate: if no active handoff for this tenant, return immediately — 1 get op total
  const handoffActive = await env.CHAT_STATE.get(KV_HANDOFF).catch(() => null);
  if (!handoffActive) {
    return Response.json({ messages: [] }, noStore);
  }

  // Reply keys are written by telegram.js as `tenant:${tenantId}:reply:${sessionId}:${ts}`.
  const prefix = `tenant:${tenantId}:reply:${sessionId}:`;

  // First check
  const first = await env.CHAT_STATE.list({ prefix }).catch(() => ({ keys: [] }));
  if (first.keys.length > 0) {
    return Response.json({ messages: await collect(first.keys, env, sessionId) }, noStore);
  }

  // Wait 2s, then one final check — makes a 5s client poll feel like ~3s end-to-end
  await new Promise(r => setTimeout(r, WAIT_MS));
  const second = await env.CHAT_STATE.list({ prefix }).catch(() => ({ keys: [] }));
  if (second.keys.length > 0) {
    return Response.json({ messages: await collect(second.keys, env, sessionId) }, noStore);
  }

  return Response.json({ messages: [] }, noStore);
}

async function collect(keys, env, sessionId) {
  const messages = [];
  for (const { name } of keys) {
    const val = await env.CHAT_STATE.get(name).catch(() => null);
    if (val !== null) messages.push(val);
    await env.CHAT_STATE.delete(name).catch(() => {});
  }
  console.log('[sync] delivered', messages.length, 'message(s) for session', sessionId);
  return messages;
}
