# Support & Escalation

## Facts
- Support tiers: Free (community forum only, best-effort), Developer (48-hour email/forum, Normal/Low severity), Team (24-hour email/Slack/forum, all severities except Emergency), Enterprise (4-hour 24/7 email/Slack/phone, all severities including Emergency P0)
- Severity P0/Critical (Enterprise only): production down, security breach imminent, data loss risk; examples: DevSecure blocking all CI/CD pipelines, false negative (missed Critical vuln in production), data exfiltration concern; response: 4 hours 24/7 including weekends; escalation: directly to CTO + Security Lead
- Severity P1/High (Team/Enterprise): major feature unavailable, significant business impact; examples: auto-fix PRs failing for all repos, SSO auth broken (Enterprise), DAST scans timing out consistently; response: Team (24 hours), Enterprise (8 hours)
- Severity P2/Normal (all tiers): minor feature issue, workaround available; examples: false positive in specific file, IDE plugin not syncing, report export formatting; response: Developer (48 hours), Team/Enterprise (24 hours)
- Severity P3/Low (all tiers): cosmetic issue, feature request, documentation; response: Developer (5 business days), Team/Enterprise (3 business days)
- Emergency keywords (Telegram bridge triggers): "production down", "security breach", "data leak", "URGENT", "critical outage", "can't deploy"
- Telegram bridge behavior: (1) Aria acknowledges urgency, (2) Collects context (repository, error logs, screenshot), (3) Opens P0 ticket, (4) Notifies on-call engineer via Telegram within 2 minutes
- Self-service resources: Knowledge Base (docs.devsecure.com), Community Forum (community.devsecure.com for best practices/peer support), Status Page (status.devsecure.com for real-time incident updates, subscribe via email/Slack)
- Escalation process: Step 1 - contact support (email: support@devsecure.com, Slack for Team/Enterprise private channel, phone for Enterprise emergency), Step 2 - provide context (plan tier, repository URL, scan ID, error message/screenshot, steps to reproduce), Step 3 - SLA timer starts on automated email acknowledgment, Step 4 - resolution (Developer/Team: email with fix/workaround, Enterprise: Dedicated CSM coordinates + post-incident report for P0/P1)

## Q&A

### Q: What support is included in my plan?
**A:** Free: Community forum (best-effort). Developer: 48-hour email support for Normal/Low issues. Team: 24-hour email/Slack support for all severities. Enterprise: 4-hour 24/7 support including phone for emergencies, Dedicated CSM, and post-incident reports. (Source: devsecure_support_escalation.md)

### Q: What is a P0/Critical incident?
**A:** P0 (Enterprise only): Production system down, security breach imminent, or data loss risk. Examples: DevSecure blocking all CI/CD pipelines, false negative reaching production, data exfiltration concern. Response: 4 hours, 24/7, escalates directly to CTO. (Source: devsecure_support_escalation.md)

### Q: What are the emergency keywords for Telegram escalation?
**A:** Keywords that trigger immediate escalation: "production down", "security breach", "data leak", "URGENT", "critical outage", "can't deploy". Aria detects these and automatically escalates to the on-call engineer via Telegram within 2 minutes. (Source: devsecure_support_escalation.md)

### Q: How do I contact support?
**A:** Email: support@devsecure.com (all tiers). Slack: Private workspace channel (Team/Enterprise customers). Phone: Emergency line for Enterprise P0 incidents. Always provide: plan tier, repository URL, scan ID, error message, and steps to reproduce. (Source: devsecure_support_escalation.md)

### Q: What is the SLA for my tier?
**A:** Developer: 48-hour response. Team: 24-hour response with Standard SLA. Enterprise: 4-hour response for P0 (24/7), 8-hour for P1, with custom SLAs up to 99.99% uptime guarantee. SLA timer starts when you receive automated ticket acknowledgment. (Source: devsecure_support_escalation.md)

### Q: Where can I check DevSecure's system status?
**A:** Visit status.devsecure.com for real-time updates on outages, degraded performance, and scheduled maintenance. Subscribe to email/Slack notifications to receive instant alerts when status changes. (Source: devsecure_support_escalation.md)

### Q: What happens when Aria escalates to Telegram?
**A:** When Aria detects emergency keywords, she: (1) Acknowledges urgency, (2) Collects context (repo, scan ID, error), (3) Opens P0 ticket, (4) Sends message to on-call engineer's Telegram within 2 minutes with full context. You'll see "Engineer is connecting..." in the chat. (Source: devsecure_support_escalation.md)

## Immutable Links
- Support Portal: https://support.devsecure.com
- Knowledge Base: https://docs.devsecure.com
- Community Forum: https://community.devsecure.com
- Status Page: https://status.devsecure.com