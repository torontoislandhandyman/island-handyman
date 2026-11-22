# Island Handyman implementation plan

**Status:** The owner-approved Island Evergreen redesign uses the supplied Toronto Islands aerial photo. First-party email/password authentication, the site-wide three-preset theme, persistent owner content settings and a session-authorized private-file route are implemented in the working copy. The additive site-content migration is applied. The owner previously asked for Preview-only work, and has now explicitly asked to finalize deployment; that newer request authorizes one canonical checkpoint and deployment of this version. Do not change Porkbun DNS or guess record targets.

## Product and runtime

The React/Vite frontend is served by Express/tRPC and uses Drizzle/MySQL. The public `/` route is a static single-page Hero/About/Services/Contact marketing page with local hard-coded copy; its operational contact form submits through the existing server procedure. The separate account, customer workspace, owner dashboard, messaging, file uploads and business workflows remain. The application uses first-party password hashes and opaque HTTP-only sessions, server-side role checks, and Resend for reset links. HTTPS sessions use `SameSite=None; Secure`; local HTTP is handled separately.

The app still uses Manus-managed hosting, MySQL, Forge object storage and owner notifications. Replacing login does not make these infrastructure dependencies portable. `OWNER_EMAIL`, `RESEND_API_KEY` and `EMAIL_FROM` are configured; the Resend key is send-only. `PUBLIC_APP_URL` is not injected, so recovery links default to `https://islandhandyman.vip`. That hostname currently serves an older GitHub Pages placeholder rather than the app, so reset links are not usable there yet.

Production configuration is declared for the container app: server and database enabled; runtime port 3000; root server route; `Dockerfile`; unauthenticated health route `/_app/health`. The Dockerfile uses Node 22 and pnpm 10.15.1. The published release `1b5dc53` is confirmed on the stable Manus URL. Auto-publish is enabled, so future canonical pushes publish. The Cloudflare proxy Worker is separate from the Manus app source and has not been bound to the custom domain.

## Current owner setup and external blockers

Public DNS still uses Porkbun nameservers. Both `islandhandyman.vip` and `www.islandhandyman.vip` resolve to an older GitHub Pages page. The Cloudflare zone is Pending/paused and has assigned nameservers `dimitris.ns.cloudflare.com` and `samara.ns.cloudflare.com`; it currently contains the old GitHub A/CNAME records plus staged Cloudflare Email Routing records. A separate proxy Worker has been deployed and smoke-tested at `https://islandhandyman-vip-proxy.torontoislandhandyman.workers.dev`; it returns the current Manus app. No custom-domain binding or registrar change has been made. Cloudflare requires an Active zone before a Worker custom domain can be attached; the remaining registrar action is to replace the four Porkbun nameservers with Cloudflare's two exact assigned nameservers. Because that switches authoritative DNS and activates staged email routing, get explicit confirmation before changing it. Do not guess A/CNAME targets; Worker Custom Domains creates its own DNS records after attachment.

A no-customer-data send to Resend's test recipient was rejected with HTTP 422. The configured sender's verification status and successful delivery remain unconfirmed; check the Resend dashboard before relying on account setup or recovery. Do not send test messages to customers.

## Implementation decisions

1. Keep the existing application and business workflows; do not reset or delete shared data.
2. Preserve the approved homepage layout and all sections; serve only the owner's supplied aerial photo as the hero image. Remove the old external-image credit/link.
3. Apply the approved Island Evergreen palette across the public pages, password/recovery screens, customer workspace and owner dashboard. Offer exactly three fixed, contrast-safe presets—Evergreen, Shoreline and Cedar Hearth—without an arbitrary color picker.
4. Keep the copy neighbourly and direct, with clear labels, helpful errors, comfortable type, visible focus and simple next steps. Do not remove existing content or fields to simplify wording.
5. Use `shared/siteContent.ts` for bounded defaults and normalization. Persist owner-editable hero, service, About, notice and footer copy plus the preset in one nullable JSON column on the existing business-settings row. Continue using existing availability/contact fields. Validate writes on the server and restrict them to the owner role.
6. Replace the anonymous arbitrary-key storage signer with `GET /api/private-files/:fileId`. Require the first-party session, resolve the file server-side, check the owner's or customer's project permission, and only then redirect to a signed storage URL. Never expose storage keys in browser workspace payloads.
7. Retain React/Vite, Express/tRPC, Drizzle/MySQL, pnpm and current managed services. Update `client/public/manus-routes.json` for `/admin/settings`.
8. Maintain the concise owner tutorial in `CUSTOM_DOMAIN_SETUP.md`; keep Porkbun website DNS, Manus hosting and Resend outbound mail distinct. Preserve existing mail-receiving MX/TXT records.

## Project structure

| Path | Responsibility |
| --- | --- |
| `client/src/pages/Home.tsx` | Existing public home sections, owner's aerial photo and editable public copy. |
| `client/src/pages/SiteSettings.tsx` | Owner-only persistent site-copy editor, preset choices and preview. |
| `client/src/pages/Login.tsx`, `Request.tsx`, `Customer.tsx`, `Admin.tsx` | First-party account access, intake, private workspace and owner dashboard. |
| `client/src/App.tsx` / `client/src/contexts/ThemeContext.tsx` | Page routing, access gates and loading the saved theme preset across the site. |
| `client/src/index.css` | Responsive Island Evergreen surfaces, accessible form sizing and the three preset palettes. |
| `shared/siteContent.ts` | Shared safe defaults, preset identifiers and content normalization. |
| `server/routers.ts` / `server/db.ts` | Owner-gated site settings, existing business workflows and project permissions. |
| `server/_core/storageProxy.ts` / `server/storage.ts` | Session-authorized file-ID access; storage-key handling remains server-side. |
| `drizzle/schema.ts` / `drizzle/` | Existing tables and additive migrations `0008`–`0009`; no database reset. |
| `client/public/toronto-islands-aerial.webp` | Optimized local copy of the supplied marketing photo. |
| `client/public/manus-routes.json` | Complete page-route manifest, including `/admin/settings`. |
| `cloudflare/islandhandyman-vip-proxy.mjs` | Allowlisted Cloudflare Worker proxy to the stable Manus origin; no credentials are embedded. |
| `CUSTOM_DOMAIN_SETUP.md` | Owner's step-by-step Porkbun, Manus and Resend guide, with current DNS/email findings. |

## Design system

## Design system

- **Design movement:** Toronto Island editorial—mature, natural, practical and distinctly local rather than technology-first.
- **Core principles:** keep the approved identity and useful information; make private actions trustworthy; make the next step obvious; keep owner tools small and durable.
- **Color philosophy:** deep forest and charcoal surfaces recall the Island's tree canopy and shoreline at dusk; warm cream reading text stays comfortable; moss/leaf and shoreline accents add life without a black-and-neon tech feel.
- **Layout paradigm:** retain the existing asymmetrical split hero and page order; anchor the supplied aerial image to the desktop hero and stack content into a calm single column on phones. Use cards for real tasks and information, not decorative grids.
- **Signature elements:** the IH monogram tile; a restrained leaf-green action accent; the owner's aerial shoreline photograph and factual caption.
- **Interaction philosophy:** clear labels, visible keyboard focus, direct links and explicit save/error feedback. No carousel or hidden gestures; support reduced-motion preferences.
- **Animation:** brief, subtle hover/focus transitions only (about 180 ms); avoid parallax, looping motion and motion needed to understand a task; honor `prefers-reduced-motion`.
- **Typography system:** Georgia editorial headings paired with a familiar Arial/system sans-serif for body text; operational copy stays comfortably sized with generous line-height.
- **Brand essence:** practical home help from a real local handyman for Toronto Island neighbours. Personality: steady, neighbourly, capable.
- **Brand voice:** warm, brief, direct and respectful. Examples: “Request a job” and “See which days I’m available to help.”
- **Wordmark and logo:** retain the custom IH monogram in a rounded evergreen tile with its organic notched corner, paired with a small, widely tracked Island Handyman wordmark; do not substitute a default-font wordmark.
- **Signature brand color:** Island leaf lime `#C9DD85`, used as a clear action accent against deep Evergreen `#14231D`.

## Verification and delivery state

The working-copy checks passed: `pnpm check`; `pnpm test` (25 tests); and `pnpm build` (one non-blocking Vite chunk-size warning). The additive MySQL migration was applied. Desktop/mobile Preview captures were taken at 1440×900 and 390×844. Preview returned 200 for the home/request/login shell, route manifest, aerial photo and health route; an anonymous private-file request returned 401. The photo is served as a 224 KB local WebP. The deployed Worker proxy also returns 200 for `/`, `/_app/health`, `/manus-routes.json` and the aerial photo. No contact-form submission was made, so no request row was created.

The authenticated owner editor and customer workspace have not been exercised with real accounts: first-owner enrollment depends on Resend delivery, which remains unconfirmed. Server authorization tests deny customer access to owner settings. The stable Manus URL `https://islandhandy-mssnqkgd.manus.space` serves published release `1b5dc53`. The separate test proxy is `https://islandhandyman-vip-proxy.torontoislandhandyman.workers.dev`. The requested custom domain still serves the older GitHub Pages page; the Cloudflare zone is Pending until its assigned nameservers are entered at Porkbun, after which the Worker can be attached to both hostnames. No registrar or live DNS changes have been made.

## Static single-page homepage update (2026-10-21)


## Static single-page homepage update (2026-10-21)

**Mode:** Redesign · Preserve. Keep the approved Evergreen palette, IH mark, supplied Toronto Islands aerial photo, readable contrast and neighbourly voice. Recompose `/` as one concise marketing page with only Hero, brief About, abbreviated Services and Contact sections. Remove the public interactive calendar, dynamic status strip, database-backed testimonials, process/portal strip, and Homepage tRPC reads. Public marketing copy, services and contact details live as local constants; no database query is needed to render `/`. The existing route set and separate authenticated customer/admin tools remain intact.

**Contact behavior:** The page Contact form continues to call the existing `site.submitJobRequest` mutation, preserving server validation, database intake and existing owner notification behavior; this is static presentation, not a static-file-only backend. Keep required name, contact (email or phone), island location, service and message fields, clear success/error feedback and the existing privacy note. Display the owner-provided `torontoislandhandyman@gmail.com` as the direct public email; no phone number was supplied, so do not invent one. Use the existing form markup vocabulary with focused, accessible labels and responsive styling. Keep the job-specific `/request` route and account routes available, but remove them from the one-page marketing navigation except the main Contact action.

**Current implementation note:** `App.tsx` previously mounted `SiteThemeBridge`, a global tRPC public-settings query, on every route. Replace that dynamic theme fetch with the already-declared static Evergreen document theme. The owner settings editor remains a separate route and its stored values will no longer drive the hardcoded homepage content in this version.

**Before/after audit:** Preserve logo, photo, request submission contract, privacy copy and non-homepage account routes; simplify public content and remove calendar/data-driven blocks; no schema, database data, server auth, customer portal or customer/admin records are to be changed. Risk is limited to the replacement homepage markup/form binding. Rollback is the source diff; no migration is needed.


### Verification (2026-10-21)

`pnpm check` and `pnpm build` pass; the build reports only the pre-existing non-blocking large-chunk warning. The two request-validation tests pass without database writes. Preview returns HTTP 200 for `/`, `/_app/health`, `/manus-routes.json` (9 routes) and the supplied aerial image. Source audit confirms the homepage and app shell contain no tRPC data reads, calendar, database-driven status or testimonial components; the form retains the existing `site.submitJobRequest` mutation. No live request was submitted, because the project's database is shared with production. Full DB-mutating tests were intentionally not run.
