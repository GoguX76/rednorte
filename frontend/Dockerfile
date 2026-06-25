FROM oven/bun:1.3.14-alpine AS build
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

ARG PUBLIC_API_URL=http://rednorte.local
ARG PUBLIC_WS_URL=ws://rednorte.local/ws
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV PUBLIC_WS_URL=$PUBLIC_WS_URL

RUN bun run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
