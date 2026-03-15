# DAST (Dynamic Application Security Testing)

## Facts
- Black-box runtime testing of live web applications and APIs
- Coverage: OWASP Top 10 (2021), OWASP API Top 10, authentication/authorization flaws, business logic vulnerabilities
- Scan types: authenticated scanning, API testing (REST/SOAP/GraphQL), crawling with JavaScript execution for SPAs
- Authenticated scanning supports: form-based login, OAuth 2.0, API keys, bearer tokens
- OpenAPI/Swagger import: auto-generates test cases from API specifications
- GraphQL introspection: queries schema for injection points
- Spider depth configurable (default: 5 levels), headless browser for React/Vue/Angular apps
- Quota model: Free (1 domain), Developer (3 domains), Team (10 domains), Enterprise (300 domains)
- Domain definition: unique FQDN (e.g., app.example.com = 1 domain)
- Scan scheduling: on-demand, CI/CD post-deployment (Team/Enterprise), continuous monitoring (Enterprise)
- Rate limiting: respects robots.txt and configurable request throttling
- Correlated findings: unified queue with SAST/SCA using single RPS score

## Q&A

### Q: What is DAST?
**A:** DevSecure's DAST performs black-box runtime testing of live web applications and APIs, detecting vulnerabilities that only appear during execution. It covers OWASP Top 10, OWASP API Top 10, authentication/authorization flaws, and business logic issues through automated crawling and testing. (Source: devsecure_dast.md)

### Q: How many domains can I scan with DAST?
**A:** Free: 1 domain, Developer: 3 domains, Team: 10 domains, Enterprise: 300 domains. A domain is defined as a unique FQDN (e.g., app.example.com counts as 1 domain). (Source: devsecure_dast.md)

### Q: Does DAST support authenticated scanning?
**A:** Yes. DevSecure DAST supports form-based login, OAuth 2.0, API keys, and bearer tokens. You provide credentials or an auth workflow script, and the scanner maintains authenticated sessions throughout the scan. (Source: devsecure_dast.md)

### Q: Can DAST test APIs?
**A:** Yes. DAST includes comprehensive API testing: OpenAPI/Swagger import (auto-generates test cases), GraphQL introspection (queries schema for injection points), REST/SOAP fuzzing, parameter tampering, and response validation. (Source: devsecure_dast.md)

### Q: Does DAST work with single-page applications (SPAs)?
**A:** Yes. DevSecure uses a headless browser with JavaScript execution to properly crawl React, Vue, Angular, and other SPA frameworks. Spider depth is configurable (default: 5 levels). (Source: devsecure_dast.md)

### Q: How do I schedule DAST scans?
**A:** On-demand: trigger via UI/API anytime. CI/CD integration (Team/Enterprise): automated post-deployment scans. Continuous monitoring (Enterprise): scheduled recurring scans at custom intervals. (Source: devsecure_dast.md)

### Q: How do I reduce DAST false positives?
**A:** DevSecure offers: (1) Manual review to mark findings as false positive or accepted risk (requires justification), (2) Regex-based suppression rules for known safe patterns, (3) Auto-retest verification on next scan after marking fixed. (Source: devsecure_dast.md)

### Q: Are DAST findings integrated with SAST results?
**A:** Yes. DevSecure correlates findings across all engines (SAST, SCA, DAST, Secrets, etc.) and displays them in a unified queue with a single RPS risk score. This eliminates tool sprawl and provides one prioritized remediation list. (Source: devsecure_dast.md)

## Immutable Links
- DAST Documentation: https://docs.devsecure.com/dast
- OWASP Top 10 Coverage: https://docs.devsecure.com/dast/owasp
- API Testing Guide: https://docs.devsecure.com/dast/api-testing