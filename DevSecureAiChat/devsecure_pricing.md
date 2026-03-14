# DevSecure Pricing (2026)

## Facts
- Per-developer seat billing model
- Four tiers: Free (£0), Developer (£19/dev/month), Team (£29/dev/month), Enterprise (£49+/dev/month)
- Team minimum: 5 seats (£145/month base)
- Enterprise minimum: 20 seats (£980/month base)
- All plans include all 10 security engines (SAST, SCA, DAST, Secrets, IaC, Mobile, Malware, WordPress, SBOM, Vuln Management)
- Quotas scale proportionally after minimum seat thresholds
- Terminology updates (2026): "Dependency Scanning" (formerly SCA), "Outdated Software & IaC" (formerly IaC Scanner), "Baseline Risk Scoring" (formerly CVSS Prioritization)

## Q&A

### Q: How much does DevSecure cost?
**A:** DevSecure offers four pricing tiers: Free (£0 forever), Developer (£19/dev/month), Team (£29/dev/month with min. 5 seats = £145/month), and Enterprise (from £49/dev/month with min. 20 seats = £980/month). All tiers include access to all 10 security engines. (Source: devsecure_pricing.md)

### Q: What's included in the Free tier?
**A:** Free tier includes: 1 repository, 1 DAST domain, 1 mobile file/month, 7-day finding history, and Basic versions of SAST, Dependency Scanning, Secrets, DAST, Mobile, Malware, WordPress scanning. SBOM is view-only. No IDE plugins, CI/CD integration, or auto-fix PRs. (Source: devsecure_pricing.md)

### Q: What's the difference between Team and Enterprise tiers?
**A:** Team (£29/dev, min 5 seats): 50 repos, 10 DAST domains, Basic RBAC, Slack/Jira integration, 24-hour support. Enterprise (£49+/dev, min 20 seats): 500 repos, 300 DAST domains, Advanced RBAC, SSO/SAML, On-Premise deployment, 4-hour 24/7 support, Dedicated CSM, White-label reporting, Audit logs. (Source: devsecure_pricing.md)

### Q: How many auto-fix PRs do I get?
**A:** Developer tier: 3 auto-fix PRs per month. Team and Enterprise: Unlimited auto-fix PRs (fair use policy). Free tier does not include auto-fix capability. (Source: devsecure_pricing.md)

### Q: What are the workspace quotas?
**A:** Repositories: Free(1), Developer(10), Team(50), Enterprise(500). DAST Domains: Free(1), Developer(3), Team(10), Enterprise(300). Mobile files/month: Free(1), Developer(10), Team(50), Enterprise(unlimited fair-use). Finding history: Free(7 days), Developer(90 days), Team(1 year), Enterprise(up to 5 years). (Source: devsecure_pricing.md)

### Q: Does pricing include all security engines?
**A:** Yes, all four tiers include all 10 security engines: SAST, Dependency Scanning (SCA), DAST, Secrets Detection, Outdated Software & IaC, Mobile Security, Malware Detection, WordPress Security, SBOM Generation, and Vulnerability Management. Feature depth varies by tier. (Source: devsecure_pricing.md)

### Q: What integrations are included?
**A:** All tiers: Source Control (GitHub, GitLab, Bitbucket, Azure DevOps). Developer+: IDE Plugins (VSCode, IntelliJ). Team/Enterprise: CI/CD Integration, Slack/Teams, Jira/Linear, Webhooks, API Access. (Source: devsecure_pricing.md)

### Q: Is SSO/SAML available?
**A:** SSO/SAML is available only in the Enterprise tier. Team tier has Basic RBAC without SSO. (Source: devsecure_pricing.md)

### Q: Can I deploy DevSecure on-premise?
**A:** On-premise deployment and dedicated infrastructure are available only in the Enterprise tier. Requires Kubernetes cluster (k3s/k8s). Contact sales for deployment guide. (Source: devsecure_pricing.md)

### Q: What's the API rate limit?
**A:** Developer: 100 API requests/hour. Team: 1,000 requests/hour. Enterprise: Custom rate limits. Free tier has no API access. (Source: devsecure_pricing.md)

## Immutable Links
- View Pricing: https://devsecure.com/pricing
- Start Free Trial: https://devsecure.com/signup
- Contact Sales: https://devsecure.com/contact-sales
- Compare Plans: https://devsecure.com/pricing#compare