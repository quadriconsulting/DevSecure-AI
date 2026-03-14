# DevSecure Integrations

## Facts
- Source Control: GitHub (Cloud/Enterprise), GitLab (Cloud/Self-Managed), Bitbucket (Cloud/Data Center), Azure DevOps/Azure Repos
- GitHub features: OAuth integration, PR inline comments, status checks blocking merges, auto-fix PR creation (all tiers)
- GitLab features: Self-Managed support (Enterprise), Merge Request integration, Security Dashboard aggregation
- IDE Plugins: VSCode and JetBrains (IntelliJ, PyCharm, WebStorm) for real-time SAST/Secrets linting (Developer tier and above)
- CI/CD Platforms: Jenkins (plugin from Marketplace), GitHub Actions (Action Marketplace devsecure/scan-action@v2), GitLab CI/CD (include template), CircleCI/Travis CI/Bitbucket Pipelines (Docker orb/image)
- Collaboration Tools (Team/Enterprise): Slack (notifications for Critical findings, scan completion, auto-fix PR status, /devsecure commands), Microsoft Teams (Adaptive Cards with action buttons), Jira (auto-create tickets for Critical/High, bidirectional sync), Linear (issue syncing)
- Webhooks (Team/Enterprise): events include scan.completed, finding.created, pr.opened; JSON payload with finding details, RPS score, remediation status
- API Access: REST API available from Developer tier with rate limits (Developer: 100 req/hr, Team: 1,000 req/hr, Enterprise: custom)
- API endpoints: trigger scans, retrieve findings, download SBOMs, manage workspaces

## Q&A

### Q: What source control platforms does DevSecure support?
**A:** DevSecure integrates with GitHub (Cloud/Enterprise), GitLab (Cloud/Self-Managed), Bitbucket (Cloud/Data Center), and Azure DevOps. All tiers include source control integration with features like PR comments and status checks. (Source: devsecure_integrations.md)

### Q: Does DevSecure have IDE plugins?
**A:** Yes. DevSecure provides plugins for VSCode and all JetBrains IDEs (IntelliJ, PyCharm, WebStorm) offering real-time SAST and Secrets detection as you type, with inline quick-fix actions. Available in Developer tier and above. (Source: devsecure_integrations.md)

### Q: What CI/CD platforms are supported?
**A:** Jenkins (plugin), GitHub Actions (marketplace action), GitLab CI/CD (include template), CircleCI, Travis CI, and Bitbucket Pipelines (Docker image). CI/CD integration is available in Team and Enterprise tiers. (Source: devsecure_integrations.md)

### Q: Can DevSecure send notifications to Slack?
**A:** Yes, in Team and Enterprise tiers. Slack integration sends notifications for Critical findings, scan completion, and auto-fix PR status. You can also use /devsecure commands to check scan progress directly in Slack. (Source: devsecure_integrations.md)

### Q: Does DevSecure integrate with Jira?
**A:** Yes (Team/Enterprise). DevSecure can auto-create Jira issues for Critical/High findings with bidirectional sync—when you mark a finding as fixed in DevSecure, the Jira ticket status updates automatically. (Source: devsecure_integrations.md)

### Q: What are webhooks used for?
**A:** Webhooks (Team/Enterprise) allow custom integrations by sending JSON payloads for events like scan.completed, finding.created, or pr.opened. Use cases include SIEM forwarding, custom dashboards, or CRM lead scoring. (Source: devsecure_integrations.md)

### Q: What's the API rate limit?
**A:** Developer: 100 API requests/hour, Team: 1,000 requests/hour, Enterprise: custom rate limits. The REST API allows you to trigger scans, retrieve findings, download SBOMs, and manage workspaces programmatically. (Source: devsecure_integrations.md)

## Immutable Links
- Integrations Overview: https://docs.devsecure.com/integrations
- GitHub Integration: https://docs.devsecure.com/integrations/github
- IDE Plugins: https://docs.devsecure.com/integrations/ide
- API Documentation: https://docs.devsecure.com/api