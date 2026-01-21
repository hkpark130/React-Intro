# 1) Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci \
  && npm rebuild esbuild
COPY . .

# Node.js 힙 메모리 증가 (OOM 방지)
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# 2) Production stage
FROM nginx:alpine

ARG ENV=local
ENV ENV=$ENV

RUN if [ "$ENV" = "local" ]; then \
  echo "VITE_API_URL='http://backend-spring-app:8100'" > .env; \
  elif [ "$ENV" = "prd" ]; then \
  echo "VITE_API_URL=''" > .env; \
  fi

RUN mkdir -p /etc/ssl/cert

COPY --from=builder /app/dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.${ENV}.conf /etc/nginx/conf.d/default.conf

RUN if [ "$ENV" = "prd" ]; then \
  COPY cert/fullchain.pem /etc/ssl/cert/ 2>/dev/null || true; \
  COPY cert/privkey.pem /etc/ssl/cert/ 2>/dev/null || true; \
  else \
  echo "Development environment - SSL not required"; \
  fi

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
