# Production stage (빌드는 GitHub Actions에서 수행)
FROM nginx:alpine

ARG ENV=local
ENV ENV=$ENV

RUN if [ "$ENV" = "local" ]; then \
  echo "VITE_API_URL='http://backend-spring-app:8100'" > .env; \
  elif [ "$ENV" = "prd" ]; then \
  echo "VITE_API_URL=''" > .env; \
  fi

RUN mkdir -p /etc/ssl/cert

# GitHub Actions에서 rsync로 전송된 dist 폴더 복사
COPY dist /usr/share/nginx/html

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
