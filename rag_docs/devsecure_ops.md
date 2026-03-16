
# DevSecure FAQ and User Guide

## Platform Overview

### What is DevSecure?
DevSecure is an all‑in‑one Application Security Posture Management (ASPM) platform designed for modern development teams. It helps organizations detect, prioritize, and remediate security vulnerabilities across the entire software development lifecycle.

The platform combines multiple security capabilities in a unified environment including:

- Static Application Security Testing (SAST)
- Software Composition Analysis (SCA)
- Dynamic Application Security Testing (DAST)
- Secrets Detection
- Infrastructure‑as‑Code (IaC) scanning
- SBOM generation
- Malware detection
- Mobile application scanning
- WordPress security analysis

DevSecure integrates directly with developer workflows, CI/CD pipelines, and version control platforms.

---

## Getting Started

### How do I create a DevSecure account?
To start using DevSecure:

1. Sign up through the DevSecure dashboard.
2. Verify your email address.
3. Create or join a workspace.
4. Connect your source code repositories.
5. Configure scanning policies and integrations.

Once your repositories are connected, DevSecure automatically begins scanning your projects.

---

### What is a workspace?
A workspace represents a secure environment for your organization within DevSecure. It allows teams to:

- Manage repositories
- Configure security policies
- Invite team members
- View vulnerability dashboards
- Manage integrations and scanning settings

Workspaces help separate environments for different teams or organizations.

---

## Repository Integration

### Which version control systems are supported?
DevSecure integrates with major Git platforms including:

- GitHub
- GitLab
- Bitbucket
- Azure DevOps

Connecting repositories allows DevSecure to automatically scan code during development.

---

### How do I connect a repository?
To connect a repository:

1. Open **Integrations** in the DevSecure dashboard.
2. Select your Git provider.
3. Authorize DevSecure to access repositories.
4. Choose the repositories you want scanned.

DevSecure will begin indexing and scanning code immediately.

---

## Code Scanning

### What does DevSecure code scanning detect?
DevSecure analyzes source code to detect:

- Injection vulnerabilities
- Unsafe deserialization
- Broken authentication patterns
- Insecure cryptographic usage
- Hardcoded credentials
- Dependency vulnerabilities
- Misconfigured infrastructure definitions

Scanning occurs both during repository analysis and during pull requests.

---

### Can DevSecure scan code locally?
Yes. Developers can run DevSecure scans locally before pushing code to remote repositories.

Local scanning helps developers:

- catch vulnerabilities early
- prevent secrets from entering commits
- validate fixes before creating pull requests

---

### Does DevSecure scan pull requests?
Yes. DevSecure automatically scans pull requests and code changes.

This enables teams to:

- detect vulnerabilities before merging
- block insecure changes
- receive remediation guidance within the development workflow

---

## Secrets Detection

### What is secret detection?
Secret detection identifies exposed credentials in code repositories.

Examples include:

- API keys
- database passwords
- cloud access tokens
- private cryptographic keys
- authentication tokens

DevSecure scans repositories continuously to detect leaked secrets.

---

### What should I do if a secret is detected?
If a secret is detected:

1. Revoke or rotate the credential immediately.
2. Remove the secret from the codebase.
3. Replace it with secure environment variables or secret management systems.
4. Commit the fix and rerun the scan.

---

## Autonomous Remediation

### What is automated vulnerability remediation?
DevSecure can automatically generate code patches to fix detected vulnerabilities.

The system uses a multi‑stage validation process:

1. AI generates a remediation patch.
2. The patch is reviewed by automated security checks.
3. Deterministic validation gates verify safety.
4. Only safe fixes are proposed to developers.

This ensures automated patches remain safe and reliable.

---

### How are automated fixes delivered?
Fixes can be delivered through:

- Pull requests with suggested patches
- Inline remediation guidance
- Developer workflow notifications

Developers can review and approve fixes before merging.

---

## Dynamic Application Security Testing

### What is runtime security testing?
Runtime testing analyzes live applications and services.

This allows DevSecure to detect:

- exposed endpoints
- insecure API configurations
- authentication flaws
- injection vulnerabilities in running applications

Runtime scanning complements static code analysis.

---

### Can DevSecure scan APIs?
Yes. DevSecure supports API scanning for REST and web APIs.

The platform can test:

- authentication flows
- request validation
- API authorization issues
- insecure data exposure

---

## Dependency and Supply Chain Security

### What is software composition analysis?
Software Composition Analysis (SCA) detects vulnerabilities in open‑source dependencies.

DevSecure analyzes dependency manifests such as:

- package.json
- requirements.txt
- pom.xml
- go.mod

It identifies vulnerable components and suggests safe upgrade paths.

---

### What is an SBOM?
An SBOM (Software Bill of Materials) is a list of all components used within an application.

DevSecure generates SBOM reports that help organizations:

- understand software dependencies
- manage supply chain risk
- comply with security regulations

---

## Infrastructure Security

### What is Infrastructure‑as‑Code scanning?
DevSecure analyzes infrastructure configuration files to detect security misconfigurations.

Supported formats include:

- Terraform
- Kubernetes manifests
- cloud configuration templates

Common findings include:

- exposed storage buckets
- overly permissive access policies
- insecure network configurations

---

## Security Dashboard

### Where can I view vulnerabilities?
All detected vulnerabilities appear in the DevSecure dashboard.

The dashboard provides:

- vulnerability severity levels
- remediation guidance
- affected repositories
- security trends over time

Teams can filter results by project, severity, or vulnerability type.

---

### How are vulnerabilities prioritized?
DevSecure prioritizes vulnerabilities using risk‑based scoring that considers:

- exploitability
- known exploitation activity
- dependency criticality
- code reachability

This helps teams focus on the most impactful security issues.

---

## Notifications and Alerts

### How will I be notified about vulnerabilities?
DevSecure supports notifications through:

- dashboard alerts
- pull request comments
- email notifications
- CI/CD pipeline status checks

This ensures vulnerabilities are surfaced directly in developer workflows.

---

## Best Practices

### Recommended workflow

1. Connect repositories to DevSecure.
2. Enable pull request scanning.
3. Review vulnerabilities regularly.
4. Apply automated remediation when available.
5. Monitor dashboards for trends.

---

### Security culture

DevSecure works best when security is integrated into development workflows. Encourage teams to:

- run scans early
- review security alerts promptly
- prioritize high‑risk vulnerabilities
- maintain dependency hygiene
