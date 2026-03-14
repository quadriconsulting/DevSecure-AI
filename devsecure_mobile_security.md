# Mobile Security Scanner (APK/IPA)

## Facts
- Binary analysis for Android (APK) and iOS (IPA) applications without requiring source code
- Quota model: Free (1 file/month), Developer (10 files/month), Team (50 files/month), Enterprise (unlimited fair use)
- Binary decompilation: extracts DEX bytecode (Android), analyzes Mach-O binaries (iOS), decompiles to Java/Smali/Swift/Objective-C for analysis
- Permission auditing: Android - reviews AndroidManifest.xml for risky permissions (READ_CONTACTS, ACCESS_FINE_LOCATION for privacy, SYSTEM_ALERT_WINDOW for overlay attacks, INSTALL_PACKAGES for malware vector)
- iOS entitlements inspection: checks Info.plist for sensitive entitlements (com.apple.security.get-task-allow indicates debug mode in production, insecure keychain-access-groups)
- Hardcoded secrets scanning: searches decompiled code for API keys in string constants, OAuth client secrets, encryption keys, backend URLs with embedded credentials
- Certificate pinning validation: checks if SSL pinning is implemented (recommended for banking/fintech apps; missing pinning creates MITM vulnerability risk)
- Code obfuscation analysis: detects use of ProGuard (Android) or Swift obfuscation; lack of obfuscation in production builds exposes business logic
- Third-party SDK scanning: identifies embedded SDKs and checks for known vulnerabilities (outdated Firebase, Crashlytics, AdMob versions, vulnerable WebView implementations)
- Compliance checks: OWASP Mobile Top 10 (insecure data storage, weak cryptography, improper platform usage), PCI-DSS Mobile Guidance (secure credential storage, encrypted transmission)
- Reporting: severity breakdown (Critical/High/Medium/Low), remediation guidance with code snippets, binary diff for version comparison (Enterprise)
- Integration: CI/CD automated scans on app store submission (Team/Enterprise), API upload for programmatic submission (Enterprise)

## Q&A

### Q: What is Mobile Security scanning?
**A:** DevSecure analyzes Android (APK) and iOS (IPA) binaries without requiring source code. It performs binary decompilation, permission auditing, hardcoded secrets detection, certificate pinning validation, obfuscation checks, and third-party SDK vulnerability scanning. (Source: devsecure_mobile_security.md)

### Q: How many mobile apps can I scan?
**A:** Free: 1 file/month, Developer: 10 files/month, Team: 50 files/month, Enterprise: unlimited (fair use policy). A "file" is one APK or IPA upload. (Source: devsecure_mobile_security.md)

### Q: What risky permissions does DevSecure check?
**A:** Android: READ_CONTACTS, ACCESS_FINE_LOCATION (privacy concerns), SYSTEM_ALERT_WINDOW (overlay attacks), INSTALL_PACKAGES (malware vector). iOS: com.apple.security.get-task-allow (debug mode in production), insecure keychain-access-groups. These are flagged in the security report. (Source: devsecure_mobile_security.md)

### Q: Can DevSecure find hardcoded secrets in mobile apps?
**A:** Yes. After decompiling the binary, DevSecure scans for API keys in string constants, OAuth client secrets, encryption keys, and backend URLs with embedded credentials. This catches secrets that developers accidentally bundled into production builds. (Source: devsecure_mobile_security.md)

### Q: What is certificate pinning and why does it matter?
**A:** Certificate pinning is a security technique that prevents MITM (man-in-the-middle) attacks by validating the server's SSL certificate against a known good certificate bundled in the app. DevSecure checks if pinning is implemented—it's critical for banking/fintech apps. (Source: devsecure_mobile_security.md)

### Q: Does DevSecure check third-party SDKs?
**A:** Yes. DevSecure identifies embedded SDKs (Firebase, Crashlytics, AdMob, analytics libraries, etc.) and checks them against known vulnerability databases for outdated versions or vulnerable WebView implementations that could be exploited. (Source: devsecure_mobile_security.md)

### Q: What is code obfuscation analysis?
**A:** DevSecure detects whether ProGuard (Android) or Swift obfuscation was used. Lack of obfuscation in production builds means the app's business logic, API endpoints, and algorithms are easily reverse-engineered. This is flagged as a security risk. (Source: devsecure_mobile_security.md)

### Q: What compliance standards does mobile scanning cover?
**A:** DevSecure checks against OWASP Mobile Top 10 (insecure data storage, weak cryptography, improper platform usage) and PCI-DSS Mobile Payment Application Best Practices (secure credential storage, encrypted transmission). Reports map findings to these frameworks. (Source: devsecure_mobile_security.md)

## Immutable Links
- Mobile Security Docs: https://docs.devsecure.com/mobile
- OWASP Mobile Top 10: https://docs.devsecure.com/mobile/owasp
- Certificate Pinning Guide: https://docs.devsecure.com/mobile/cert-pinning