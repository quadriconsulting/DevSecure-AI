# Dependency Scanning (SCA)

## Facts
- Software Composition Analysis across all major package managers: npm, PyPI, Maven, NuGet, RubyGems, Go modules, Cargo, Composer, CocoaPods, Gradle
- Multi-source vulnerability intelligence: NVD, GHSA, OSV, CVEfixes, MoreFixes
- Daily sync from all authoritative sources
- Reachability analysis (Team/Enterprise): dataflow tracing from entry points to vulnerable functions
- 80% of vulnerable dependencies are unreachable - reachability filtering prevents alert fatigue
- RPS Risk Scoring: unbounded score = (0.4 × CVSS/10) × (0.3 × EPSS_percentile) × (0.3 × CISA_KEV_flag) × 100
- SBOM integration: CycloneDX and SPDX format generation
- Auto-fix capabilities: version bumping PRs, transitive dependency resolution
- License scanning: identifies restrictive licenses (GPL, AGPL) that may violate commercial policies
- Quotas: Developer (3 auto-fix PRs/month), Team/Enterprise (unlimited fair use)

## Q&A

### Q: What is Dependency Scanning (SCA)?
**A:** DevSecure's Software Composition Analysis identifies vulnerabilities in open-source dependencies across 10+ package managers (npm, PyPI, Maven, etc.). It pulls from authoritative sources (NVD, GHSA, OSV, CVEfixes, MoreFixes) with daily updates and provides reachability analysis to filter out unexploitable vulnerabilities. (Source: devsecure_dependency_scanning.md)

### Q: What is reachability analysis?
**A:** Reachability analysis (Team/Enterprise feature) performs dataflow tracing from application entry points to vulnerable functions. If no exploitable path exists, the finding is marked "Unreachable" and de-prioritized or suppressed. This solves the problem that 80% of vulnerable dependencies are never actually called at runtime. (Source: devsecure_dependency_scanning.md)

### Q: What vulnerability sources does DevSecure use?
**A:** DevSecure pulls from 5 authoritative sources: NVD (National Vulnerability Database), GHSA (GitHub Security Advisories), OSV (Open Source Vulnerabilities), CVEfixes (verified patch commits), and MoreFixes (extended remediation dataset). All sources sync daily for up-to-date coverage. (Source: devsecure_dependency_scanning.md)

### Q: How does RPS scoring work for dependencies?
**A:** RPS (Risk Priority Score) is unbounded: RPS = (0.4 × CVSS/10) × (0.3 × EPSS_percentile) × (0.3 × CISA_KEV_flag) × 100. CVSS provides severity baseline, EPSS provides real-world exploitation likelihood, and CISA KEV is a binary flag for known exploited vulnerabilities. This correlates multiple risk signals into one auditable score. (Source: devsecure_dependency_scanning.md)

### Q: Can DevSecure auto-fix dependency vulnerabilities?
**A:** Yes. DevSecure can auto-generate PRs for: (1) Version bumping to patched versions (when no breaking changes detected), (2) Transitive dependency resolution (identifying minimum-impact upgrade paths for nested dependencies). Developer tier: 3 auto-fix PRs/month. Team/Enterprise: unlimited (fair use). (Source: devsecure_dependency_scanning.md)

### Q: What SBOM formats does DevSecure support?
**A:** DevSecure generates SBOMs in CycloneDX (JSON/XML) and SPDX (JSON/RDF) formats, meeting U.S. Executive Order 14028 and NTIA minimum requirements. Free tier: view only. Developer: full export. Team: CI/CD integration. Enterprise: API access. (Source: devsecure_dependency_scanning.md)

### Q: Does DevSecure scan dependency licenses?
**A:** Yes. DevSecure identifies restrictive licenses (GPL, AGPL, etc.) that may violate commercial policies. License data is pulled from package registries and displayed alongside vulnerability findings for compliance review. (Source: devsecure_dependency_scanning.md)

### Q: Which package managers are supported?
**A:** DevSecure supports npm (JavaScript), PyPI (Python), Maven (Java), NuGet (C#/.NET), RubyGems (Ruby), Go modules, Cargo (Rust), Composer (PHP), CocoaPods (iOS), and Gradle (Java/Android). Detection is automatic based on manifest files in the repository. (Source: devsecure_dependency_scanning.md)

## Immutable Links
- SCA Documentation: https://docs.devsecure.com/sca
- SBOM Guide: https://docs.devsecure.com/sca/sbom
- Reachability Analysis: https://docs.devsecure.com/sca/reachability