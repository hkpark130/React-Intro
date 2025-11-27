모든 응답은 한국어로 작성해 주세요.

## Architecture Quick Tour
- Portfolio frontend lives in `React-Intro/src`, served by Vite + Nginx; it talks to the Spring Boot API at `/api/**` and to an Express-based Notion SSR companion under `server/notion-service`.
- Spring Boot backend in `Spring-Blog` provides blog posts, categories, auth, and comment moderation on `/api`; JWT access tokens are returned with refresh tokens in httpOnly cookies.
- Dockerized deployment stitches services together via the external Docker network `ext-network`, expecting the backend container name `backend-spring-app` for API calls.
- Markdown-heavy blog content is rendered client-side with custom components in `src/components/markdown` and enriched server-side through the Notion SSR service for SEO endpoints.

## Frontend Practices
- Component tree hinges on `src/App.jsx` and `SidebarContext`; keep sidebar state responsive-aware when adding routes or layouts.
- All API calls go through `src/api/api.js`, which injects `Authorization` headers from `localStorage` and assumes `withCredentials=true` for refresh cookies—reuse this client instead of ad-hoc `fetch`.
- Auth utilities in `src/api/auth.js` handle JWT storage and background refresh via `scheduleTokenRefresh`; new flows should trigger this or reuse `login`/`refreshAccessToken` helpers.
- Routing is controlled by `react-router-dom@7`; guard admin-only pages with `components/ProtectedRoute.jsx`, which displays the MUI `Login` dialog and redirects back via `redirectTo`.
- The Vite alias `@` maps to `src`; follow this when importing shared utilities to avoid brittle relative paths.

## Backend Notes
- Profiles: `application.yml` defaults to the `local` profile (in-memory H2, seed data from `resources/data.sql`); dockerized runs should set `PROFILE=docker-compose` or use the matching Spring profile switch.
- Security is configured in `config/SecurityConfig.java`: `/api/posts/**` GET + guest comment endpoints are public, admin management sits under `/api/admin/**`. Respect these when adding controllers.
- `UserController` issues JWT access tokens and refresh cookies; refresh requires the cookie header plus `withCredentials` on the client, so avoid altering cookie attributes like `SameSite=Lax` unless nginx changes follow.
- Services (`service/*Service.java`) enforce ownership/role checks; keep business logic there rather than controllers to maintain testability.

## Notion SSR Service
- `server/notion-service/src/index.js` exposes `/notion/*`, `/seo/*`, and pre-rendered `/blog/:id` HTML for crawlers, proxying to the Spring API via `SPRING_BASE`.
- API keys: the service resolves NOTION credentials from `x-notion-api-key` headers, request bodies, or `NOTION_API_KEY`; frontend helpers in `api.js` provide `setNotionApiKey` for per-user overrides.
- When adding Notion features, reuse `safeRenderHtml` and `fetchAllBlocks` helpers to stay consistent with current pagination and fallback behavior.

## Local Dev & Ops
- Frontend: `npm install` then `npm run dev` in `React-Intro`; set `.env` with `VITE_API_URL=http://localhost:8100` when not using docker.
- Notion SSR: `npm install` then `npm start` inside `server/notion-service`; Vite proxies `/notion` and `/seo` to `http://localhost:3000` (see `vite.config.js`).
- Backend: from `Spring-Blog`, run `./gradlew bootRun` (Windows: `gradlew.bat bootRun`) to start on port 8100, or `./gradlew test` for verification. Seed users are `test`/`1234` and `admin`/`1234`.
- Docker: ensure `docker network create ext-network` exists, then `docker-compose up -d` in both `React-Intro` and `Spring-Blog` (they share the network for cross-service DNS).

## Gotchas
- The production `Dockerfile` writes `.env` and selects nginx configs via the `ENV` build arg; pass `--build-arg ENV=prd` when building release images.
- `Blog.jsx` synchronizes pagination, search, and category filters through `URLSearchParams`; extend filters by updating the query-string helpers before touching component state.
- Markdown rendering uses custom JSX components like `AlertBlock` and `Bookmark`; when adding MD features, update both the renderer components and SSR transformers for parity.
- Refresh tokens live in cookies; if calls start failing silently, confirm `axios` calls still have `withCredentials` enabled and CORS allows the requesting origin.
