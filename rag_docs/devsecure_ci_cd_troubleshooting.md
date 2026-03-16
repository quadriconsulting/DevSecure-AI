
# DevSecure CI/CD Troubleshooting Guide

## Why did DevSecure fail my CI pipeline?
DevSecure integrates with CI/CD pipelines to ensure vulnerabilities are detected before code reaches production. A pipeline may fail if:
- A critical vulnerability was introduced in the commit
- A secret was detected in the codebase
- A dependency vulnerability violates policy
- A remediation patch failed validation gates

Review the DevSecure findings in the CI output or dashboard to identify the failing rule.

## How do I rerun a DevSecure scan?
Push a new commit or manually rerun the CI workflow in your repository platform (GitHub Actions, GitLab CI, Bitbucket Pipelines, Azure DevOps). DevSecure will reanalyze the code and update the findings.

## Why was my pull request blocked?
Pull request scanning detects vulnerabilities introduced by code changes. If security policies require blocking high-risk issues, DevSecure prevents the merge until the issue is resolved.

## How do I debug a failed security gate?
Check:
1. CI logs
2. DevSecure dashboard findings
3. The failing rule or vulnerability category
Resolve the issue and rerun the pipeline.

## Best practices for CI integration
- Run scans on every pull request
- Enable dependency scanning
- Enable secret detection
- Block merges on critical vulnerabilities
