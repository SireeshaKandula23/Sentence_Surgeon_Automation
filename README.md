# Sentence_Surgeon_Automation
=======
# Sentence Surgeon Playwright Framework

TypeScript + Playwright automation framework using the Page Object Model for `https://english-sentence-surgeon.lovable.app`.

## Covered scenarios

- Switch between **Create account** and **Sign in** modes
- Create account with a fresh generated email
- Logout and login with the same credentials
- Reject login with a wrong password
- Correct text and verify result sections
- Switch all tone rewrite tabs
- Verify alternative phrasings are present
- Clear textarea
- Open history and delete entries one by one
- Toggle light/dark theme
- Cancel account deletion
- Confirm account deletion
- End-to-end signup → correction → theme → history → logout → login → delete

## Run locally

```bash
npm install
npx playwright install chromium
npm test
```

Optional:

```bash
npm run test:headed
npm run report
npm run typecheck
```

## Environment variables

Create `.env` from `.env.example` if needed:

```bash
BASE_URL=https://english-sentence-surgeon.lovable.app
TEST_PASSWORD=Surg3on!Pw-2026-Strong-NotPwned
```

## Notes from latest triage

The app currently opens `/auth` in **Create your account** mode by default, not Sign in mode. The authenticated header now has an **Account** menu; **Sign out** and **Delete account** live inside that menu. The framework was updated to match those current behaviors.

If Playwright reports missing browser executables, run:

```bash
npx playwright install chromium
```

