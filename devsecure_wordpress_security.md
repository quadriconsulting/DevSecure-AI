# WordPress & CMS Security Scanner

## Facts
- Specialized scanner for WordPress sites, plugins, themes, and core vulnerabilities
- Quota model: Free (1 site), Developer (10 sites), Team (50 sites), Enterprise (100 sites)
- Site definition: unique WordPress installation URL
- Vulnerability data sources: WPScan Database (30,000+ known WordPress vulnerabilities), CVE/NVD (core WordPress CVEs), Plugin Security Advisories (official WordPress.org disclosures)
- Update frequency: real-time sync with WPScan API for latest vulnerability data
- Detection capabilities: (1) Core version scanning (identifies outdated WordPress versions with known exploits like SQL injection CVE-2022-xxxxx), (2) Plugin vulnerabilities (unauthenticated RCE, SQL injection, XSS, CSRF in third-party plugins), (3) Theme vulnerabilities (backdoors in functions.php, insecure file uploads, exposed admin panels)
- Configuration auditing: WP_DEBUG enabled in production (information disclosure risk), directory listing enabled (Options +Indexes in .htaccess), default admin user still active (username "admin"), weak passwords (tests for common WordPress passwords via brute-force - Team/Enterprise only)
- WAF detection: identifies if site is behind Cloudflare, Sucuri, Wordfence WAF; sites without WAF are flagged as High priority due to lack of perimeter defense
- Discovery method: passive detection via HTTP headers and active fingerprinting (optional per scan configuration)
- Auto-remediation capabilities: generate update requests to latest patched versions for plugins/themes, recommend plugin removal if abandoned (no updates in 2+ years)
- Manual steps required: backup database before applying updates (WordPress requirement)
- Compliance: PCI-DSS Requirement 6 (regular patching of CMS platforms), GDPR considerations (secure handling of user data like Contact Form 7 logs)
- Integration: continuous monitoring with daily scheduled scans (Team/Enterprise), Slack alerts for Critical findings (Team/Enterprise)

## Q&A

### Q: What is WordPress Security scanning?
**A:** DevSecure scans WordPress installations for vulnerabilities in core software, plugins, and themes using the WPScan Database (30,000+ vulnerabilities), CVE/NVD data, and official WordPress.org security advisories. It also audits configurations like debug mode and default admin users. (Source: devsecure_wordpress_security.md)

### Q: How many WordPress sites can I scan?
**A:** Free: 1 site, Developer: 10 sites, Team: 50 sites, Enterprise: 100 sites. A "site" is one unique WordPress installation URL. (Source: devsecure_wordpress_security.md)

### Q: What types of WordPress vulnerabilities does DevSecure find?
**A:** Core vulnerabilities (e.g., SQL injection in WordPress <6.0), plugin vulnerabilities (unauthenticated RCE, SQL injection, XSS, CSRF in third-party plugins), theme vulnerabilities (backdoors in functions.php, insecure file uploads), and configuration issues (WP_DEBUG in production, directory listing, default admin user). (Source: devsecure_wordpress_security.md)

### Q: What is the WPScan Database?
**A:** WPScan Database is the authoritative source for WordPress-specific vulnerabilities, containing 30,000+ records covering core WordPress, plugins, and themes. DevSecure syncs in real-time with WPScan API for immediate access to newly disclosed vulnerabilities. (Source: devsecure_wordpress_security.md)

### Q: Can DevSecure auto-fix WordPress vulnerabilities?
**A:** Yes. DevSecure can generate auto-update requests to latest patched versions for plugins and themes. If a plugin is abandoned (no updates in 2+ years), DevSecure recommends removal. Important: Always backup your database before applying updates. (Source: devsecure_wordpress_security.md)

### Q: Does DevSecure check if my WordPress site has a WAF?
**A:** Yes. DevSecure detects if the site is behind Cloudflare, Sucuri, or Wordfence WAF. Sites without a WAF are flagged as High priority because they lack perimeter defense against common attacks like brute-force and DDoS. (Source: devsecure_wordpress_security.md)

### Q: What configuration issues does DevSecure check?
**A:** WP_DEBUG enabled in production (exposes errors/file paths), directory listing enabled (Options +Indexes in .htaccess), default admin user "admin" still active (brute-force target), weak passwords (tested via brute-force in Team/Enterprise tiers). (Source: devsecure_wordpress_security.md)

### Q: Can I schedule continuous WordPress monitoring?
**A:** Yes, in Team and Enterprise tiers. You can configure daily scheduled scans with automatic Slack alerts for Critical findings. This ensures you're notified immediately when new vulnerabilities are disclosed affecting your WordPress installations. (Source: devsecure_wordpress_security.md)

## Immutable Links
- WordPress Security Docs: https://docs.devsecure.com/wordpress
- WPScan Database: https://wpscan.com/wordpresses
- WordPress Hardening Guide: https://docs.devsecure.com/wordpress/hardening