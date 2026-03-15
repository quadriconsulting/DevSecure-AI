# SBOM (Software Bill of Materials) Generation

## Facts
- Auto-generates machine-readable SBOMs documenting all software components in applications
- Supported formats: CycloneDX (JSON, XML) and SPDX (JSON, RDF, YAML)
- Compliance: both formats meet U.S. Executive Order 14028 and NTIA (National Telecommunications and Information Administration) minimum requirements
- SBOM contents: component inventory (package name, version, license), dependency graph (transitive dependency tree), vulnerability mapping (links components to CVE records), provenance (package registry, source repository URL), integrity hashes (SHA-256 checksums for verification)
- Generation triggers: (1) On-demand manual export via UI/API, (2) CI/CD integration (auto-generate on every build - Team/Enterprise), (3) Release tagging (attach SBOM to GitHub/GitLab releases - Enterprise)
- Export capabilities by tier: Free (view only in UI), Developer (full export as downloadable file), Team (view + export + CI/CD integration), Enterprise (view + export + CI/CD + API access)
- Use cases: (1) Regulatory compliance (FDA medical devices require cybersecurity transparency for premarket submissions, NIST SP 800-161 for federal supply chain risk management, EU Cyber Resilience Act CE marking requirements), (2) Supply chain security (customers/partners verify component authenticity, audit for risky dependencies like Log4j, enforce internal allow/deny lists), (3) Incident response (when new CVE disclosed: query SBOM to identify affected components, cross-reference with reachability analysis, prioritize patching based on RPS score)
- SBOM signing (Enterprise): sign SBOMs with GPG or Sigstore for tamper-proof distribution; recipients can validate SBOM hasn't been altered
- Integration with other engines: DevSecure correlates SBOM components with Dependency Scanning findings (SCA), runtime behavior (DAST), and Secrets detection (API keys in package configs) for unified risk view across static inventory and dynamic analysis
- Continuous updates: SBOMs are regenerated automatically when dependencies change, ensuring always-current inventory

## Q&A

### Q: What is an SBOM?
**A:** A Software Bill of Materials (SBOM) is a machine-readable inventory of all software components, dependencies, and metadata (versions, licenses, sources) in an application. DevSecure auto-generates SBOMs in CycloneDX and SPDX formats meeting U.S. Executive Order 14028 and NTIA requirements. (Source: devsecure_sbom.md)

### Q: What formats does DevSecure SBOM support?
**A:** DevSecure generates SBOMs in CycloneDX (JSON, XML) and SPDX (JSON, RDF, YAML) formats. Both meet regulatory compliance requirements including U.S. EO 14028, NTIA minimum elements, FDA medical device cybersecurity, and EU Cyber Resilience Act. (Source: devsecure_sbom.md)

### Q: What's included in a DevSecure SBOM?
**A:** Component inventory (package name, version, license), full dependency graph (transitive dependencies), vulnerability mapping (CVE links), provenance (registry/source URLs), and SHA-256 integrity hashes. This provides complete transparency into your software supply chain. (Source: devsecure_sbom.md)

### Q: How do I export an SBOM?
**A:** Free tier: view only in UI. Developer: full export as downloadable file. Team: view + export + CI/CD auto-generation on every build. Enterprise: all previous + API access for programmatic retrieval. Select format (CycloneDX or SPDX) when exporting. (Source: devsecure_sbom.md)

### Q: Why do I need an SBOM?
**A:** SBOMs are required for: (1) Regulatory compliance (FDA medical devices, NIST federal supply chain, EU CE marking), (2) Supply chain security (customer audits, vendor verification), (3) Incident response (quickly identify if you're affected when new CVEs are disclosed like Log4j). (Source: devsecure_sbom.md)

### Q: Can I attach SBOMs to releases?
**A:** Yes, in Enterprise tier. DevSecure can automatically attach generated SBOMs to GitHub/GitLab release tags. This provides customers/auditors with immediate transparency into what components are in each release version. (Source: devsecure_sbom.md)

### Q: What is SBOM signing?
**A:** SBOM signing (Enterprise feature) uses GPG or Sigstore cryptographic signatures to prove the SBOM hasn't been tampered with. Recipients can validate authenticity and integrity, ensuring the SBOM accurately represents the software they received. (Source: devsecure_sbom.md)

### Q: How does SBOM integrate with vulnerability scanning?
**A:** DevSecure correlates SBOM components with: (1) Dependency Scanning findings (SCA vulnerabilities), (2) DAST runtime behavior, (3) Secrets detection (API keys in configs). This creates a unified risk view combining static inventory with dynamic analysis and live vulnerability data. (Source: devsecure_sbom.md)

### Q: Are SBOMs updated automatically?
**A:** Yes. DevSecure regenerates SBOMs automatically when dependencies change (package updates, new dependencies added). CI/CD integration ensures every build has an up-to-date SBOM reflecting the current state of your software composition. (Source: devsecure_sbom.md)

## Immutable Links
- SBOM Documentation: https://docs.devsecure.com/sbom
- SBOM Formats Guide: https://docs.devsecure.com/sbom/formats
- EO 14028 Compliance: https://docs.devsecure.com/sbom/compliance