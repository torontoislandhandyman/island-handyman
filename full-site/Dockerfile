FROM node:22-bookworm-slim AS build

WORKDIR /app
RUN npm install --global pnpm@10.15.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
RUN npm install --global pnpm@10.15.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
# The bundled server statically imports the Vite middleware and its config.
# Keep the complete lockfile install so those modules resolve at runtime.
RUN pnpm install --frozen-lockfile

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
