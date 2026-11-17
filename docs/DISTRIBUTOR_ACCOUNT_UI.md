# Distributor account UI — 2026-11-17

Owner scope: account icon should lead to distributor registration/login. Owner clarified the backend will be a **custom Node.js/Express API**, and requested **UI only now**. No authentication provider, API or database has been connected. Supabase-specific draft code was discarded, with no new dependencies or environment settings retained.

## Routes and components

The existing account route is live: `/account` redirects to `/account/login`. Desktop header icon and mobile drawer share the route resolver; accessible label is “Distributor account”. Shared header icon actions have44px minimum targets. `/account/register` provides business registration. Both account form pages are noindex and preserve the existing site navigation/footer.

`AccountShell` is a Server Component: ivory bordered/shadowed card, forest-green waterfall brand panel, gold details and serif headings. The full benefits panel is desktop-only; mobile has a compact brand introduction so the form is reached sooner. Uses the existing optimized waterfall, no new imagery.

`DistributorAuthForm` is a small Client Component for controlled input state and password visibility. Login fields: email/password. Registration fields: full name, business name, phone, city/state, email, password/confirmation and consent. Native labels, autocomplete, keyboard focus,16px inputs and44px targets are retained. Login/Register tabs and help/enquiry links navigate to actual routes. Password policy is intentionally not prescribed before the Express API contract is agreed.

Submission buttons remain disabled and reference a visible availability notice. The form prevents submission; no credentials are transmitted, stored locally or put in a URL. There is no simulated login, account creation, email confirmation or approval. Registration and distributor approval remain distinct. No private dashboard or invented distributor privileges are exposed.

## Verification

Lint and TypeScript pass. Styled diagnostic Webpack build passes; its temporary config hook was restored. Default Turbopack production build is not claimed verified. Final browser verification: **150 passed,0 failed,0 incomplete**, at320/375/768/1024/1280/1440px. Includes icon→login, mobile drawer, both form layouts, form switching, show/hide password, Enter without submission, disabled submit and no-JS links. Desktop and mobile screenshots inspected. Earlier142pass/2fail report is preserved: its form-switch assertion matched a cached hidden registration route; corrected by scoping to the visible main.

Evidence: `verification/distributor-account/report.md`, `sections/account-login-layout-*.png` and `sections/account-registration-layout-*.png`. Screenshots provisional. No push or deploy.

## Later API integration

Confirm the Express base URL and actual registration/login/session/logout contracts, error responses, email-verification/password-recovery flows and distributor-approval rules before enabling submit. Session/authorization must be enforced by the backend; editable business fields must not grant distributor privileges. Replace the UI-only submit guard with the chosen integration at that time. API integration and an authenticated dashboard are intentionally outside this UI-only change.
