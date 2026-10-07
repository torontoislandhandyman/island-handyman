# Island Handyman — source export

This archive contains the existing Island Handyman React/Vite frontend, Express/tRPC backend, Drizzle schema and migrations, tests, styles, and configuration.

## Important portability note

This is a **source export of the working project**, not a claim that the current application is already independent of Manus. The current codebase still uses the following existing adapters:

- Manus OAuth for authentication (`server/_core/sdk.ts`, `server/_core/oauth.ts`)
- Manus storage proxy for private project files (`server/_core/storageProxy.ts`, `server/storage.ts`)
- Manus Forge endpoints for map/data/AI/voice features where those features are used
- `vite-plugin-manus-runtime` for the managed development experience

The export contains no passwords, API keys, database credentials, or session secrets. See `PORTABILITY_AUDIT.md` for the exact integration points and the work required to self-host them. Do not place real secrets in source control.

## Requirements

- Node.js 20+ recommended
- npm 10+ or pnpm 10+
- MySQL-compatible database (MySQL/TiDB)
- A replacement or configured provider for OAuth, private file storage, and optional email/AI/map features

## Quick start

1. Copy the environment template into the standard filename:

   ```bash
   cp ENV_EXAMPLE .env
   ```

   The platform blocked direct creation of a `.env.example` filename during export preparation, so `ENV_EXAMPLE` is the included equivalent. You can rename it to `.env.example` if you prefer.

2. Fill in the values in `.env`. The current authentication and storage adapters require the Manus-compatible values documented there. For a truly independent deployment, replace those adapters first.

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
- `/customer` — approved customer/VIP workspace
- `/vip` — alias for the customer workspace
- `/admin` — owner dashboard

## Database and private files

- Business data is stored in the MySQL/TiDB database through Drizzle.
- Private project files are stored through the current storage adapter and are authorized server-side before opening.
- Never expose database credentials, storage credentials, OAuth secrets, or JWT secrets to the browser.

## Development

```bash
npm run dev
```

For a self-hosted deployment, use the generic Vite/Express process behind HTTPS and replace the platform-specific adapters listed in `PORTABILITY_AUDIT.md`.

## Current verification

The source was exported from the verified Island Handyman project checkpoint. The project had passing TypeScript checks, automated tests, and production build verification before export preparation. Run the commands above again after configuring your own environment.
