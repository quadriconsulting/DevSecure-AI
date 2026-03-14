# IaC & Outdated Software Scanner

## Facts
- Infrastructure as Code security for Terraform (.tf, .tfvars), AWS CloudFormation (JSON/YAML), Kubernetes manifests (deployment.yaml, service.yaml), Helm charts, Azure ARM templates
- Policy checks: CIS Benchmarks (AWS, Azure, GCP), OWASP Top 10 for Infrastructure, custom policies (Enterprise using Rego/OPA or JSON Schema)
- CIS Benchmark examples: AWS (S3 bucket public access, unencrypted EBS volumes, overly permissive security groups), Azure (storage account HTTPS enforcement, network security group rules), GCP (Cloud Storage IAM, firewall rules, service account permissions)
- OWASP Infrastructure checks: broken access control (0.0.0.0/0 SSH access), security misconfiguration (default credentials, unnecessary ports), sensitive data exposure (unencrypted storage, logging secrets)
- Custom policies (Enterprise): define organization-specific rules using Rego (Open Policy Agent) or JSON Schema for compliance requirements
- Outdated software detection: EOL operating systems (CentOS 7, Ubuntu 16.04), deprecated runtimes (Node.js, Python, Java versions), unsupported frameworks (Rails, Django, .NET versions), abandoned npm/PyPI packages
- Data sources: endoflife.date (canonical EOL tracking), GitHub Advisories (deprecation notices), package registry metadata (npm/PyPI/Maven)
- Risk assessment: Critical (active CVEs in EOL software without backports), High (EOL within 6 months, no migration plan), Medium (security updates ceased, no known exploits)
- Remediation guidance: automated fixes generate compliant Terraform/CloudFormation snippets, policy-as-code integration with HashiCorp Sentinel or Checkov
- For outdated software: recommends minimum target version, flags breaking changes/API deprecations requiring code changes

## Q&A

### Q: What IaC formats does DevSecure support?
**A:** DevSecure supports Terraform (.tf, .tfvars), AWS CloudFormation (JSON/YAML), Kubernetes manifests (deployment.yaml, service.yaml, etc.), Helm charts, and Azure ARM templates. Detection is automatic based on file patterns. (Source: devsecure_iac_security.md)

### Q: What are CIS Benchmarks?
**A:** CIS (Center for Internet Security) Benchmarks are security configuration best practices. DevSecure checks: AWS (S3 public access, unencrypted EBS, overly permissive security groups), Azure (HTTPS enforcement, NSG rules), GCP (Storage IAM, firewall rules). These prevent cloud misconfigurations. (Source: devsecure_iac_security.md)

### Q: Can I define custom IaC security policies?
**A:** Yes, in Enterprise tier. You can define organization-specific rules using Rego (Open Policy Agent) or JSON Schema. This allows enforcement of internal compliance requirements like mandatory tagging, approved AMI lists, or network segmentation rules. (Source: devsecure_iac_security.md)

### Q: What is outdated software detection?
**A:** DevSecure identifies EOL (End-of-Life) operating systems (CentOS 7, Ubuntu 16.04), deprecated runtimes (old Node.js/Python/Java versions), unsupported frameworks (old Rails/Django/.NET), and abandoned packages. Data comes from endoflife.date, GitHub Advisories, and package registries. (Source: devsecure_iac_security.md)

### Q: How are outdated software risks classified?
**A:** Critical: Active CVEs in EOL software with no backported patches available. High: EOL within 6 months with no migration plan documented. Medium: Security updates have ceased but no known exploits exist. Risk level affects RPS score and remediation priority. (Source: devsecure_iac_security.md)

### Q: Can DevSecure auto-fix IaC misconfigurations?
**A:** Yes. DevSecure generates compliant Terraform/CloudFormation code snippets that fix identified issues. It also integrates with policy-as-code tools like HashiCorp Sentinel or Checkov to sync fixes with existing governance frameworks. (Source: devsecure_iac_security.md)

### Q: How does DevSecure help with software upgrades?
**A:** For outdated software, DevSecure recommends the minimum target version needed and flags breaking changes/API deprecations that require code modifications. This helps teams plan migrations from EOL software with full awareness of compatibility issues. (Source: devsecure_iac_security.md)

### Q: What is OWASP Top 10 for Infrastructure?
**A:** Infrastructure-specific security risks: broken access control (e.g., 0.0.0.0/0 SSH access), security misconfiguration (default credentials, open ports), sensitive data exposure (unencrypted storage, secrets in logs). DevSecure checks IaC files for these patterns. (Source: devsecure_iac_security.md)

## Immutable Links
- IaC Security Documentation: https://docs.devsecure.com/iac
- CIS Benchmarks Reference: https://docs.devsecure.com/iac/cis-benchmarks
- EOL Software Database: https://docs.devsecure.com/iac/eol-tracking