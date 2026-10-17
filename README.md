# Island Handyman — source export

This archive contains the existing Island Handyman React/Vite frontend, Express/tRPC backend, Drizzle schema and migrations, tests, styles, and configuration.

## Important portability note

This is a **source export of the working project**, not a claim that the current application is already independent of Manus. Website sign-in is native; the current codebase still uses these existing platform adapters:

- Native on-domain email/password authentication (`server/_core/password-auth.ts`, `server/auth-store.ts`), with long-lived HTTP-only server sessions and single-use password setup/reset links
- Manus storage proxy for private project files (`server/_core/storageProxy.ts`, `server/storage.ts`)
- Manus Forge endpoints for map/data/AI/voice features where those features are used
- `vite-plugin-manus-runtime` for the managed development experience

The export contains no passwords, API keys, database credentials, or session secrets. See `PORTABILITY_AUDIT.md` for the exact integration points and the work required to self-host them. Do not place real secrets in source control.

## Requirements

- Node.js 20+ recommended
- npm 10+ or pnpm 10+
- MySQL-compatible database (MySQL/TiDB)
- MySQL-compatible database, owner email, and verified transactional email sender for password setup/reset
- Configured private file storage and optional email/AI/map services

## Quick start

1. Copy the environment template into the standard filename:

   ```bash
   cp ENV_EXAMPLE .env
   ```

   The platform blocked direct creation of a `.env.example` filename during export preparation, so `ENV_EXAMPLE` is the included equivalent. You can rename it to `.env.example` if you prefer.

2. Fill in the values in `.env`. Set `OWNER_EMAIL`, `RESEND_API_KEY`, and a sender address in `EMAIL_FROM` that has been verified with Resend. Approved clients and the owner establish their password through the email link; no external sign-in provider is used.

3. Install dependencies:

   ```bash
   npm install
   ```

   The repository also includes `pnpm-lock.yaml`; `pnpm install` is the most reproducible install path for the current project.

4. Generate and apply Drizzle migrations:

   ```bash
   npm run db:push
   ```

   Review migrations before applying them in production. The application expects `DATABASE_URL` to point to the target MySQL/TiDB database.

5. Type-check, test, and build:

   ```bash
   npm run check
   npm test
   npm run build
   ```

6. Start the production server:

   ```bash
   node dist/index.js
   ```

   The server listens on `PORT` when configured, otherwise the project default is used by the runtime. Put a reverse proxy such as Nginx or Caddy in front of it for HTTPS and a custom domain.

## Application routes

- `/` — public website
- `/request` — public job request form
- `/login` — on-domain email/password sign-in
- `/forgot-password` — request a password setup/reset email
- `/reset-password` — complete a one-time password setup/reset link
- `/customer` — approved customer/VIP workspace
- `/vip` — alias for the customer workspace
- `/admin` — owner dashboard

## Database and private files

- Business data is stored in the MySQL/TiDB database through Drizzle.
- Private project files are stored through the current storage adapter and are authorized server-side before opening.
- Never expose database credentials, storage credentials, password hashes, reset tokens, or session IDs to the browser.

## Development

```bash
npm run dev
```

For a self-hosted deployment, use the generic Vite/Express process behind HTTPS and replace the platform-specific adapters listed in `PORTABILITY_AUDIT.md`.

The default `pnpm test` skips a notification integration test that writes and deletes a temporary database row. Run it with `RUN_DATABASE_INTEGRATION_TESTS=true` only when `DATABASE_URL` points to a disposable test database; never use the shared production database.

## Current verification

The source was exported from the verified Island Handyman project checkpoint. The project had passing TypeScript checks, automated tests, and production build verification before export preparation. Run the commands above again after configuring your own environment.
