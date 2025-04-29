# Getting Started with Docker

```.env
#  docker 로 돌릴 때
VITE_API_URL=http://backend-spring-app:8100

#  npm 으로 돌릴 때
# VITE_API_URL=http://localhost:8100

#  https 적용시에는 NGINX 에서 프록시 되도록 여기선 아무 설정 안 함
```

```
#  docker 로 돌릴 때
$ docker-compose up -d

#  npm 으로 돌릴 때
$ npm install
$ npm run dev
---

# 프로젝트 링크
https://hkpark130.p-e.kr/
