# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Security Updates - June 7, 2026

#### Critical/High Severity Vulnerabilities Fixed

**Next.js**
- Updated from 16.1.6 to 16.2.7
- Fixed 13+ security vulnerabilities including:
  - WebSocket SSRF (Server-Side Request Forgery)
  - Middleware/Proxy bypass vulnerabilities
  - Denial of Service (DoS) vulnerabilities
  - Cache poisoning vulnerabilities
  - Cross-site scripting (XSS) vulnerabilities
  - React Server Components vulnerability (CVE-2026-23870)

**eslint-config-next**
- Updated from 16.1.6 to 16.2.7
- Maintained compatibility with Next.js 16.2.7

#### Transitive Dependency Updates (via pnpm overrides)

The following vulnerable transitive dependencies were forced to secure versions:

- **protobufjs**: ^7.5.5 (fixes 7+ high/critical vulnerabilities - code execution, prototype pollution, DoS)
- **minimatch**: ^9.0.5 (fixes 6+ high ReDoS vulnerabilities)
- **flatted**: ^3.3.4 (fixes prototype pollution and unbounded recursion DoS)
- **dompurify**: ^3.2.4 (fixes 6+ moderate XSS and prototype pollution vulnerabilities)
- **picomatch**: ^4.0.3 (fixes ReDoS and method injection vulnerabilities)
- **fast-xml-parser**: ^5.3.7 (fixes 4+ moderate entity expansion and XML injection vulnerabilities)
- **defu**: ^6.1.5 (fixes prototype pollution vulnerability)
- **brace-expansion**: ^2.0.2 (fixes process hang and memory exhaustion vulnerabilities)
- **follow-redirects**: ^1.15.12 (fixes custom authentication headers leak)
- **postcss**: ^8.4.49 (fixes XSS via unescaped </style>)
- **effect**: ^3.19.0 (fixes AsyncLocalStorage context contamination)
- **esbuild**: ^0.27.4 (fixes dev server CSRF bypass)

### Summary

- **Total vulnerabilities addressed**: 45+
- **Dependencies updated**: 14 packages
- **Breaking changes**: None detected
- **Build status**: ✅ Successful
- **Test status**: ✅ No regressions detected

All security advisories from Dependabot have been addressed through dependency updates.
