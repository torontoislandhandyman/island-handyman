# Staging deployment notes

## Scope and safety

- The full app is isolated under `full-site/` on branch `staging/full-site`.
- The repository root static page, `CNAME`, GitHub Pages settings, and existing Pages workflow are not changed. The existing Pages workflow targets pushes to `main` only.
- A separate GitHub Actions workflow on this branch performs type-check and production build, then stores a short-lived build artifact. It does **not** deploy to GitHub Pages or publish a public preview URL.
- No DNS records, custom domains, production environment settings, or live-page settings have been changed.
- The repository is public, so this branch and its source files are publicly visible. Never add `.env` files, credentials, private keys, customer records, or database dumps.

## Manual steps to create an actual preview

GitHub Pages serves static files; it cannot run this app's Express/tRPC backend or connect to MySQL. To get a working preview URL:

1. Choose a separate Node/container hosting project for staging. Do not repoint the existing GitHub Pages project or connect a custom production domain.
2. Connect repository `torontoislandhandyman/island-handyman`, select branch `staging/full-site`, and set the app/root directory to `full-site/` (or Docker build context to `full-site/`, where the Dockerfile is located).
3. Provision a separate, disposable MySQL/TiDB database for staging. Do not reuse the production database.
4. Set the required variables listed below in that host's secret/environment settings. Set `PUBLIC_APP_URL` to the provider's staging URL, not `https://islandhandyman.vip`.
5. Use a staging-only Resend key and a verified staging sender if email flows are tested. Do not send test messages to customers.
6. Before using an independent host for real account, upload, or private-file flows, resolve the Manus-specific integrations in [PORTABILITY_AUDIT.md](PORTABILITY_AUDIT.md). The current storage proxy and managed runtime are not automatically replaced just by connecting the repository.
7. After reviewing the generated migration SQL, run `pnpm db:push` only against the isolated staging database. This command generates and applies migrations; do not run it against production.
8. Use only the hosting provider's temporary preview hostname. No DNS change is needed for this staging setup.

Suggested build/start commands if the host does not use the included Dockerfile:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm start
```

## Environment variables

| Variable | Staging value / purpose |
|---|---|
| `DATABASE_URL` | Required MySQL/TiDB connection string for the **staging** database. Keep it in the host's secret settings. |
| `NODE_ENV` | `production` for a deployed preview. |
| `PORT` | Use the host-assigned port; the included Dockerfile exposes `3000`. |
| `OWNER_EMAIL` | Email address authorized to establish the first owner account in the separate staging database. |
| `PUBLIC_APP_URL` | Required staging origin, e.g. the temporary preview URL supplied by the host. Do not use the main `.vip` domain. |
| `RESEND_API_KEY` | Staging-only Resend API key, if testing setup/reset emails. Keep secret. |
| `EMAIL_FROM` | Sender address verified for that Resend account; use a staging sender, not the production sender. |

Optional integration variables referenced by the source:

- `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` are server-side Forge adapter settings. They are not supplied by a generic host; configure an approved replacement/provider or disable the dependent feature.
- `VITE_FRONTEND_FORGE_API_URL` and `VITE_FRONTEND_FORGE_API_KEY` are exposed to the built browser bundle. Treat any `VITE_` value as public; never put a private credential there.
- `MANUS_ANALYTICS_ENDPOINT`, `MANUS_ANALYTICS_WEBSITE_ID`, `VITE_ANALYTICS_ENDPOINT`, and `VITE_ANALYTICS_WEBSITE_ID` are optional analytics settings.

The committed `full-site/.env.example` contains placeholders only. Do not commit the real `.env` file.

## Build and test status at branch preparation

`pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm build` succeeded in the isolated folder. `pnpm test` reported 24 passing tests and one failure in `server/site.security.test.ts` (`creates, scopes, and marks a customer notification as read`: expected notification fixture was undefined). No application/test fix was made as part of staging preparation. The branch build workflow runs type-check and build only; it does not hide or claim that the test suite passes.
