# Portability audit

## Result

The archive is a complete source export, but the current application is **not yet a zero-dependency self-hosted application**. This is intentional and documented so there are no hidden platform locks.

## Existing platform-specific integrations

| Area | Current code | What a self-hosted deployment needs |
|---|---|---|
| Authentication | `server/_core/sdk.ts`, `server/_core/oauth.ts`, `server/_core/context.ts`, `client/src/_core/hooks/useAuth.ts` | Replace Manus OAuth with an independent OAuth/OIDC provider or local auth implementation, then preserve the server-side role checks. |
| Private file delivery | `server/storage.ts`, `server/_core/storageProxy.ts` | Replace the Manus storage adapter with S3-compatible storage, MinIO, or local disk behind authenticated download routes. Do not turn private files into public URLs. |
| Managed dev runtime | `vite.config.ts`, `vite-plugin-manus-runtime` | Remove the Manus Vite plugin and debug middleware; use ordinary Vite/Express configuration. |
| AI, voice, maps/data | `server/_core/llm.ts`, `imageGeneration.ts`, `voiceTranscription.ts`, `map.ts`, `dataApi.ts`, `client/src/components/Map.tsx` | Configure independent providers or disable only the related optional feature. |
| Email | `server/email.ts` | Configure Resend or replace the adapter with SMTP/another transactional provider. |
| Database | `drizzle.config.ts`, `server/db.ts` | Provide a reachable MySQL/TiDB-compatible database. |

## What is not included

- No `.env` file
- No API keys, OAuth secrets, JWT secrets, database passwords, or storage credentials
- No `node_modules`, build output, Git metadata, Manus logs, browser session data, or platform debug assets

## Recommended self-hosting sequence

1. Provision MySQL/TiDB and run the Drizzle migrations.
2. Replace Manus OAuth with an independent identity provider while keeping `adminOnlyProcedure` and customer/project authorization checks.
3. Replace the storage proxy with S3/MinIO/local authenticated file routes.
4. Replace or disable optional Forge-based map/AI/voice features.
5. Use the included generic npm scripts to build and start behind Nginx/Caddy with HTTPS.
6. Re-run `npm run check`, `npm test`, and `npm run build`, then manually test owner, VIP customer, and private-file flows.
