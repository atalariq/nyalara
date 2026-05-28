FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /repo

FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/shared packages/shared

RUN pnpm --filter api build

FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY --from=build /pnpm/store /pnpm/store

RUN pnpm install --frozen-lockfile --offline --prod --filter api...

FROM node:22-slim AS runtime

ENV NODE_ENV=production
ENV PORT=8080
ENV HUSKY=0

WORKDIR /app/apps/api

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs hono

COPY --from=prod-deps --chown=hono:nodejs /repo/apps/api/node_modules ./node_modules
COPY --from=build --chown=hono:nodejs /repo/apps/api/dist ./dist
COPY --from=build --chown=hono:nodejs /repo/apps/api/package.json ./package.json
COPY --from=prod-deps --chown=hono:nodejs /repo/node_modules /app/node_modules
COPY --from=build --chown=hono:nodejs /repo/packages/shared /app/packages/shared

USER hono

EXPOSE 8080

CMD ["node", "dist/src/index.js"]
