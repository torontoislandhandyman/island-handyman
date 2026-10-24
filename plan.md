# Island Handyman full-site sections and testimonials plan

## Scope and safety boundary

The full React application, server, testimonial database schema, and migration remain isolated in the local `feature/full-site-sections` worktree. The user has authorized one GitHub Pages production release containing only the root `index.html`, `status.json`, `plan.md`, and `TODO.md`; no `client/`, `server/`, or `drizzle/` files and no database migration may be included. GitHub Pages deploys the repository root from `main`. After the push, run the requested local development checks and start `pnpm dev` from the feature worktree. Do not write to the shared database or change DNS.

## Design direction

**Mode:** Extension, preserve. **Audience:** Toronto Island homeowners and approved client-portal customers. **Visual language:** the existing dark-forest and lime Island Handyman identity, with Playfair Display headings and Plus Jakarta Sans body/control typography. Preserve existing copy, section rhythm, responsive behavior and accessible labels; keep motion minimal and do not add third-party imagery. Apply the requested dark-forest/lime design to the static landing page and public React homepage, while leaving the internal customer/admin workspaces functional and legible. Do not invent prices, service promises, customer stories, contact details, or operating hours.

## Implementation approach

- Complete the missing `#about` section and compact FAQ in the static root `index.html`, using project-approved service-area, process, service-category, and specialist-scope copy.
- Add root `status.json` with the initial content `{"status":"available","label":"Available on Island"}` and a status badge in the static hero. Fetch the file on page load, map available to green / “Available on Island”, busy or booked to yellow / “Booked / Limited Availability”, and off-island or offline to red / “Off the Island”. Use a neutral loading/error state rather than claiming availability when configuration cannot be read, and honor reduced-motion preferences for the pulsing dot.
- Publish only the four explicitly authorized root files (`index.html`, `status.json`, `plan.md`, and `TODO.md`) to `main`. Keep all React/client, server, Drizzle schema, migration, and database-backed testimonial changes out of the production commit and on the feature worktree.
- Reuse the existing `testimonials` table and feature hooks on the feature branch; do not create a duplicate table. Add `visibility` (`public` or `clients_only`) and `approvalStatus` (`pending`, `approved`, or `rejected`) as additive columns. Preserve legacy columns for compatibility and add a migration backfill translating current public-consent and owner-approval flags into the new fields. Do not apply the migration or write to the shared database.
- Submissions remain associated with an approved customer request. New submissions begin `pending`; validate text length and restrict visibility to the two supported values. The owner may approve or reject each item. Keep legacy flags synchronized while old records or callers may still rely on them.
- Add an approved-customer query for approved `clients_only` testimonials and the signed-in customer's own submission statuses. `clients_only` entries are visible inside the authenticated client portal, not to anonymous visitors. The public React homepage query returns only `public` + `approved` records. Owner-only query and moderation mutation are guarded by existing admin middleware.
- Add a customer-portal textarea and selector labeled “Live Web Page” / “Clients Only”, with pending/approved/rejected feedback. Add owner moderation UI. Preserve privacy by never including pending/rejected entries in public results.
- Keep the React homepage testimonial section data-driven and filtered by the server; preserve existing content and route behavior while applying the requested palette, typography, and layout rules.

## Project structure

- `index.html`: static landing page, including the About/FAQ sections and hero status badge.
- `status.json`: root status configuration fetched by the hero badge.
- `plan.md` and `TODO.md`: project plan and outcome/validation record; included in the explicitly authorized static release.
- `client/src/pages/Home.tsx`: public application homepage and dynamic public testimonials (feature branch only).
- `client/src/pages/Customer.tsx`: approved-customer submission, visibility choice, and client-only viewing (feature branch only).
- `client/src/pages/Admin.tsx`: owner moderation interface (feature branch only).
- `client/src/index.css` and page-scoped stylesheet: public-page and testimonial styling while retaining private-workspace styles.
- `server/routers.ts` and `server/db.ts`: tRPC procedures and database access, approval/ownership checks, visibility filtering, and compatibility fields (feature branch only).
- `drizzle/schema.ts`, `drizzle/*.sql`, and `drizzle/meta/*`: additive schema and migration metadata/backfill (feature branch only).

## Validation and release boundary

Run the pinned frozen dependency installation, type check, existing database-safe tests, and production build. Before publishing, inspect the staged diff and verify that it contains exactly `index.html`, `status.json`, `plan.md`, and `TODO.md`, with no application or database files. Commit and push only that file set to `main` to trigger GitHub Pages for `islandhandyman.vip`. Immediately after the push, start the local dev server from `feature/full-site-sections`, check its HTTP readiness and requested app routes, and provide the local URLs. Do not execute the generated SQL, write to the shared database, modify DNS, or publish/merge full-site application code.
