# Island Handyman — brand and implementation spec

**Review status:** Approved by the owner on 2026-10-11: keep the Island Evergreen design as shown, keep the three safe presets, and replace the linked cottage photo with the owner's uploaded aerial photo. Continue the previously approved implementation brief. All working-copy changes remain uncheckpointed and unpublished.

## Design read

```yaml
artifact: Existing Island Handyman marketing site plus customer sign-in/workspace and owner dashboard
primary-audience: Toronto Island homeowners, including older homeowners; second audience is the owner managing requests and projects
visual-language: Toronto Island cottage editorial — deep botanical greens, warm charcoal, cream text and local landscape photography
mode: Redesign · Preserve
visual-variance: 4/10
motion-intensity: 2/10
information-density: 4/10
asset-dependence: 5/10
brand-fidelity: 10/10
```

## Four positioning questions and working answers

1. **Narrative role — what must the first screen do?** Establish a trustworthy local person and move visitors to one of two clear actions: request a job or sign in.
2. **Viewing distance — where will people read it?** Start with a narrow phone viewport and older readers; retain a comfortable desktop layout, with 16–18 px minimum operational text and large tap targets.
3. **Visual temperature — how should the site feel?** Warm, mature, neighborly and naturally grounded in the Toronto Islands, not black/neon or technology-first.
4. **Capacity check — what fits in the hero?** One local landscape image, the existing IH identity, one concise introduction and two obvious actions. Keep the calendar, services, process, approved testimonials, forms and account functions lower on the page rather than hiding/removing them.

## Preserve-mode audit

- **Preserve:** Existing IH logo/wordmark, public routes and section order, public availability/calendar, testimonials, job-request fields and validation/submission, customer/password recovery paths, owner dashboard/calendar, customer/project/message/file data contracts, current role and approval checks, privacy statements and existing integrations.
- **Improve:** Overall dark botanical palette and contrast; readable scale and spacing; human, plain-language instructions and error messages; mobile wrapping/navigation; owner control over the requested public copy and preset.
- **Remove:** No feature or information block is proposed for removal. Remove only technical jargon and the unsafe generic unauthenticated file-key signing route after replacement with a protected file-ID route.
- **Protected contracts:** Keep request fields/order and backend semantics; existing page slugs/anchors and working customer/admin journeys; stored records and migration history; owner-only procedures; session-cookie names/behavior; accessibility semantics and privacy/legal text.
- **Highest-risk change:** The file-delivery authorization repair. It will preserve object keys but require an authenticated session plus owner-or-approved-project authorization before minting a temporary redirect. No data reset, deletion or new exposure.
- **Rollback/fallback:** Source-only changes can be reverted from the working tree. The only schema change is a nullable JSON field on the existing business-settings table; it does not drop, rename or rewrite existing columns. Retain default copy and the current main site if a saved custom-content object is absent or invalid.

## Proposed design system

- **Anchor/assets:** Reuse [`client/public/island-handyman-mark.svg`](client/public/island-handyman-mark.svg). Do not replace the existing IH mark. Per the owner's latest instruction, use their square aerial photo in [`client/public/toronto-islands-aerial.webp`](client/public/toronto-islands-aerial.webp) as the hero image, with no external photo-credit link. The uploaded JPEG remains untouched; the local WebP is a full-frame 1800×1800 resize/compression of the supplied image. Keep the caption factual and do not imply the aerial photograph depicts a specific customer project. Serve it from `client/public`, avoiding the existing `/manus-storage/*` private-object namespace.
- **Photo source and credit:** The user supplied `IMG_0217(2).jpeg` directly in this task. No third-party attribution is required. The source asset remains under `/home/ubuntu/upload/IMG_0217(2).jpeg`; only its optimized derivative is used in the site. The old Commons photo, credit and outbound photo links have been removed from the homepage.
- **Palette (WCAG contrast-calculated for body text and primary buttons):**

| Preset | Page / card | Reading text / secondary text | Primary accent / button text | Measured text-to-page / text-to-card / button contrast |
| --- | --- | --- | --- | --- |
| **Island Evergreen** (default) | `#14231D` / `#1D3026` | `#F4F0E5` / `#C1C9BB` | leaf `#C9DD85` / `#17251D` | 14.32:1 / 12.27:1 / 10.74:1 |
| **Shoreline** | `#142329` / `#20363A` | `#F4F0E5` / `#C4D2CF` | sea-glass `#9FD3C5` / `#142329` | 14.16:1 / 11.18:1 / 9.67:1 |
| **Cedar Hearth** | `#242018` / `#332B20` | `#F3EEE1` / `#CBC2AE` | cedar-moss `#D8BF79` / `#241F17` | 14.00:1 / 12.03:1 / 9.08:1 |

  These are curated theme choices, not arbitrary color inputs. Success/warning/error status colors must also remain distinguishable without color alone (use labels/icons as well).
- **Typography:** Georgia for display/headings; Arial/system sans-serif for body and controls. Use 4/8 px rhythm, 16–18 px body copy, 16 px minimum form/button text, visibly associated labels, generous line-height and keyboard focus rings. No external font request or new UI dependency.
- **Layout:** Keep the existing route structure and full information architecture. The landing page keeps all current useful sections; the hero becomes a clear editorial split, then stacks vertically on phone. Use the current content width as a ceiling, with comfortable line-length. Dashboard settings remain a simple form with a live preview, not drag-and-drop.
- **Surface and shape:** Dark pine page; gently differentiated cards and borders; 12 px controls, 16 px cards, 24 px hero image; subtle shadows only where they improve separation. Buttons remain high-contrast, familiar and easy to tap.
- **Interaction and motion:** No carousel, parallax or hidden gestures. Short state feedback only (120–180 ms), clear “Save changes” success/error text, and `prefers-reduced-motion` support.
- **Homepage content controls:** Editable headline, introductory message, About-me heading/body, four existing service-card headings/descriptions, existing public availability message/contact fields, opening information, general notice, footer sentence and one of the three appearance presets. Keep the privacy statement and image-license credit fixed and visible; do not allow the editor to remove required attribution or privacy copy.
- **Brand voice:** Neighborly and direct, never patronizing or software-heavy. Examples: “Request a job” and “See which days I’m available to help.”

## Proposed technical decisions

1. Reuse the current `business_settings` record. Add one nullable JSON `siteContent` column via an additive Drizzle migration; leave current contact/status/calendar columns and all customer data intact.
2. Add an owner-only `/admin/settings` route and a server-validated save procedure. Public visitors receive only the public-copy/preset projection; customers cannot access owner controls.
3. Keep client, owner, calendar, messages, requests and private files on their current flows. Replace the public key-based file-signing path with a session-and-project-authorized `/api/private-files/:fileId` redirect.
4. No new application package or service credential is required. The configured services are Manus-managed hosting/database/Forge capabilities plus Resend transactional email. Authentication itself uses the site's own database/session and does not use Manus login. `PUBLIC_APP_URL` is currently absent and the existing default points at `https://islandhandyman.vip`; recovery links become practically reachable after that domain's DNS is connected.
5. The shared MySQL database currently contains no users, customers, projects, requests, messages, private files, testimonials, calendar slots, notifications or business-settings rows. I will still avoid test writes to the shared database. The owner email is configured, but there is no existing administrator row; the first owner password setup must be completed through the verified email flow once the public origin resolves.

## Owner checkpoint

The owner approved the proposed direction: Island Evergreen default, Ward's Island cottage photo with attribution, three safe presets, and the type/layout/accessibility decisions documented above. The viewable visual v0 has now been built and reviewed at desktop, tablet and phone widths. Pause for owner feedback before implementing persistence, owner controls and the file-access repair.

## Delivered v0 verification — 2026-10-11

- The homepage, logo and optimized local photo all load in the working-copy Preview; the image is credited to its source and linked to the CC BY 2.0 license.
- Captures were reviewed at 390×844, 768×1024 and 1440×900. The menu collapses to its narrow-screen pattern in screenshots; no visible horizontal clipping was observed.
- The eight-entry route manifest returned valid JSON; the health endpoint, SPA routes, request-form navigation, internal signed-out customer-to-login redirect and in-domain password-recovery navigation responded as expected.
- TypeScript check, 23 tests and the production frontend/server build passed. No production checkpoint or publication was made.
- **Awaiting owner feedback:** full-site theme application, copy refinements outside the homepage, settings persistence and protected file-delivery changes have not been implemented.
