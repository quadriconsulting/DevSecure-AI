# Secrets Detection

## Facts
- Identifies hardcoded credentials, API keys, tokens, and sensitive data in source code and configuration files
- Detection methods: entropy analysis (Shannon entropy > 4.5 bits/char), regex pattern library (200+ patterns), historical Git commit scanning
- Pattern library covers major SaaS providers: AWS Access Keys (AKIA...), Stripe API Keys (sk_live_...), GitHub tokens (ghp_...), JWT tokens (eyJ...), RSA/SSH private keys (-----BEGIN RSA PRIVATE KEY-----)
- Scans entire Git history, not just current branch - deleted files still exploitable if repo was/is public
- Severity classification: Critical (live production credentials with high privileges), High (active API keys with sensitive scope), Medium (test/sandbox credentials), Low (expired tokens, placeholder values)
- Auto-remediation capabilities: generate PRs to replace hardcoded secrets with environment variable references, add entries to .gitignore, integrate with secret managers (AWS Secrets Manager, HashiCorp Vault)
- Pre-commit hooks: block commits containing new secrets (IDE plugin, Developer tier and above)
- PR checks: fail build if secrets detected in diff (Team/Enterprise)
- Supported file types: all source code languages, config files (JSON, YAML, TOML, .env), Docker/Kubernetes manifests, Terraform state files

## Q&A

### Q: How does DevSecure detect secrets?
**A:** DevSecure uses three methods: (1) Entropy analysis for high-randomness strings (Shannon entropy > 4.5 bits/char), (2) Regex pattern library with 200+ patterns for known secret formats (AWS keys, GitHub tokens, Stripe keys, etc.), (3) Historical Git commit scanning across entire repository history. (Source: devsecure_secrets_detection.md)

### Q: What types of secrets can DevSecure find?
**A:** DevSecure detects AWS Access Keys (AKIA...), Stripe API Keys (sk_live_...), GitHub Personal Access Tokens (ghp_...), JWT tokens (eyJ...), RSA/SSH private keys, OAuth tokens, database credentials, and any high-entropy strings indicating potential secrets. Library covers 200+ patterns. (Source: devsecure_secrets_detection.md)

### Q: Does secrets scanning check Git history?
**A:** Yes. DevSecure scans the entire Git history, not just the current branch. This is critical because secrets in deleted files are still exploitable if the repository is or was ever public. We recommend rotating any exposed credentials even if the commit was reverted. (Source: devsecure_secrets_detection.md)

### Q: Can DevSecure auto-fix exposed secrets?
**A:** Yes. DevSecure can auto-generate PRs to: (1) Replace hardcoded secrets with environment variable references, (2) Add secret files to .gitignore, (3) Integrate with secret managers (AWS Secrets Manager, HashiCorp Vault). Important: You must manually rotate the exposed secret before merging the PR. (Source: devsecure_secrets_detection.md)

### Q: How are secrets categorized by severity?
**A:** Critical: Live production credentials with admin/high privileges (e.g., AWS AdministratorAccess). High: Active API keys with sensitive scope. Medium: Test/sandbox credentials. Low: Expired tokens or placeholder values. Severity affects RPS score and CI/CD gate decisions. (Source: devsecure_secrets_detection.md)

### Q: Can I block secret commits before they happen?
**A:** Yes. DevSecure IDE plugins (VSCode, IntelliJ) provide pre-commit hooks that block commits containing new secrets. Available in Developer tier and above. Team/Enterprise also supports PR-level checks that fail builds if secrets are detected in the diff. (Source: devsecure_secrets_detection.md)

### Q: What is entropy analysis?
**A:** Entropy analysis calculates Shannon entropy (randomness measure) for strings. High entropy (>4.5 bits/char) indicates potential secrets. Example: "a3k9f8j2l1m4n7p0q5r6s8t9" (likely API key) scores high entropy, while "helloworld" (not a secret) scores low. This catches secrets that don't match known patterns. (Source: devsecure_secrets_detection.md)

### Q: What file types are scanned for secrets?
**A:** DevSecure scans all source code (all languages), configuration files (JSON, YAML, TOML, .env), Docker/Kubernetes manifests, Terraform state files, and any text-based files in the repository. Binary files are excluded from secret scanning. (Source: devsecure_secrets_detection.md)

## Immutable Links
- Secrets Detection Docs: https://docs.devsecure.com/secrets
- Pattern Library: https://docs.devsecure.com/secrets/patterns
- Pre-Commit Hooks Setup: https://docs.devsecure.com/secrets/pre-commit