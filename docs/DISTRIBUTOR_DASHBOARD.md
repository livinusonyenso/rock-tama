# Distributor demo dashboard — 2026-11-17

The owner authorised a dashboard and temporary login using any email/password. This supersedes the disabled login portion of D-127. Real registration remains unavailable, and the future backend is still the owner’s Node.js/Express API.

## Behaviour

Any valid email-format address and any non-empty password open `/account/dashboard`; there is no account lookup or password matching. The browser sends only the display email to `startDemoSession`; the password is neither transmitted nor stored. A demo-only, host-only, httpOnly/SameSite=Lax cookie lasts8hours (Secure in production builds). This cookie is a navigation convenience, **not authentication or authorization**. It is intentionally not a trusted identity, distributor approval or access to real orders. Strict `DEPLOY_MODE=production` rejects creating and reading demo sessions.

`/account` chooses login/dashboard based on the demo cookie. Reload retains demo access; logout deletes it and returns to login. Missing/malformed/expired cookie redirects dashboard to login. Cookie-dependent routes use Suspense for Cache Components. JavaScript is required for demo login; the submit control stays disabled without it so entered passwords cannot be submitted as a fallback GET form.

## UI

Responsive forest-green sidebar, overview cards, sample order list with expandable details, profile card and supply-team link. Mobile sidebar navigation scrolls horizontally. Sample statuses/data are visibly labelled; they do not imply real deliveries or transactions. The basket statistic alone comes from the existing browser basket and updates live. Start an order/Browse products go to `/shop`; supply links use the existing wholesale form; support goes to `/contact`. Profile is a preview of the supplied email, not an editable backend record.

Server components render the dashboard and sample content; a small client basket-count island reads existing storage. CSS Modules, existing tokens/icons and native details/summary; no dependencies, animation library or new assets. Demo code is isolated in lib/account/demo.ts and app/account/demo-actions.ts for later removal when Express authentication is connected.

## Verification

138/138 browser checks at320/375/768/1024/1280/1440px: layout, arbitrary credentials (including a second email and one-character password), reload/account routing, logout/direct dashboard access, sample details, basket count, existing icon/mobile menu and no-JS fallback. Session parsing/strict-production exclusion script passes. Lint and TypeScript pass; styled diagnostic Webpack build passes with config restored. Default Turbopack production build is not claimed. Desktop/mobile screenshots inspected; all captures provisional.

Evidence: verification/distributor-dashboard/report.md and sections/dashboard-layout-*.png. No push or deployment. Concurrent admin-portal changes in the workspace belong to separate work and are not part of this change.
