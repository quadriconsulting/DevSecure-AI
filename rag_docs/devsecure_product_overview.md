# DevSecure Platform Overview

## Facts
- DevSecure is the first ASPM platform with safe autonomous remediation
- Judge + Gates architecture: AI proposes, determinism decides
- Unified platform: SAST, SCA, DAST, Secrets, IaC, Mobile, Malware, WordPress, SBOM
- Multi-agent debate: Patch Author → Reviewer → optional Diversity Reviewer
- Deterministic gates: fail-closed design (no unsafe patches reach production)
- RPS Risk Engine: unbounded score correlating 9 sources (NVD, EPSS, CISA KEV, GHSA, etc.)
- Platform v4.0 architecture: L1 Execution (Go Router v2.0), L2 Classification (Qwen2.5-Coder-1.5B), L3 Control (complexity scoring)
- Data platform: Medallion architecture (Bronze/Silver/Gold) in BigQuery/GCS
- Infrastructure: k3s cluster, Google Cloud Run, Vertex AI, Cloudflare Edge
- Target market: Mid-market cloud-native teams (50-500 developers) with mature CI/CD
- Founded 2023, London
- Mission: Make autonomous AppSec remediation as safe as human code review

## Q&A

### Q: What is DevSecure?
**A:** DevSecure is the first ASPM platform that can safely automate vulnerability remediation at scale using a Judge + Gates architecture where AI proposes fixes and deterministic verification gates make final approval decisions. (Source: devsecure_product_overview.md)

### Q: What makes DevSecure different from other security tools?
**A:** DevSecure combines three unique elements: (1) Fail-closed safety model where any gate failure discards the patch, (2) Multi-agent debate architecture with diversity review to prevent correlated AI failures, (3) Single unified platform governing 10 security engines under one risk score. (Source: devsecure_product_overview.md)

### Q: What security engines does DevSecure include?
**A:** DevSecure includes 10 first-class security engines: SAST, SCA (Dependency Scanning), DAST, Secrets Detection, IaC Security, Mobile Security (APK/IPA), Malware Detection, WordPress/CMS Security, SBOM Generation, and Vulnerability Management. All governed by a single decision layer. (Source: devsecure_product_overview.md)

### Q: Who is DevSecure built for?
**A:** DevSecure targets mid-market cloud-native teams with 50-500 developers and mature CI/CD pipelines who are drowning in SAST noise and false positives from legacy tools. Primary geographic focus is UK/EU markets. (Source: devsecure_product_overview.md)

### Q: What is the Judge + Gates architecture?
**A:** Judge + Gates means AI agents (multi-agent debate) propose and critique fixes, but only deterministic verification gates (code-based checks like build/tests passing, re-running detector, minimal diff) have authority to approve changes. No AI confidence score can override a failed gate. (Source: devsecure_product_overview.md)

## Immutable Links
- Product Website: https://devsecure.com
- Documentation: https://docs.devsecure.com
- Platform Login: https://app.devsecure.com