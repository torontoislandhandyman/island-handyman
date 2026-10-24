# TODO

## 1. Public full-page sections and visual continuity

- [x] Finish the remaining core web page sections, maintaining our dark-forest/lime color palette, Playfair/Jakarta typography, and existing layout rules.
- [x] Complete the `#about` section and compact FAQ using existing copy.
- [x] Publish only the explicitly authorized static/docs file set; keep the client, server, database schema, and migration work on `feature/full-site-sections`.

## 2. Client Testimonials feature (feature branch only)

- [x] Update the database schema (`drizzle/schema.ts`) to include a `testimonials` table with fields for content, visibility (`'public'` vs `'clients_only'`), and approval status.
- [x] Add tRPC router endpoints (`server/routers.ts`) for submitting, fetching, and moderating testimonials.
- [x] Add a testimonial submission text box with a visibility selector (`Live Web Page` vs `Clients Only`) in the client portal (`client/src/pages/Customer.tsx`).
- [x] Add a dynamic testimonial section on the main home page (`client/src/pages/Home.tsx`) that renders approved public testimonials.
- [x] Preserve existing testimonial data; keep new submissions pending until owner moderation, expose only approved public items to anonymous visitors, and keep clients-only items inside the authenticated client portal.
- [x] Do not apply database migrations or perform test writes against the shared database.

## 3. Live status indicator

- [x] Create a configuration file named `status.json` in the root directory with this initial content: `{"status": "available", "label": "Available on Island"}`.
- [x] Update `index.html` by adding the dynamic status badge widget into the hero/header section that fetches `status.json` on page load:
  - Green (available): “Available on Island”
  - Yellow (busy/booked): “Booked / Limited Availability”
  - Red (off-island/offline): “Off the Island”.
- [x] Ensure the styling matches our dark-forest and lime theme with pulsing status dots, and keep all modifications clean and precise.

## 4. User-authorized production release and local preview

- [ ] Publish the static page updates to production (`main`) on GitHub Pages.
- [ ] Target files: `index.html`, `status.json`, `plan.md`, and `TODO.md`.
- [ ] Commit and push these exact files from `feature/full-site-sections` into `main` to trigger the live GitHub Pages deployment for `islandhandyman.vip`.
- [ ] Immediately after pushing, launch the local development server for the full site.
- [ ] Run type/dependency checks and start the server (`pnpm dev`).
- [ ] Provide local preview URLs for Home (`/`), Admin panel (`/admin`), and Customer portal (`/customer`).
- [ ] Keep all database and full-site application code isolated on `feature/full-site-sections`.

## Validation evidence

The earlier local type, test, build, static-anchor, testimonial-security, and status-mapping checks passed as previously recorded. The current release is limited to the four named files. The release checklist remains open until the push, Pages verification, local dependency/type checks, and feature-branch dev-server readiness check are complete. No migration, shared-database write, or DNS change is authorized.
