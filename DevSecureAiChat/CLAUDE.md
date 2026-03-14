# Project Standards: DevSecSecure AI Concierge (Aria)

## 1. Tech Stack & Execution Environment
- **Frontend**: React 19, TypeScript, Tailwind CSS, GSAP (ScrollTrigger + `@gsap/react`), Lucide React. Use GSAP for scroll animations, Framer Motion for micro-interactions
- **Build Tool**: Vite 6
- **Backend**: Cloudflare Pages Functions (`/functions/api/chat.js`, `/functions/api/sync.js`, `/functions/api/webhook/telegram.js`)
- **AI/RAG**: Cloudflare Workers AI (`@cf/baai/bge-base-en-v1.5`), Cloudflare Vectorize, OpenAI (`gpt-4o-mini`)
- **Package Manager**: `npm`
- **Run Dev Server**: `npm run dev:sandbox` (Uses PM2 and Wrangler; DO NOT run standard `vite` dev server)
- **Build Project**: `npm run build`

## 2. Core Architectural Rules

### Anonymous UUID Memory (Silent Context)
- Implement `localStorage` logic in `AriaChat.tsx` to generate and store a persistent UUID
- Pass this UUID to `/api/chat.js` via the request body to maintain conversation context across sessions
- UUID format: `v4-{timestamp}-{random}` for session tracking

### Session State Management
- All conversation history stored in Cloudflare KV with TTL of 24 hours
- Key format: `session:{uuid}:messages` → array of message objects
- Each message: `{role: "user"|"assistant", content: string, timestamp: number}`

### RAG Architecture
- 24 focused Markdown files embedded in Cloudflare Vectorize (index: `devsecure-rag`)
- Chunk size: 400-800 tokens, overlap: 50 tokens
- Embedding model: `@cf/baai/bge-base-en-v1.5`
- Retrieval: Top 3 most relevant chunks per query
- Metadata: Each chunk tagged with `source_file`, `section`, `plan_tier` for filtering

## 3. Brand & Design Identity

### Theme: Professional DevSecOps Console
- **Primary Background**: Deep Navy (`#0F172A` - Tailwind `bg-slate-900`)
- **Secondary Background**: Charcoal (`#1E293B` - Tailwind `bg-slate-800`)
- **Primary Text**: Cool White (`#F1F5F9` - Tailwind `text-slate-100`)
- **Secondary Text**: Slate Grey (`#94A3B8` - Tailwind `text-slate-400`)
- **Accent/Borders**: Indigo (`#6366F1` - Tailwind `border-indigo-500`)
- **Success**: Emerald (`#10B981`)
- **Warning**: Amber (`#F59E0B`)
- **Critical**: Red (`#EF4444`)

### Forbidden Styles
- ❌ Colorful gradients (except subtle indigo accent overlays)
- ❌ Drop shadows exceeding `shadow-lg`
- ❌ Glow effects (except minimal `ring-1 ring-indigo-500/20` for focus states)
- ❌ Comic Sans or decorative fonts

## 4. Layout & Spacing Rules

### Chat Window Container
- **Position**: Fixed bottom-right corner
- **Dimensions**: `w-96 h-[600px]` (desktop), full-screen on mobile
- **Border**: `1px` solid indigo-500/30
- **Backdrop**: `backdrop-blur-xl bg-slate-900/95`
- **Animation**: Slide up from bottom with `easeOutExpo` curve

### Message Layout
- **User messages**: Right-aligned, `bg-indigo-600`, max-width 80%
- **Aria messages**: Left-aligned, `bg-slate-800`, max-width 80%
- **Timestamps**: `text-xs text-slate-500`, right-aligned below message
- **Spacing**: `space-y-4` between messages

### Grid System
- Content centered with `max-w-7xl mx-auto`
- Mathematical spacing: `py-8`, `py-16`, `py-24` (8px increments)

## 5. Typography Rules

### Font Families
- **Primary**: Inter (Tailwind default sans-serif stack)
- **Monospace**: JetBrains Mono for code snippets (`font-mono`)

### Hierarchy
- **Aria Identity Header**: `text-sm font-semibold tracking-wide uppercase` ("ARIA - DEVSECURE CONCIERGE")
- **Message Text**: `text-sm leading-relaxed`
- **Timestamps**: `text-xs`
- **Button Labels**: `text-sm font-medium`

## 6. Animation & Motion Rules

### Easing Curve
- **Primary**: `easeOutExpo` → CSS: `cubic-bezier(0.19, 1, 0.22, 1)`
- **Framer Motion**: `ease: [0.19, 1, 0.22, 1]`

### Timing
- **Chat slide-in**: 600ms
- **Message fade-in**: 200ms
- **Typewriter effect**: 30ms per character
- **Button hover**: 150ms

### Scroll Effects
- Subtle fade-in and slide-up (20px) for new messages
- Respect `prefers-reduced-motion`

## 7. Specific Component Implementations

### TypewriterResponse Component
- Geometric scramble effect: `—_/+X<>[]` characters before locking in letters
- Blink cursor: `2px` vertical bar, `animate-pulse`
- Speed: 30ms per character (adjustable for urgency)
- Must handle Markdown rendering: bold (`**text**`), italic (`*text*`), inline code (`` `code` ``)

### Chat Window (`AriaChat.tsx`)
- Sharp 1px-bordered container
- Terminal-like message log (no "bubble" UI)
- Auto-scroll to bottom on new message
- Input field: `bg-slate-800 border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`

### Follow-Up Button Grid
- Buttons rendered from AI response: extract lines starting with `- `
- Layout: `flex flex-wrap gap-2`
- Button style: `px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 hover:border-indigo-500 hover:bg-slate-750 transition-colors`
- Max 4 buttons displayed

### Mermaid Diagram Rendering
- Isolated Shadow DOM container to prevent React conflicts
- Theme: Dark mode, high-contrast colors
- Cache rendered diagrams in KV (keyed by markdown hash)
- Fallback: If Mermaid fails, display raw code in `<pre><code>` block

## 8. Code Quality

### Standards
- Write clean, modular, DRY code
- All components fully responsive (`sm:`, `md:`, `lg:` breakpoints)
- Respect `prefers-reduced-motion`
- Use TypeScript strict mode
- ESLint + Prettier configured

### Error Handling
- All API calls wrapped in try-catch
- User-facing error messages: "Something went wrong. Please try again."
- Internal errors logged to Cloudflare Workers analytics
- Never expose raw error messages to users

## 9. AI Output & Backend Constraints (`chat.js`)

### Brevity & UI Parsing
- **Max Response Length**: 100 words (strict; truncate if exceeded)
- **One Paragraph Default**: Multi-paragraph only for technical explanations
- **Language Lock**: ALWAYS respond in English, regardless of user's language

### JSON Contract (Critical)
```json
{
  "response": "User-facing message with **markdown** support",
  "action": "SHOW_PRICING" | "BOOK_DEMO" | "START_TRIAL" | "SHOW_DOCS" | "ESCALATE" | null,
  "action_payload": {
    "url": "https://devsecure.com/pricing",
    "label": "View Pricing"
  },
  "suggestions": [
    "- How does SAST work?",
    "- Compare Team vs Enterprise",
    "- Schedule a demo"
  ],
  "metadata": {
    "confidence": 0.95,
    "sources": ["devsecure_pricing.md", "devsecure_sast_engine.md"]
  }
}
```

### Follow-Up Suggestion Format
- MUST use literal hyphen-space (`- `) on new lines
- ❌ Never use: `•`, `1.`, `*`, or unicode bullets
- Frontend regex depends on exact `- ` prefix
- Example:
  ```
  - How does auto-fix work?
  - What's the pricing?
  - Compare us to Snyk
  ```

### Immutable Links (Never Hallucinate)
- **Pricing**: `https://devsecure.com/pricing`
- **Book Demo**: `https://devsecure.com/demo`
- **Free Trial**: `https://devsecure.com/signup`
- **Documentation**: `https://docs.devsecure.com`
- **API Docs**: `https://docs.devsecure.com/api`
- **Status Page**: `https://status.devsecure.com`

### Citation Requirements
- Every factual claim must cite source: `(Source: [filename])`
- Format: `DevSecure's RPS score is unbounded (Source: devsecure_sast_engine.md)`
- If no source found, respond: "I don't have that specific detail—let me connect you with our team."

## 10. Omnichannel Relay (Bidirectional Telegram Bridge)

### Trigger Keywords (Emergency Escalation)
**Regex**: `\b(down|breach|leak|emergency|critical|p0|urgent|outage|production.*down|security.*breach|data.*leak)\b` (case-insensitive)

### Backend Behavior (`chat.js` + `sync.js`)

#### Pre-AI Interceptor
1. Check user message against trigger regex **before** Vectorize or OpenAI call
2. If match:
   - Send Telegram Bot message to on-call group
   - Set KV states:
     - `last_active_session` → `{sessionId}`
     - `last_active_session_ts` → `{timestamp}`
     - `handoff_active:{sessionId}` → `true`
   - Return JSON:
     ```json
     {
       "response": "This sounds urgent—I'm connecting you with our on-call engineer now (typically <5 min).",
       "action": "wait_for_engineer",
       "suggestions": []
     }
     ```

#### Two-Way Bridge
- While `handoff_active:{sessionId}` is `true`:
  - User messages bypass AI → forwarded directly to Telegram
  - Engineer replies (via Telegram bot) stored in KV: `reply:{sessionId}:{timestamp}`
  - Frontend polls `/api/sync.js` to retrieve replies

#### Long-Polling Sync (`sync.js`)
- Holds connection open up to **18 seconds**
- Uses `KV.list({ prefix: 'reply:{sessionId}:' })` to retrieve timestamped message queue
- Returns messages newer than `?since={timestamp}`
- If no new messages after 18s, return `204 No Content`

### Frontend Behavior (`AriaChat.tsx`)

#### "Wait for Engineer" Indicator
- `wait_for_engineer` action renders:
  - Persistent "Engineer is typing..." indicator (pulsing dots)
  - User input remains enabled
  - Display: "You're now connected to a live engineer. Responses in ~2 minutes."

#### Adaptive Throttling
- **Idle mode**: Poll `/api/sync.js` every **5 seconds**
- **Burst mode**: After user sends message, poll every **2 seconds** for **2 minutes**
- **Tab hidden**: Stop polling entirely (use `document.visibilityState`)

#### Kill-Switch (Auto-Release)
- If **15 minutes** of silence (no user or engineer message):
  - Frontend sends `GET /api/sync.js?session={sessionId}&end=1`
  - Backend deletes KV keys: `handoff_active:{sessionId}`, `reply:{sessionId}:*`
  - Returns special payload: `{release: "__RELEASE_AI__"}`
  - Frontend displays: "Engineer session ended due to inactivity. Aria is back online."

### Telegram Bot Message Format
```
🚨 EMERGENCY ESCALATION — DevSecure

User: user@company.com (Team tier)
Issue: "Production CI/CD pipeline blocked by DevSecure scan"
Scan ID: scan_xyz789 (if available)
Context: [Last 3 messages]

👉 Reply here to respond directly to user
🔗 View chat: https://aria.devsecure.com/sessions/{sessionId}
```

### Required Secrets & KV
- **Env vars**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `OPENAI_API_KEY`
- **KV namespace**: `CHAT_STATE` (binding in `wrangler.json`)
- **Webhook registration**: `POST https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://aria.devsecure.com/api/webhook/telegram`

## 11. Actions & Deep Links

### Supported Actions
- `SHOW_PRICING` → Open pricing page in new tab
- `BOOK_DEMO` → Open demo booking page (Calendly)
- `START_TRIAL` → Open signup page with pre-filled plan
- `SHOW_DOCS` → Open specific doc section (e.g., `/docs/sast-engine`)
- `ESCALATE` → Trigger Telegram bridge (same as keyword trigger)
- `SHOW_COMPARISON` → Open competitor comparison page

### Action Payload Structure
```json
{
  "action": "BOOK_DEMO",
  "action_payload": {
    "url": "https://devsecure.com/demo?source=aria&plan=team",
    "label": "Schedule Demo",
    "new_tab": true
  }
}
```

### Action Trigger Rules
- ❌ **Never** trigger `BOOK_DEMO` unless user explicitly requests it ("schedule demo", "book call", "talk to sales")
- ❌ **Never** trigger `START_TRIAL` unless user asks about signing up
- ✅ **Always** trigger `SHOW_PRICING` when user asks about pricing/plans/cost
- ✅ **Always** trigger `ESCALATE` on emergency keywords

## 12. RAG Knowledge Base Structure

### 24 Focused MD Files (Hybrid Format)
Each file contains:
1. **Facts Section** (bullets) — for keyword retrieval
2. **Q&A Pairs** — for semantic retrieval (format: `### Q: ...` / `**A:**`)
3. **Immutable Links** — injected verbatim

### Example File Structure (`devsecure_pricing.md`)
```markdown
# DevSecure Pricing (2026)

## Facts
- Per-developer seat billing model
- Four tiers: Free (£0), Developer (£19), Team (£29), Enterprise (£49+)
- Team minimum: 5 seats (£145/month)
- Enterprise minimum: 20 seats (£980/month)

## Q&A

### Q: How much does DevSecure cost?
**A:** DevSecure offers four tiers: Free (£0), Developer (£19/dev/month), Team (£29/dev/month, min. 5 seats), and Enterprise (from £49/dev/month, min. 20 seats). (Source: Pricing Sheet 2026)

### Q: What's included in Team tier?
**A:** Team tier (£29/dev/month) includes 50 repositories, unlimited auto-fix PRs, CI/CD integration, Slack/Jira integration, and 24-hour support. (Source: Pricing Sheet 2026)

## Immutable Links
- View Pricing: https://devsecure.com/pricing
- Start Free Trial: https://devsecure.com/signup
```

### File Naming Convention
- Core product: `devsecure_product_overview.md`, `devsecure_pricing.md`
- Security engines: `devsecure_sast_engine.md`, `devsecure_autonomous_remediation.md`
- Integrations: `devsecure_integrations.md`, `devsecure_cicd_integration.md`
- Support: `devsecure_onboarding_faq.md`, `devsecure_support_escalation.md`
- System (always loaded): `aria_persona_guardrails.md`, `aria_telegram_bridge.md`

### Always-Loaded Context (Not Retrieved)
Three files injected into **every** chat.js system prompt (not via RAG):
1. `aria_persona_guardrails.md` — Aria's identity, tone, capabilities, prohibitions
2. `aria_telegram_bridge.md` — Emergency escalation protocol
3. `aria_immutable_links.md` — All canonical URLs

## 13. Core Project Guardrails (DO NOT VIOLATE)

### UI & Styling
- The `AriaChat.tsx` component has a highly specific dark navy/indigo theme
- ❌ **Never** alter existing padding, margins, structural classes, or colors without explicit instruction
- ❌ **Never** change typewriter animation speed or scramble pattern

### Omnichannel Relay (Telegram Bridge)
- The system relies on precise KV state management (`handoff_active`, `last_active_session`)
- ❌ **Never** modify KV polling intervals (5s idle, 2s burst) without explicit permission
- ❌ **Never** alter emergency keyword regex without approval
- ❌ **Never** change 15-minute kill-switch timeout

### JSON Contract Safety
- AI must return valid JSON in `chat.js`
- ❌ **Never** generate code or Mermaid diagrams without escaping newlines (`\n`) and quotes
- ✅ **Always** validate JSON with `JSON.parse()` test before returning
- If generation fails, return fallback: `{"response": "Error generating response. Please try again.", "suggestions": []}`

### Professional Tone & Actions
- Aria is a technical assistant, not a pushy salesperson
- ❌ **Never** trigger `BOOK_DEMO` or `START_TRIAL` unless user explicitly requests
- ❌ **Never** use pressure language ("limited time", "act now", "don't miss out")
- ✅ **Always** prioritize helpfulness over conversion

### Privacy & Security
- ❌ **Never** log PII (emails, API tokens, passwords) in Workers analytics
- ✅ **Always** redact sensitive patterns before RAG lookup (AWS keys, tokens)
- ✅ **Always** enforce session isolation (no cross-user context leakage)

## 14. Development Workflow

### Local Development
```bash
npm install
npm run dev:sandbox  # Starts Wrangler + Vite via PM2
```

### Deploy to Cloudflare Pages
```bash
npm run build
wrangler pages deploy ./dist --project-name=devsecure-aria
```

### Embedding RAG Files
```bash
# Create Vectorize index
wrangler vectorize create devsecure-rag --dimensions=768 --metric=cosine

# Upload embeddings (batch script)
for file in rag-knowledge-base/*.md; do
  wrangler vectorize insert devsecure-rag \
    --file="$file" \
    --metadata="source=$(basename $file)"
done
```

### Testing Telegram Bridge
1. Set up bot: Create bot via @BotFather, get `TELEGRAM_BOT_TOKEN`
2. Get chat ID: Send message to bot, call `https://api.telegram.org/bot{TOKEN}/getUpdates`
3. Set webhook: `POST https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://aria.devsecure.com/api/webhook/telegram`
4. Test trigger: Send message with "production down" → Verify Telegram notification

## 15. Success Metrics

### Resolution Rate
- **Target**: 75% of sessions resolved without human escalation
- **Measurement**: `(sessions_without_escalation / total_sessions) * 100`

### User Satisfaction
- **Target**: 4.5/5 average post-chat rating
- **Measurement**: Optional thumbs up/down + optional comment after session ends

### Lead Qualification
- **Target**: 30% of chats result in qualified lead (ICP score ≥40)
- **Measurement**: Track `BOOK_DEMO`, `START_TRIAL` action triggers + ICP signal detection

### Escalation Accuracy
- **Target**: 90% of emergency escalations are true P0/P1 incidents
- **Measurement**: Engineer tags each Telegram escalation as "Valid" or "False Positive"

### RAG Relevance
- **Target**: 85% of responses cite relevant source
- **Measurement**: Track `metadata.sources` in chat logs, validate chunks match user query

---

## Appendix: wrangler.json Configuration

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "devsecure-aria",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"],
  "ai": {
    "binding": "AI"
  },
  "vectorize": [
    {
      "binding": "VEC_INDEX",
      "index_name": "devsecure-rag"
    }
  ],
  "kv_namespaces": [
    {
      "binding": "CHAT_STATE",
      "id": "YOUR_KV_NAMESPACE_ID",
      "remote": true
    }
  ]
}
```

---

**End of Project Standards**