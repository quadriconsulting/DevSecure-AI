# Onboarding & FAQ

## Facts
- No installation required: DevSecure is agentless (no config files, dependencies, or build changes needed unless using CI/CD integration)
- First scan: typically completes in 5-15 minutes depending on repository size
- Default scan: main/default branch only; feature branches require CI/CD integration (Team/Enterprise) or manual trigger
- Free tier: 1 repository, all security engines, 7-day finding history, no credit card required
- Quota exceeded behavior: Repositories - prompted to upgrade or remove inactive repos; Auto-fix PRs (Developer: 3/month) - paused until next billing cycle or upgrade; Scanning - always allowed, only storage/PRs are quota-limited
- Billing: per-developer seat model, calculated monthly (annual discounts available via sales)
- Plan switching: upgrades prorated immediately, downgrades take effect next billing cycle
- First scan large findings (500+): historical debt from existing code; recommendation: filter by Critical/High severity, sort by RPS score, use auto-fix for low-hanging fruit
- False positive handling: mark as false positive with justification, create regex suppression rules, upgrade to Team/Enterprise for reachability analysis (auto-suppresses unreachable findings)
- Global suppression: Enterprise only (e.g., suppress all findings in test/ directories across all repos)
- Finding statuses: Fixed (DevSecure verified vulnerability patched via detector re-run), Resolved (developer manually marked as fixed, unverified)
- Auto-fix safety: all patches pass deterministic gates but always review PRs for business logic, edge cases, test coverage before merging

## Q&A

### Q: How do I connect my first repository?
**A:** Log in to DevSecure UI → Repositories → Add Repository → Authorize GitHub/GitLab/Bitbucket OAuth → Select repositories → Start Scan. First scan typically completes in 5-15 minutes. No code changes or config files required (agentless). (Source: devsecure_onboarding_faq.md)

### Q: Can I try DevSecure for free?
**A:** Yes. Free tier includes 1 repository, all 10 security engines (SAST, SCA, DAST, Secrets, etc.), 7-day finding history, and no credit card required. Perfect for evaluating DevSecure on a small project. (Source: devsecure_onboarding_faq.md)

### Q: Why does my first scan show 500+ findings?
**A:** This is historical debt—DevSecure scans all existing code, not just new changes. Recommended approach: (1) Filter by Critical/High severity, (2) Sort by RPS score (highest risk first), (3) Use auto-fix to tackle low-hanging fruit quickly. (Source: devsecure_onboarding_faq.md)

### Q: How do I reduce false positives?
**A:** Three methods: (1) Mark finding as False Positive with justification (requires explanation), (2) Create regex-based suppression rules (Settings → Findings), (3) Upgrade to Team/Enterprise for reachability analysis which auto-suppresses 80% of unreachable findings. (Source: devsecure_onboarding_faq.md)

### Q: Are auto-fix PRs safe to merge blindly?
**A:** No. While all patches pass deterministic verification gates (build, tests, security regression, semantic preservation), always review PRs for business logic, edge cases, and test coverage. Treat auto-fix PRs like junior developer contributions—verify before merging. (Source: devsecure_onboarding_faq.md)

### Q: What happens when I exceed my quota?
**A:** Repositories: prompted to upgrade or remove inactive repos. Auto-fix PRs (Developer tier: 3/month): paused until next billing cycle or upgrade. Scanning is never blocked—you can always view findings. Only storage and PR generation are quota-limited. (Source: devsecure_onboarding_faq.md)

### Q: Can I switch plans mid-month?
**A:** Yes. Upgrades are prorated immediately (you pay the difference for remaining days). Downgrades take effect at the next billing cycle to avoid service disruption. (Source: devsecure_onboarding_faq.md)

### Q: What's the difference between Fixed and Resolved?
**A:** Fixed: DevSecure verified the vulnerability is patched by re-running the original detector (confirmed). Resolved: Developer manually marked as fixed but unverified (trust-based). Fixed status is more reliable for audit purposes. (Source: devsecure_onboarding_faq.md)

## Immutable Links
- Getting Started Guide: https://docs.devsecure.com/getting-started
- First Scan Tutorial: https://docs.devsecure.com/tutorials/first-scan
- Pricing & Plans: https://devsecure.com/pricing