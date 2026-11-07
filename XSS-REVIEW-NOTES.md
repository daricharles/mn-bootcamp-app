\# XSS Review Notes



Name: Charles Dari

Date: 7 November 2026

Fix commit: `b2a39dc`



\## Finding 1: Reflected XSS in the `/search` route



\- \*\*Source:\*\* The `q` query parameter enters the route as `req.query.q`.

\- \*\*Sink:\*\* `res.send(...)` inserted the value directly into an HTML heading in `app.js`.

\- \*\*Why it matters:\*\* A crafted search URL could cause a visitor's browser to interpret attacker-controlled input as markup. Snyk Code rated this finding High.



\## Fix and retest



I added an `escapeHtml` helper and applied it to the search term before inserting it into the heading. I also added the `Content-Security-Policy: default-src 'self'` response header as a second layer of protection.



| Check | Observed result |

| --- | --- |

| Before the fix | The response contained `<h1>Results for <b>hello</b></h1>`. Chrome rendered the tags as HTML, and View Source showed the raw `<b>` element. |

| After the fix | The same input returned `<h1>Results for \&lt;b\&gt;hello\&lt;/b\&gt;</h1>`, so the supplied tags are displayed as text. |

| Normal search | `q=hello` still returned `<h1>Results for hello</h1>`. |

| CSP | The `/search` response returned `200 OK` with `Content-Security-Policy: default-src 'self'`. |



\## Scanner comparison



Snyk Code still reported the same High XSS finding (`47abc389-c086-425f-aa2a-b441df4925c8`), now at `app.js:46`. The manual retest verified output encoding for the tested input, and the scanner finding remains open. The rescan also reported a Medium `X-Powered-By` finding to address in Lab 4.



The SonarQube for IDE panel displayed no findings during the post-fix check.



\## What I would check next time



I would trace other inputs that reach HTML responses and verify that each one is encoded for the context where it appears.

