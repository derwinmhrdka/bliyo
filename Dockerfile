# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci && npm cache clean --force

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_CACHE=0
ENV DATABASE_URL="postgresql://bliyo:bliyo@db:5432/bliyo?schema=public"
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG API_INTERNAL_URL=http://api:13004
ENV API_INTERNAL_URL=$API_INTERNAL_URL
RUN npm run prisma:generate -w @bliyo/api \
  && npm run build -w @bliyo/api \
  && npm run build -w @bliyo/web \
  && rm -rf apps/web/.next/cache node_modules/.cache /tmp/* \
  && npm cache clean --force

FROM node:20-alpine AS migrate
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/api/prisma apps/api/prisma
COPY apps/api/src/seed.ts apps/api/src/seed.ts
COPY apps/api/tsconfig.json apps/api/tsconfig.json
RUN npm ci -w @bliyo/api --include-workspace-root && npm cache clean --force \
  && npx prisma generate --schema apps/api/prisma/schema.prisma
ENV PATH="/app/node_modules/.bin:${PATH}"
WORKDIR /app/apps/api
CMD ["prisma", "migrate", "deploy"]

FROM node:20-alpine AS api
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
RUN npm ci -w @bliyo/api --include-workspace-root --omit=dev && npm cache clean --force
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
ENV PATH="/app/node_modules/.bin:${PATH}"
WORKDIR /app/apps/api
ENV PORT=13004
EXPOSE 13004
CMD ["node", "dist/main.js"]

FROM node:20-alpine AS web
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache libc6-compat \
  && addgroup -S nodejs \
  && adduser -S nextjs -G nodejs
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
