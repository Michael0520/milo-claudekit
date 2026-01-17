---
paths: **/*.ts, **/*.js, **/*.tsx, **/*.jsx
---
# Security Rules

## Forbidden

- Hardcoded secrets, API keys, passwords
- `rm -rf`, `sudo rm`, `chmod 777`
- Committing `.env` files
- SQL string concatenation
- `innerHTML` with user input
- `eval()` or `Function()` with user input

## Required

- Environment variables for secrets
- Parameterized queries for database
- Input validation at system boundaries
- Output encoding/escaping
- HTTPS for all external requests

## OWASP Top 10 Quick Checks

| Risk | Prevention |
|------|------------|
| Injection | Parameterized queries, input validation |
| Broken Auth | Strong passwords, MFA, session management |
| Data Exposure | Encrypt sensitive data, minimize exposure |
| XSS | Escape output, Content-Security-Policy |
| Broken Access | Authorization checks on every request |
| Misconfig | Remove debug mode, update defaults |

## Before Committing

- [ ] No secrets in code
- [ ] No debug/test credentials
- [ ] No `.env` files staged
- [ ] Input validation in place
