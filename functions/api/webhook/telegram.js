// Author: Jeremy Quadri
// functions/api/webhook/telegram.js
// Receives Telegram Bot webhook POSTs when a support agent replies to a forwarded message.
// Parses the session ID from the original message and stores the reply in KV.

export async function onRequestPost({ request, env }) {
  const update = await safeJson(request);
  const message = update?.message;

  console.log('[webhook] env check', { hasKV: Boolean(env.CHAT_STATE), hasTG: Boolean(env.TELEGRAM_BOT_TOKEN) });
  console.log('[webhook] update received', JSON.stringify({
    hasMessage: Boolean(message),
    chatId: message?.chat?.id,
    hasText: Boolean(message?.text),
    hasReplyTo: Boolean(message?.reply_to_message),
    expectedChatId: env.TELEGRAM_CHAT_ID,
  }));

  // Only process text messages from the authorized support chat
  if (!message?.text || message.chat?.id?.toString() !== env.TELEGRAM_CHAT_ID) {
    console.log('[webhook] DROPPED: chat ID mismatch or no text', {
      got: message?.chat?.id?.toString(),
      expected: env.TELEGRAM_CHAT_ID,
    });
    return new Response('OK');
  }

  // --- HANDOFF EXIT ---
  if (/^(done|exit)$/i.test(message.text.trim())) {
    const activeSession = env.CHAT_STATE ? await env.CHAT_STATE.get('last_active_session') : null;
    if (activeSession && env.CHAT_STATE) {
      await env.CHAT_STATE.put(`reply:${activeSession}:${Date.now()}`, '__RELEASE_AI__', { expirationTtl: 86400 });
      await env.CHAT_STATE.put(`version:${activeSession}`, Date.now().toString(), { expirationTtl: 86400 });
      await env.CHAT_STATE.delete('last_active_session');
      await env.CHAT_STATE.delete('last_active_session_ts');
      console.log('[webhook] RELEASE_AI queued for session', activeSession);
    }
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: '✅ Handed back to AI.' }),
      }).catch(e => console.error('[webhook] CONFIRM_SEND_ERROR', e?.message));
    }
    return new Response('OK');
  }
  // --- END HANDOFF EXIT ---

  // Try reply_to_message first; fall back to last_active_session
  const originalText = message.reply_to_message?.text || '';
  const match = originalText.match(/\[Session: ([a-f0-9-]{36})\]/);
  let sessionId;
  if (match) {
    sessionId = match[1];
    console.log('[webhook] sessionId from reply_to_message', sessionId);
  } else {
    const fallback = env.CHAT_STATE ? await env.CHAT_STATE.get('last_active_session') : null;
    if (!fallback) {
      console.log('[webhook] DROPPED: no reply_to_message and no last_active_session in KV');
      return new Response('OK');
    }
    sessionId = fallback;
    console.log('[webhook] sessionId from last_active_session fallback', sessionId);
  }
  console.log('[webhook] storing reply for session', sessionId);

  const msgKey = `reply:${sessionId}:${Date.now()}`;
  console.log('[webhook] KV write start', { msgKey, sessionId, hasKV: Boolean(env.CHAT_STATE) });
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
