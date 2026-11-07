\# Configuration Findings



Name: Charles Dari

Date: 7 November 2026



\## Dependency scan results



| Tool | Before | After | Notes |

| --- | --- | --- | --- |

| Snyk Open Source | 170 dependencies tested, 41 issues, 79 vulnerable paths | 186 dependencies tested, 17 issues, 49 vulnerable paths | Final scan includes Helmet. All 17 remaining issues trace through `sqlite3@5.1.7`. |

| OWASP Dependency-Check 13.0.0 | 2,056 entries scanned, 10 vulnerable entries, 48 reported vulnerabilities | 2,207 entries scanned, 1 vulnerable entry, 12 reported vulnerabilities | Rescanned after the Express and Lodash upgrades. The only remaining vulnerable entry was `tar@6.2.1`. |



I upgraded Express and Lodash within major version 4. After the upgrade, `/user?name=ama` still returned `200 OK` with Ama’s record. Snyk scanned `package-lock.json`, while Dependency-Check scanned the project directory and listed Lodash as both a package and a JavaScript file. I compared each scanner against its own baseline.



\## Configuration issues



| Issue | Risk | Fix | Verification |

| --- | --- | --- | --- |

| Express framework header and limited security headers | Framework disclosure and fewer browser protections | Enabled Helmet and removed the manual CSP middleware | `/user` still returned `200 OK`. `X-Powered-By` was absent, and Helmet’s CSP, `nosniff`, and `SAMEORIGIN` headers were present. |

| Detailed errors in HTTP responses | Stack traces reveal local paths and application internals | Added a centralized Express error handler | `/settings?data=bad` changed from an HTML stack trace to `500` with `{"error":"Something went wrong"}`. |

| Hardcoded credentials | Anyone with repository access can retrieve values committed to Git | Read values from environment variables and added a placeholder-only `.env.example` | Snyk’s credential findings cleared. Git history still shows where the old declarations were added in `d863ca4` and removed in `0f6e186`. |

| Admin access | An admin endpoint needs to reject unauthorized requests | Added an `/admin` route that requires a matching API key | Without a key: `403 Forbidden`. With the matching test key: `200 OK` and `{"ok":true}`. |

| Outdated Express and Lodash dependencies | Known vulnerabilities in direct and transitive dependencies | Upgraded both packages and rescanned | Snyk issues fell from 41 to 17. Dependency-Check reported vulnerabilities fell from 48 to 12. |



\## Remaining findings for Lab 5



\- Snyk Code went from 5 open findings to 1. The remaining High reflected XSS finding (`47abc389-c086-425f-aa2a-b441df4925c8`) points to `app.js:43`. The Lab 3 HTTP retest showed that the supplied tags were encoded. The scanner finding remains open for triage.

\- Snyk reported 17 dependency issues through SQLite3. It recommends `sqlite3@6.0.1` for 12 `tar` findings and lists five other issues separately. Evaluate the major-version upgrade and rescan before claiming those findings are resolved.



\## Implementation commits



\- `0f6e186` — Upgrade dependencies and harden Express configuration

\- `6b876d0` — Protect admin route with an API key

