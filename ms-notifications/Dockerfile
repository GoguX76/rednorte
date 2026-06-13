FROM oven/bun:1.3.14-alpine AS base
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3.14-alpine
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY . .

EXPOSE 3002
CMD ["sh", "-c", "bun run src/index.ts"]