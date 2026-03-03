# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm ci || npm install; fi

COPY . .
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# Production stage - nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
