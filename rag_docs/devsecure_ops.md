# DevSecure Knowledge Base (RAG Source)


## Getting Started

### What is DevSecure?
DevSecure is an Application Security Posture Management (ASPM) platform that helps development teams detect, prioritize, and remediate vulnerabilities across code, dependencies, infrastructure, and running applications. It integrates directly with developer workflows, CI/CD pipelines, and repository platforms.

### What problems does DevSecure solve?
DevSecure centralizes multiple security tools into a single platform so teams can detect vulnerabilities earlier, reduce security tool sprawl, and remediate issues faster without interrupting development workflows.

### Who typically uses DevSecure?
DevSecure is used by developers, security engineers, DevOps teams, and platform engineers who want to embed security checks directly into their development pipelines.

### How do I create a DevSecure account?
Sign up through the DevSecure platform, verify your email address, create or join a workspace, and connect your repositories to begin scanning.

### What is a workspace in DevSecure?
A workspace represents an isolated environment for an organization or team where repositories, scans, security policies, and users are managed.

### How do I invite team members?
Workspace administrators can invite members from the workspace settings page and assign appropriate roles such as administrator, developer, or security reviewer.

### How long does setup take?
Most teams can connect their repositories and begin receiving security findings within minutes after authorizing repository access.

### Do I need to install an agent?
No agent is required. DevSecure connects directly to your repository providers and CI/CD pipelines.

### What programming languages are supported?
DevSecure supports multiple languages commonly used in modern development including JavaScript, Python, Go, Java, and others.

### Can DevSecure scan private repositories?
Yes. Once authorized, DevSecure can scan private repositories securely using read-only repository access.


## Repository Integration

### Which repository platforms are supported?
DevSecure integrates with major Git platforms including GitHub, GitLab, Bitbucket, and Azure DevOps.

### How do I connect a repository?
Authorize DevSecure to access your repository provider and select the repositories you want scanned.

### What happens after connecting a repository?
DevSecure indexes the repository and begins scanning code, dependencies, secrets, and infrastructure definitions.

### Does DevSecure scan pull requests automatically?
Yes. Pull requests are scanned automatically to detect new vulnerabilities before code is merged.

### Can DevSecure scan multiple repositories?
Yes. Workspaces can connect and monitor multiple repositories simultaneously.

### Does DevSecure support monorepos?
Yes. DevSecure can scan monolithic repositories containing multiple services or applications.

### What permissions does DevSecure require?
DevSecure requires access to repository metadata and code to perform security analysis.

### Can I disconnect a repository?
Yes. Administrators can remove repositories from the workspace at any time.

### How often are repositories scanned?
Repositories are scanned whenever code changes occur, such as commits or pull requests.

### Can DevSecure scan forks?
Yes, as long as the fork is part of the connected repository environment.


## SAST

### What does DevSecure static code scanning detect?
DevSecure analyzes source code to detect vulnerabilities such as injection flaws, insecure cryptography usage, authentication issues, and unsafe data handling.

### How does static analysis work?
Static analysis examines the source code without executing the program, identifying risky patterns and insecure constructs.

### Does DevSecure detect OWASP Top 10 vulnerabilities?
Yes. DevSecure detects many common vulnerabilities listed in the OWASP Top 10.

### Can DevSecure analyze pull request changes only?
Yes. Pull request scanning focuses on the modified code so developers can fix issues early.

### Can developers run scans locally?
Yes. Developers can run local scans before committing code to detect vulnerabilities earlier.

### Why was my code flagged as vulnerable?
The scan detected patterns that match known insecure coding practices or vulnerability signatures.

### How do I fix a SAST finding?
Review the remediation guidance provided by DevSecure and update the affected code accordingly.

### Can SAST detect unreachable vulnerabilities?
DevSecure highlights findings and may indicate if the code path appears reachable or risky.

### Does static analysis slow down builds?
DevSecure is optimized to run efficiently alongside development workflows.

### Can DevSecure analyze infrastructure definitions in code?
Yes. Infrastructure-as-Code files can also be scanned for misconfigurations.


## Secrets

### What is secret detection?
Secret detection identifies exposed credentials such as API keys, tokens, and passwords in source code.

### Which secrets can be detected?
Examples include cloud access keys, API tokens, database passwords, and cryptographic keys.

### How often are repositories scanned for secrets?
Repositories are scanned continuously when code changes occur.

### What should I do if a secret is detected?
Immediately revoke the secret, remove it from the codebase, and rotate the credential.

### Can DevSecure prevent secrets from being committed?
Developers can run local scans before commits to prevent secrets from entering the repository.

### Does DevSecure detect secrets in pull requests?
Yes. Pull request scanning includes secret detection.

### What happens after a secret is detected?
The platform alerts the team and highlights the file location containing the secret.

### Can secrets be removed from scan history?
Once removed from the codebase and rescanned, the issue can be marked resolved.

### Does DevSecure scan commit history?
Some scans may detect secrets in historical commits if they remain present.

### How can teams prevent secret leaks?
Use secret managers, environment variables, and avoid hardcoding credentials.


## SCA

### What is Software Composition Analysis?
SCA analyzes open-source dependencies to identify known vulnerabilities.

### Which files are analyzed for dependencies?
Common dependency files include package.json, requirements.txt, pom.xml, and go.mod.

### How does DevSecure detect vulnerable libraries?
It compares dependency versions against vulnerability databases.

### Can DevSecure suggest safe upgrades?
Yes. DevSecure recommends dependency versions that resolve vulnerabilities.

### Can DevSecure create upgrade pull requests?
The platform can generate remediation guidance or automated PRs for some upgrades.

### What if a dependency cannot be upgraded?
Developers may apply mitigations or alternative libraries.

### Does DevSecure track transitive dependencies?
Yes. Indirect dependencies are also analyzed.

### How are dependency risks prioritized?
Risk scoring considers severity, exploitability, and application exposure.

### Can DevSecure analyze container images?
If container dependencies are included in manifests they may be analyzed.

### How often are vulnerability databases updated?
Security intelligence sources are updated regularly to track newly disclosed issues.


## DAST

### What is dynamic application security testing?
DAST analyzes running applications to detect vulnerabilities during execution.

### How does runtime scanning work?
The scanner sends requests to application endpoints to identify vulnerabilities.

### What vulnerabilities can DAST detect?
Common findings include injection vulnerabilities, misconfigurations, and exposed endpoints.

### Can DevSecure scan APIs?
Yes. API endpoints can be scanned to detect authentication or data exposure issues.

### Does DevSecure scan staging environments?
Yes. Teams can configure scanning targets for staging or testing environments.

### Can authenticated scans be performed?
Applications can be scanned with authentication workflows when configured.

### What is attack surface monitoring?
It identifies externally exposed services and endpoints.

### Can DevSecure detect exposed APIs?
Yes. Surface monitoring helps detect exposed services.

### Does DAST replace SAST?
No. Both approaches complement each other.

### How are runtime findings verified?
Findings include reproduction details for developers.


## Remediation

### What is autonomous remediation?
DevSecure can propose patches that fix detected vulnerabilities automatically.

### How are automated patches validated?
Generated fixes pass through validation checks and deterministic gates.

### What happens if a patch fails validation?
Developers are notified and must manually review or adjust the fix.

### How are fixes delivered?
Automated fixes can appear as pull requests or inline suggestions.

### Can developers review fixes before merging?
Yes. All patches should be reviewed before merging.

### Are automated fixes always available?
Not all vulnerabilities support automated remediation.

### How does DevSecure ensure safe fixes?
Validation gates check compilation, tests, and security rules.

### What if an automated fix conflicts with existing code?
Developers may need to resolve conflicts manually.

### Can remediation suggestions be customized?
Security policies may influence remediation workflows.

### How quickly can vulnerabilities be fixed?
With automation, many fixes can be applied quickly after detection.


## SBOM

### What is an SBOM?
An SBOM lists all components and dependencies used in an application.

### Why is an SBOM important?
It helps organizations understand supply chain risk.

### Can DevSecure generate SBOM reports?
Yes. SBOM generation is supported.

### What formats can SBOMs use?
Common formats include CycloneDX and SPDX.

### Can SBOMs help with compliance?
Yes. They support regulatory and security requirements.

### Does the SBOM include transitive dependencies?
Yes. Nested dependencies may be included.

### How often should SBOMs be generated?
Typically during builds or major releases.

### Can SBOMs identify vulnerable components?
Yes. SBOMs can be cross-referenced with vulnerability databases.

### Who uses SBOM reports?
Security teams, compliance teams, and developers.

### Where can I export the SBOM?
The DevSecure dashboard allows exporting reports.


## Dashboard

### Where can I view vulnerabilities?
The DevSecure dashboard centralizes all detected vulnerabilities.

### How are findings organized?
Findings can be filtered by repository, severity, and type.

### Can I track vulnerability trends?
Yes. The dashboard provides historical analytics.

### Can vulnerabilities be assigned to developers?
Teams may assign findings for remediation.

### How do I mark a vulnerability resolved?
After fixing the issue, the next scan will confirm resolution.

### Can I filter findings by severity?
Yes. Severity filters help prioritize work.

### Does the dashboard show remediation guidance?
Each finding includes guidance and context.

### Can I export reports?
Security reports can be exported for audits.

### How does DevSecure prioritize issues?
Prioritization considers severity, exploitability, and exposure.

### Can security policies be configured?
Organizations can define policies affecting scan behavior.

### Operational Scenario 1
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 2
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 3
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 4
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 5
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 6
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 7
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 8
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 9
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 10
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 11
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 12
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 13
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 14
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 15
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 16
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 17
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 18
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 19
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 20
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 21
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 22
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 23
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 24
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 25
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 26
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 27
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 28
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 29
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.

### Operational Scenario 30
Review the DevSecure dashboard findings, follow remediation guidance, and rerun the scan to confirm the issue is resolved.
