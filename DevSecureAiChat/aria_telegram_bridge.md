# Aria Telegram Bridge Protocol

## Overview
Real-time bidirectional relay between Aria and on-call engineers for emergency escalation. Triggers on P0 keywords, enables live human takeover within 2 minutes.

## Emergency Keywords (Trigger Regex)
`\b(down|breach|leak|emergency|critical|p0|urgent|outage|production.*down|security.*breach|data.*leak|can't.*deploy)\b` (case-insensitive)

## Escalation Flow

### Step 1: Detection (Pre-AI Interceptor)
- Check user message against trigger regex BEFORE Vectorize or OpenAI call
- If match → proceed to Step 2
- If no match → normal RAG flow

### Step 2: Telegram Notification
Send message to on-call Telegram group:
```
🚨 EMERGENCY ESCALATION — DevSecure

User: {email} ({plan_tier} tier)
Issue: "{last_user_message}"
Scan ID: {scan_id} (if available)
Context: [Last 3 messages]

👉 Reply here to respond directly to user
🔗 View chat: https://aria.devsecure.com/sessions/{sessionId}
```

### Step 3: KV State Management
Set keys:
- `last_active_session` → `{sessionId}`
- `last_active_session_ts` → `{timestamp}`
- `handoff_active:{sessionId}` → `true` (TTL: 30 minutes)

### Step 4: Return wait_for_engineer Action
JSON response:
```json
{
  "response": "This sounds urgent—I'm connecting you with our on-call engineer now (typically <5 min). Can you share the scan ID or error message?",
  "action": "wait_for_engineer",
  "suggestions": []
}
```

## Two-Way Bridge

### User → Telegram
While `handoff_active:{sessionId}` is `true`:
- User messages bypass AI
- Forward directly to Telegram group
- Prefix with session context

### Telegram → User
Engineer replies stored in KV:
- Key: `reply:{sessionId}:{timestamp}`
- Frontend polls `/api/sync.js` to retrieve
- Messages displayed as "Engineer: {message}"

## Frontend Polling Behavior

### Adaptive Throttling
- **Idle mode**: Poll every 5 seconds
- **Burst mode**: Poll every 2 seconds for 2 minutes after user sends message
- **Tab hidden**: Stop polling (use `document.visibilityState`)

### Long-Polling (`/api/sync.js`)
- Hold connection open up to 18 seconds
- Use `KV.list({ prefix: 'reply:{sessionId}:' })` to retrieve timestamped queue
- Return messages newer than `?since={timestamp}`
- If no new messages after 18s → return `204 No Content`

## Kill-Switch (Auto-Release)

### Timeout: 15 Minutes of Silence
If no user or engineer message for 15 minutes:
1. Frontend sends `GET /api/sync.js?session={sessionId}&end=1`
2. Backend deletes KV keys:
   - `handoff_active:{sessionId}`
   - All `reply:{sessionId}:*` keys
3. Returns: `{release: "__RELEASE_AI__"}`
4. Frontend displays: "Engineer session ended due to inactivity. Aria is back online."
5. Aria resumes normal RAG operation

## Configuration

### Required Env Vars
- `TELEGRAM_BOT_TOKEN`: Bot token from @BotFather
- `TELEGRAM_CHAT_ID`: On-call group chat ID

### KV Namespace
- Binding: `CHAT_STATE` (in wrangler.json)
- Remote: true

### Webhook Setup
```bash
POST https://api.telegram.org/bot{TOKEN}/setWebhook
?url=https://aria.devsecure.com/api/webhook/telegram
```

## Engineer Actions

### Claim Ownership
Tap ✅ reaction on Telegram message to claim ticket

### Resolve
Tap ✔️ reaction when issue closed

### Reply
Type message in Telegram group → auto-relayed to user's chat

## Monitoring

### Success Metrics
- Escalation latency: <2 minutes from keyword detection to Telegram notification (target: 99% < 30 seconds)
- Handoff accuracy: 90% of escalations are true P0/P1 (vs false positives)
- Resolution time: Median time from escalation to issue resolution (target: <15 minutes)

### Alerts
- Escalation latency > 5 minutes → alert DevOps
- Handoff active > 30 minutes → check if engineer forgotten (auto-release after timeout)
- Daily escalation count > 50 → review keyword regex (too sensitive)