# 포트폴리오 프론트엔드 리디자인 — 설계 문서

- **작성:** 2026-04-23
- **범위:** `React-Intro/` (+ Spring-Blog 최소 정리)
- **관련 작업:** A (이 문서) · B (백엔드 cold-start, 후속) · C (SEO·sitemap, 후속)

---

## 0. Quick decisions recap

| 영역 | 결정 |
|---|---|
| 방향성 | **C (Polished Product) 베이스 + B (Terminal) 악센트** 하이브리드 |
| 레이아웃 | **상단 네비** + 신규 `/projects` 그리드 페이지 (사이드바 폐기) |
| 컬러 | **G-B · Cool Slate + Subtle Indigo** (light/dark 양쪽) |
| 다크모드 | **수동 토글** (초기값 = 시스템 prefers-color-scheme) |
| Home | **H1 Lean Landing** (Hero · Selected 3 · Recent Writing · Contact) |
| Blog list | **B1-compact + # index column** (table 밀도, blog 느낌) |
| About | `/profile` → **`/about`** (bio · links · tech stack · certs · awards · infra) |
| Footer | 얇은 단일 줄, **연도 없음** |
| ⌘K 팔레트 | 신규 (내비 + 블로그 검색 + 관리자 액션 숨김처) |
| 스코프 아웃 | 백엔드 성능 (B) · SEO/sitemap (C) |

## 1. Summary

현재 `hkpark130.p-e.kr` 포트폴리오 사이트를 **면접관 어필에 최적화된 Polished Product 감각**으로 전면 리디자인한다. 사이드바 중심의 "관리자 대시보드" 느낌에서 **상단 네비 + 전용 `/projects` 그리드 페이지** 구조로 전환하고, **G-B (Cool Slate + Subtle Indigo)** 테마에 **Terminal 악센트 (코드·아키텍처 섹션용 다크 모노스페이스)** 를 곁들인다. 수동 토글 다크모드를 지원한다. 동시에 브레인스토밍 중 발견한 **미사용 npm 패키지 15개 · 죽은 Spring `NotionService` · 잡음성 dead code**를 정리한다. 기존 URL·데이터·SSR 서비스(`ssr-notion`)는 그대로 유지한다.

---

## 2. Goals & Non-goals

### Goals
1. **"이 사이트는 제품이다"는 첫인상**을 면접관에게 전달. (Linear / Stripe / Vercel급 완성도)
2. **10개 프로젝트를 카드 그리드**로 한 눈에 스캔 가능하도록 만들기.
3. **라이트/다크 양쪽에서 전체 페이지가 완성도 있게** 보이게 한다.
4. **블로그는 블로그답게** — 포트폴리오 chrome이 블로그 독자를 방해하지 않도록 분리.
5. **번들 사이즈 · cold-start 개선**을 위한 미사용 패키지·dead code 정리.

### Non-goals
- ~~백엔드 성능 개선~~ → B 후속 작업.
- ~~SEO·sitemap·metadata 재정비~~ → C 후속 작업 (단, `<title>`/`<meta>`의 기본 구조만 새 Layout에서 갖춰둔다).
- ~~ssr-notion Node.js SSR 서비스 수정~~ → 잘 동작 중, 손대지 않아도 문제는 없는지 검토 확인은 필요. 노션의 문법이 마크다운 렌더러에 맞지 않는 부분이 있어서 작동되지 않는 문법도 있기는 함 근데 그건 그냥 넘어갔었음 구현 난이도가 높아서 무시했음
- ~~109개 기존 블로그 글 내용 수정~~ → 데이터 그대로.
- ~~새로운 프로젝트 페이지 추가~~ → 기존 10개 리스타일만.
- ~~인증·권한 체계 변경~~ → 현재 guest / user / admin 3계층 그대로.
- ~~Redmine·OpenSearch 같은 운영 시스템 변경~~ → 포트폴리오 사이트에만 한정.

---

## 3. Current State (briefly)

- **Stack:** React 19 + Vite 6 + MUI 7 + Framer Motion + react-router-dom 7.
- **라우팅 (`App.jsx`):** `/` (Intro) · `/springboot` · `/kredis` · `/golang` · `/opensearch` · `/python` · `/terraform` · `/chrome` · `/chatbot` · `/redmine` · `/profile` · `/blog` · `/blog/:id` · `/blog/create` · `/blog/edit/:id`.
- **Layout:** `App.jsx` 내에 `Sidebar` (240px fixed Drawer) + main `Box` + `ChatWidget` 고정.
- **테마:** MUI 기본 + 보라·파랑 그라디언트 (`#6a11cb→#2575fc`, `#4776E6→#8E54E9`, `#667eea→#764ba2`) 곳곳에 하드코딩.
- **페이지 패턴:** 대부분 `Container > Paper (elevation=3, bgcolor=#f9f9ff) > motion.div (fade-up)` 구조의 긴 세로 스크롤 + 섹션들.
- **에디터:** `MarkdownEditor.jsx` + `MarkdownRenderer.jsx` (react-markdown 기반) + 커스텀 태그 (`CodeAccordion`, `ZoomableImageModal`, `Bookmark`, `AlertBlock`).
- **백엔드:** Spring Boot 3.4.4 + Java 21 + MariaDB + JWT. Nginx 뒤 SSR 서비스(`ssr-notion`)가 SEO·Notion 렌더·`/seo/preview`·`/sitemap.xml`·`/robots.txt` 처리.

---

## 4. 타깃 디자인 시스템

### 4.1 컬러 토큰 — G-B · Cool Slate + Subtle Indigo

CSS custom property로 정의하고 MUI `ThemeProvider`와 연결한다. 다크모드는 `data-theme="dark"` 속성으로 스위치.

**Light (default):**
```
--bg-canvas:    #ffffff
--bg-raised:    #f8fafc    /* hero gradient bottom, section backgrounds */
--bg-subtle:    #f1f5f9    /* hover, disabled */
--border:       #e2e8f0
--border-muted: #f1f5f9
--ink:          #0f172a    /* primary text, CTA background */
--ink-muted:    #475569    /* secondary text */
--ink-subtle:   #64748b    /* tertiary / metadata */
--ink-disabled: #94a3b8
--accent:       #6366f1    /* indigo-500 — LINKS, FOCUS, "Read more →" tertiary only */
--accent-bg:    #eef2ff    /* faint indigo bg for active chips */
--on-ink:       #ffffff    /* text on ink backgrounds */
```

**Dark (via `[data-theme="dark"]`):**
```
--bg-canvas:    #0b1220
--bg-raised:    #0f172a
--bg-subtle:    #1e293b
--border:       #1e293b
--border-muted: #1e293b
--ink:          #f1f5f9
--ink-muted:    #cbd5e1
--ink-subtle:   #94a3b8
--ink-disabled: #64748b
--accent:       #818cf8    /* indigo-400 */
--accent-bg:    rgba(129,140,248,0.12)
--on-ink:       #0b1220
```

**중요 규칙:**
- **CTA 버튼 배경은 `--ink`** (light: 검정에 가까운 네이비, dark: 흰색). `--accent`는 **링크·포커스·tertiary 버튼 텍스트 전용**. 이게 Linear/Stripe의 "색으로 힘주지 않는다"의 핵심.
- 보라·파랑 그라디언트 리터럴 (`#6a11cb`, `#2575fc`, `#667eea`, `#764ba2`, `#4776E6`, `#8E54E9`) **전부 제거**.

### 4.2 타이포그래피

- **Body (UI/본문):** `"Inter"` → `system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", sans-serif`. Google Fonts에서 Inter 400/500/600/700 로드.
- **모노 (코드·⌘K·kbd):** `"JetBrains Mono"` → `"Fira Code", Consolas, Menlo, monospace`. Google Fonts에서 400/500/700.
- **한글:** Inter가 한글을 커버하지 못하므로 `Noto Sans KR` 400/500/700 같이 로드, `font-family`에 후순위로 지정.
- **스케일:** Display 36~40 / h1 28~30 / h2 22 / h3 18 / body 15~16 / small 13 / micro 11. 모두 `letter-spacing: -0.3~-0.8px` (타이트 Linear 스타일).

### 4.3 Spacing · Radius · Elevation

- **Spacing step:** 4px. (4/8/12/16/20/24/32/40/48/64)
- **Radius:** `xs=4` `sm=6` `md=8` `lg=12` `xl=16` `pill=999px`. 현재 MUI 기본 `borderRadius: 3` 과잉 사용을 `sm` 중심으로.
- **Elevation:** **대부분의 Paper elevation 제거.** 필요한 곳만 `box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)` 수준의 isolate shadow. MUI elevation 3~8 금지.
- **Border:** 1px solid `--border`가 주된 경계 표현. "그림자로 레이어 표현"이 아니라 "선으로 구획"이 원칙.

### 4.4 Motion

- **Framer Motion 유지.** 현재 `sectionVariant`의 `opacity 0→1, y 40→0` 페이드업 패턴 그대로.
- 다만 **delay는 전체적으로 빠르게**: 기존 `custom * 0.05` → `custom * 0.03`. 현재가 살짝 느려서 "로딩 중" 인상을 준다.
- **hover·focus transition:** `transition: all 150ms ease-out`. MUI 기본 225ms보다 빠르게.
- **reduce-motion:** `@media (prefers-reduced-motion)` 에서 모든 transition/animation 비활성화.

### 4.5 B 악센트 (Terminal 스타일)

코드 섹션·프로젝트 데모 터미널 출력에 사용.

```
--term-bg:      #0d1117   (light/dark 공통)
--term-border:  #1e293b
--term-text:    #c9d1d9
--term-muted:   #8b949e
--term-green:   #7ee787
--term-amber:   #ffa657
--term-blue:    #79c0ff
```

- `MarkdownRenderer`의 `CODE_BLOCK_STYLE`는 이 토큰들을 쓰도록 교체.
- 프롬프트 모티프: `$ kubectl apply -f ...` 에서 `$`는 `--term-green`, 커맨드는 `--term-text`. 이런 간단한 구문 하이라이팅 규칙만.
- `CodeAccordion`의 `solarizedlight` Prism 테마는 라이트에서 유지, 다크모드에서는 `atomDark` / `vscDarkPlus` 같은 Prism 다크 테마로 동적 스위치.

---

## 5. 아키텍처 변화

### 5.1 ThemeProvider + Dark-mode 컨텍스트

새 파일 `src/theme/ThemeProvider.jsx`:
- MUI `createTheme`으로 light · dark 두 테마 생성, 위 컬러 토큰 팔레트에 반영.
- `useState` 기반 `mode` 상태. 초기값 = `localStorage.getItem('theme')` ?? `prefers-color-scheme`.
- `<html>` 에 `data-theme="light|dark"` 속성 토글 → CSS 토큰 스위치.
- Context 노출: `{ mode, toggleMode }`. 헤더 아이콘(🌓)에서 소비.

App.jsx의 기존 `ThemeProvider`는 이것으로 교체. `SidebarContext`는 삭제 (사이드바 자체가 사라짐).

### 5.2 Layout 컴포넌트 재구성

- `src/components/Sidebar.jsx` **삭제.**
- `src/Layout.jsx` 재작성: `<TopNav /> <main><Outlet /></main> <Footer /> <ChatWidget />` 구조.
- `App.jsx`는 `<Routes>`와 `<Route element={<Layout />}>` 패턴으로 리팩토링.
- 기존 `ProtectedRoute`는 그대로.

### 5.3 새 컴포넌트: `TopNav`

`src/components/layout/TopNav.jsx`:
- 좌: 로고 (작은 박 이니셜 + "박현경")
- 중앙: `Home / Projects / Writing / About` — 4개 링크. `NavLink`로 active 상태 (`border-bottom: 1.5px solid var(--ink)`, `font-weight: 600`).
- 우: `⌘ K` kbd 인디케이터 · 테마 토글 (🌓) · (로그인 시) 아바타 버튼 → 드롭다운 (항목: `사용자명` · `내 프로필 가기` · `로그아웃`)
- 모바일: 햄버거 → slide-over 메뉴 (`Drawer` `variant="temporary"` anchor right).
- 높이 48px (MUI `Toolbar` dense), `position: sticky; top: 0; backdrop-filter: blur(8px); bg: rgba(var(--bg-canvas), 0.85)`.

### 5.4 새 컴포넌트: `Footer`

`src/components/layout/Footer.jsx`:
- 얇은 1줄: 왼쪽 "박현경 · Portfolio" · 오른쪽 GitHub · LinkedIn · RSS (linked to `/rss.xml`, served by SSR) · Sitemap.
- **연도·날짜 없음** (사용자 지시).
- `border-top: 1px solid var(--border)`, `padding: 24px 0`, 텍스트 `--ink-subtle`.

### 5.5 새 컴포넌트: `CommandPalette (⌘K)`

`src/components/layout/CommandPalette.jsx`:
- **외부 라이브러리:** `cmdk` (~6kB, Linear가 만든 라이트 라이브러리). 설치: `npm i cmdk`.
- 데이터 소스: (1) 정적 내비 항목, (2) `fetchPosts` 호출로 블로그 타이틀, (3) 10개 프로젝트 메타데이터 (하드코딩된 배열).
- 키 바인딩: `⌘K` (Mac) / `Ctrl+K` (Win/Linux). `useEffect`로 `keydown` 전역 리스너.
- 항목 선택 → `navigate(path)`.
- 로그인 상태일 때만 "새 게시글 작성 ↗" "로그아웃" 항목 노출. 미로그인 시 "로그인" 항목 노출. **즉 관리자 액션이 여기에 숨음** (블로그 독자 시야 차단).

### 5.6 라우팅 변화 (`App.jsx`)

| 기존 | 변경 |
|---|---|
| `/` Intro | `/` Home (H1 Lean Landing — 재작성) |
| — | **신규** `/projects` (Projects 그리드) |
| `/springboot`, `/kredis`, `/golang`, `/opensearch`, `/python`, `/terraform`, `/chrome`, `/chatbot`, `/redmine` | URL 그대로, 콘텐츠 그대로, **리스타일만** |
| `/profile` | `/about` 으로 이동 + `/profile` 에서 301-style redirect (React Router `<Navigate to="/about" replace />`) |
| `/blog`, `/blog/:id` | URL 그대로, 리스타일 |
| `/blog/create`, `/blog/edit/:id` | URL 그대로, 리스타일 |

모바일 SPA 라우팅이라 "301 redirect"라기보단 Router-level `<Navigate replace>`이지만 효과는 동일.

---

## 6. 페이지별 설계

### 6.1 `/` — Home (H1 Lean Landing)

**섹션 순서:**
1. **Hero** — `PORTFOLIO · 2026` kicker / `박현경` h1 / `[DEVOPS ENGINEER]` 태그 / 2줄 요약 / 버튼 3개 (View Projects · GitHub · Read blog tertiary).
   - 배경: `linear-gradient(180deg, var(--bg-canvas) 0%, var(--bg-raised) 100%)`.
   - 높이 대략 뷰포트의 55~65%.
2. **Selected Work** — 3개 카드 (Kredis · Spring Blog · Terraform IaC를 featured로 상수 지정). 카드: 스왓치 16px + 타이틀 + 1줄 요약 + 스택 칩 2~3개. 우상단 "See all 10 →" 링크 (`--accent`).
3. **Recent Writing** — 최신 3개 블로그 포스트 (B1-compact 행 3개 뽑아서). 우상단 "All 109 posts →".
4. **Contact (Let's talk)** — bg `--bg-raised`, 이메일 버튼 + GitHub/LinkedIn 텍스트 링크.

배경은 화면 전체 스크롤에서 각 섹션마다 미묘하게 변화 (`--bg-canvas` ↔ `--bg-raised` 교차), 섹션 경계는 `hr` (`border-top: 1px solid var(--border)`).

**제거:** 현재 `Intro.jsx`의 `TechStackSection`, `PortfolioOverviewSection`, `ImplementationDetailsSection` 전부 제거. 각각의 콘텐츠는 아래로 이동:
- TechStack 목록 → `/about` 또는 `/projects`의 카드 칩으로 흡수.
- "포트폴리오 개요" 장문 설명 → `/about` 페이지 소개 문단으로.
- CI/CD 파이프라인 이미지 (`/images/cicd.png`)와 시스템 아키텍처 이미지 (`/images/spring-blog.png`)는 **전체 사이트 인프라에 대한 설명**이므로 `/about` 페이지 하단에 "**Infra & Deployment**" 섹션 신설하여 배치. `/springboot` 페이지는 이미 `spring-blog.png`를 쓰고 있으므로 그쪽은 변경 없음.

### 6.2 `/projects` — Projects 그리드 (신규)

- 헤더: `SELECTED WORK · 10` kicker / `Projects` h1 / 1줄 설명.
- **Phase 4에서만** 필터 칩 추가 (`All / Backend / DevOps / Infra / Frontend / AI`). Phase 1~3에는 필터 없이 10개 전부 표시. 필터 구현은 `src/data/projects.ts` 메타데이터의 `tags` 배열로 클라이언트 필터링.
- 그리드: `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`. 카드 내부:
  - 상단 썸네일 영역 (기존 `/logo/*` 이미지 또는 커스텀 스와치) 높이 140px.
  - `카테고리 kicker` (KUBERNETES OPERATOR / SPRING BOOT …).
  - 프로젝트명 h3.
  - 1~2줄 설명.
  - 스택 칩 3개까지.
  - hover: `transform: translateY(-2px)`, `border-color: var(--ink)`.
- 데이터 소스: `src/data/projects.ts` 신규 — 10개 프로젝트 메타를 배열 상수로.

### 6.3 프로젝트 상세 페이지들 (10개, URL 유지)

**공통 리스타일 규칙:**
- **`Paper elevation={3}` bgcolor `#f9f9ff` 제거.** `<article>` wrapper에 `max-width: 1040px; margin: 0 auto; padding: 48px 24px`.
- **`TitleSection.jsx`의 보라 그라디언트 제거.** 새 Hero: `kicker + h1 + 요약 + 태그 칩들` (Home Hero 축소판).
- **`TechStack.jsx` 리스타일:** 현재 박스 그림자·파랑 상단 바 제거. 평평한 2컬럼 그리드 (`<카테고리>` : `<chips>`). `borderBottom: 2.5px solid #3d5afe` 제거.
- **`Divider`** 유지 하지만 얇게 `border-top: 1px solid var(--border)`.
- **`ZoomableImageModal`** 그대로 유지 (이미 좋은 기능). 테두리만 `border: 1px solid var(--border)` 으로.
- **`CodeAccordion`:** `backgroundColor: "rgba(153,153,153,0.3)"` 헤더를 `var(--bg-subtle)`로. Syntax 테마 다크모드 대응.
- **Framer Motion fade-up** 그대로.

**콘텐츠 밀도는 건드리지 않는다.** Kredis 14섹션은 그대로, Chrome/Redmine의 짧은 페이지도 그대로. 새 콘텐츠 추가 없음.

### 6.4 `/blog` — B1-compact with # index

- 헤더: `WRITING` kicker / `Blog` h1 / 1줄 설명 ("DevOps · 백엔드 · 인프라 · 회고. 지금까지 109편.").
- 필터 줄: 카테고리 chip 가로 스크롤 (`ALL` 활성 / 나머지는 색상 있는 칩). 오른쪽에 검색 인풋.
- **게시글 행** (단일 라인):
  ```
  #번호  [카테고리]  제목                                  💬n   YYYY·MM·DD
  ```
  - `grid-template-columns: 48px 100px 1fr auto 90px`, `gap: 14px`.
  - `border-bottom: 1px solid var(--border-muted)`.
  - hover: `background: var(--accent-bg)`.
  - 카테고리 칩 색상 매핑은 `src/data/categoryColors.ts` 상수 파일에 정의 (`{ "Work Experience": { bg: "#eff6ff", fg: "#1e40af" }, "Kubernetes": { bg: "#f0f9ff", fg: "#0369a1" }, ... }`). **해시 기반 자동 매핑 금지** — 동일 카테고리가 렌더마다 같은 색이어야 함. 새 카테고리 추가 시 이 파일만 손보면 됨.
- 페이지당 10개, 페이지네이션 (`1-10 of 109`).
- **번호(#)는 DB `posts.id` 그대로 노출** (공유할 때 "47번 글 보세요" 가능).
- **관리자 액션 (새 게시글·로그인) 은 테이블 상단에서 제거.** ⌘K 팔레트로 이동. (⌘K에 "새 게시글 작성"이 로그인 사용자에게만 노출.)

**클릭 대상:** 행 전체 → `navigate(\`/blog/${post.id}\`)` (현재 로직과 동일).

### 6.5 `/blog/:id` — 블로그 상세

- **콘텐츠 최대 너비 680px** (기존 1040px에서 축소). 장문 읽기 최적 가독성.
- 헤더 메타: 카테고리 칩 / 날짜 / "목록으로 ←" 링크 / (권한 있으면) 수정·삭제 버튼.
- 제목 h1 (letter-spacing -0.8px).
- `Avatar + 작성자 chip + 작성일` 한 줄 (얇게).
- `<Divider>` 얇게.
- **본문:** `MarkdownRenderer`. 타이포 Prose 스타일:
  - `p`, `li` `font-size: 16px; line-height: 1.7; color: var(--ink);`
  - `h2, h3` 여백 `margin-top: 2em; margin-bottom: 0.5em`.
  - `blockquote` `border-left: 3px solid var(--accent); padding-left: 16px; color: var(--ink-muted); font-style: italic;`
  - `pre` B 악센트 (`var(--term-bg)` 배경).
  - `img` 최대 너비 100%, 중앙 정렬, `border-radius: 8px`.
  - `table` → MUI `Table` 스타일링을 G-B 테마로 (현재 `MarkdownRenderer`가 이미 custom renderer 사용).
- **댓글 섹션:**
  - 제목 `Comments · n`.
  - 작성 폼: textarea + (게스트만) 이름·비밀번호 + "작성" 버튼.
  - 댓글 아이템: 아바타 · 닉네임 · 시각 · (권한시) edit/delete icon. 내용은 소박하게.
  - 수정·삭제 인라인 모드 (현재 로직) 그대로 유지, 스타일만 정돈.
- **제거:** `BlogDetail.jsx:662-706`의 죽은 `isEditDialogOpen` Dialog. (실제로 `handleEditClick`이 navigate 하므로 Dialog는 절대 열리지 않음.)
- **제거:** `BlogDetail.jsx:721`의 `Login` Dialog (`isLoginOpen` 항상 false).

### 6.6 `/about` — 대체 `/profile`

- URL 변경: `/profile` → `/about`. `/profile` 에는 `<Navigate to="/about" replace />`.
- **순서:**
  1. 간단한 자기소개 2~3 문단 (현재 사이트에 없음 — 사용자에게 초안 요청 필요, 우선은 placeholder 문단 + TODO).
  2. Links: GitHub · LinkedIn · Email (현재 `Profile.jsx:ProfileLinksSection` 그대로).
  3. Tech Stack (Home에서 옮겨온 것): `인프라 · 프론트 · 백엔드 · ML` 카테고리별.
  4. Certifications: CKA + AWS SAA 카드 (기존 `CertificationsSection`).
  5. Awards: JAVA 경진대회 + KWC (기존 `EducationSection`).
- 현재 Profile의 3섹션은 대부분 재활용, 레이아웃만 정돈.

### 6.7 `/login`, `/blog/create`, `/blog/edit/:id`

- **관리자 전용 페이지가 아님** (user memory: 게스트/회원/관리자 3계층, 별도 관리자 콘솔 없음).
- **Login:** 현재 Dialog 형태 → **Dialog 유지** (navbar·⌘K에서 트리거). 폼 G-B 테마로.
- **CreatePost / EditPost:** 현재 페이지 유지. 상단에 breadcrumb `Blog / 새 게시글` 또는 `Blog / 수정`. 제목 input은 커스텀 native `<input>` 사용 중 → MUI `TextField size="medium"`로 통일.
- **MarkdownEditor:**
  - L800의 `'tsx', 'tsx'` 중복 제거.
  - 제거된 기능 주석 (L80, 262, 647, 757) 정리.
  - 툴바 버튼 테마 통일 (보라 그라디언트 없음, outline 스타일).
  - 탭 "작성" / "미리보기" 그대로.
  - 노션 가져오기 Dialog 그대로 (잘 동작 중).

### 6.8 ChatWidget

- **위치 유지:** 우하단 고정 FAB.
- **변화:**
  - 보라 그라디언트 (`#667eea→#764ba2`) 전체 제거.
  - FAB: `bg-color: var(--ink); color: var(--on-ink);` 단색. hover 시 `transform: scale(1.05)`.
  - 열린 Panel: `border: 1px solid var(--border)`, `border-radius: 12px`, `box-shadow: 0 10px 40px rgba(0,0,0,0.15)`.
  - 헤더: `bg: var(--bg-subtle); color: var(--ink)` (이전의 보라 그라디언트 헤더 대체).
  - 봇 메시지 / 유저 메시지: 봇 = `bg: var(--bg-subtle)`, 유저 = `bg: var(--ink); color: var(--on-ink)`.
  - 봇 아바타 아이콘: 현재 보라 그라디언트 원 → 단색 `var(--ink)` 원.

### 6.9 ⌘K Command Palette (신규)

- 주요 항목:
  - `Home` · `Projects` · `Writing (/blog)` · `About` · `GitHub ↗` · `LinkedIn ↗` 정적.
  - Blog posts (최신 50개 동적 로드, 타이틀로 검색).
  - Projects 10개 (slug + 이름으로 검색).
- 로그인 상태 시 추가: `새 게시글 작성` · `내 프로필 보기 (본인 게시글)` · `로그아웃`.
- 로그아웃 상태 시 추가: `로그인`.
- 스타일: 중앙 모달, `max-width: 560px`, `background: var(--bg-raised)`, `border: 1px solid var(--border)`. 포커스된 항목 `background: var(--accent-bg)`.

---

## 7. 컴포넌트 변화 · 정리 항목

### 7.1 신규 파일
- `src/theme/ThemeProvider.jsx` — MUI Theme + Dark 모드 context.
- `src/theme/tokens.css` — CSS custom properties (4.1의 컬러 토큰).
- `src/components/layout/TopNav.jsx`.
- `src/components/layout/Footer.jsx`.
- `src/components/layout/CommandPalette.jsx`.
- `src/data/projects.ts` — 10개 프로젝트 메타 상수 (path · name · description · stack · thumbnail · category).
- `src/components/projects/ProjectsGrid.jsx` — `/projects` 페이지.
- `src/components/projects/ProjectCard.jsx`.
- `src/components/home/Home.jsx` (새 lean landing으로 `Intro.jsx` 교체).
- `src/components/about/About.jsx` (기존 `Profile.jsx` 기반으로 재작성).

### 7.2 삭제 대상
- `src/components/Sidebar.jsx` (완전 삭제).
- `src/components/Intro.jsx` (새 `Home.jsx`가 대체).
- `src/components/Profile.jsx` (새 `About.jsx`가 대체).
- `Spring-Blog/src/main/java/kr/p_e/hkpark130/springblog/service/NotionService.java` (dead code).
- **npm 패키지 (React-Intro/package.json):**
  - `marked`, `marked-extended-tables`, `@fsegurai/marked-extended-tables`
  - `markdown-it`, `markdown-it-container`
  - `react-notion-x`, `notion-client`, `notion-to-md`
  - `@notion-render/bookmark-plugin`, `@notion-render/client`, `@notion-render/hljs-plugin`, `@notionhq/client`
  - `prismjs` (react-syntax-highlighter가 Prism을 번들링함)
  - `katex`
  - `remark-contributors`, `remark-directive`, `remark-extended-table`, `remark-git-contributors`, `remark-grid-tables`
  - **총 19개 패키지.** 제거 후 `npm install` 재실행하여 `package-lock.json` 정리.
  - **검증 절차:** 각 패키지 제거 후 `npm run build` + `npm run dev` + `CodeAccordion` 수동 렌더 체크. 특히 `prismjs`는 `react-syntax-highlighter`의 `/dist/esm/styles/prism`를 통해 간접 사용 중이므로, 제거 후 build 실패하거나 `CodeAccordion`의 Syntax 하이라이팅이 깨지면 **그 패키지는 다시 넣고** 목록에서 뺀다. 의존성 완료 후 `npm ls --all | grep -c prismjs` 로 최종 의존성 트리 확인.

### 7.3 수정 대상
- `App.jsx`: 라우팅 재구성, Sidebar 제거, Layout 교체.
- `src/Layout.jsx`: TopNav/Footer/Outlet 구조로 재작성.
- `src/index.css`: 현재 CSS 변수 (`--bg-main` 등)는 삭제, 새 `tokens.css` import로 대체. 사이드바 관련 CSS 전부 제거.
- `src/components/markdown/MarkdownRenderer.jsx`:
  - L116 `CODE_BLOCK_STYLE` → B 악센트 토큰 (`var(--term-bg)` 배경, `var(--term-text)` 글자, `var(--term-border)` 테두리).
  - L97 `sanitizeUnknownTags` allowlist에서 unused `custom`, `section` 제거.
  - L20 `CUSTOM_TAGS`에서 `Alert` 제거, `AlertBlock`만 유지. (렌더러의 `componentMap`에서도 alert 매핑 삭제.)
- `src/components/markdown/MarkdownEditor.jsx`:
  - L800 중복 `'tsx'` 제거.
  - L80, 262, 647, 757 removed-feature 주석 전부 삭제.
- `src/components/markdown/AlertBlock.jsx`: `#1976d2`, `#ed6c02`, `#D74141` 하드코딩 색상 → `var(--accent)`, `var(--term-amber)`, MUI error color tokens로.
- `src/components/markdown/Bookmark.jsx`: `border: '1px solid #e0e0e0'` → `var(--border)`. elevation 제거.
- `src/components/section/TitleSection.jsx`: 보라 그라디언트 제거, 새 Hero 스타일로 재작성.
- `src/components/section/TechStack.jsx`: 박스 그림자·파랑 상단 바 제거.
- `src/components/section/Reference.jsx`: 가벼운 스타일 정돈.
- `src/components/section/ZoomableImageModal.jsx`: `border: '2px solid #ddd'` 디폴트 → `var(--border)`. 나머지 유지.
- `src/components/section/CodeAccordion.jsx`: `backgroundColor: "rgba(153,153,153,0.3)"` → `var(--bg-subtle)`. Syntax 테마 dark 모드 동적 스위치.
- `src/components/BlogDetail.jsx`: dead Dialogs (L662-706, L721) 제거. 본문 max-width 680. 댓글 스타일링.
- `src/components/Blog.jsx`: 현재 Table 제거, 새 B1-compact feed로 재작성. 관리자 액션 버튼 전부 제거 (⌘K로 이동).
- `src/components/CreatePost.jsx`, `EditPost.jsx`: 테마 적용, native `<input>`을 MUI `TextField`로 치환.
- `src/components/Login.jsx`: 폼 G-B 테마 적용.
- `src/components/ChatWidget.jsx`: 보라 그라디언트 전체 제거, 단색으로 재스타일.
- `src/components/kredis/KredisSections.jsx`, `Golang.jsx`, `SpringBoot.jsx`, `Python.jsx`, `Terraform.jsx`, `Opensearch.jsx`, `Redmine.jsx`, `Chrome.jsx`, `ChatBot.jsx`: Paper elevation·bgcolor·gradient Hero 제거, 새 Hero·TechStack 컴포넌트로 교체.
- `src/components/NotFound.jsx`: G-B 테마 적용.

### 7.4 MarkdownRenderer · Custom Tags 호환성

현재 글 109편에서 사용 중인 커스텀 태그: `CodeAccordion`, `ZoomableImageModal`, `Bookmark`, `AlertBlock`, `Alert` (legacy). 리팩토링 후에도 **이 태그들 전부 계속 동작해야 함.** 스타일만 바뀌어도 태그·속성 계약은 불변. `Alert` 레거시 지원은 유지할 수도, 일괄 migration (`<Alert>` → `<AlertBlock>`)할 수도 있음 — **코드 단순화 측면에서 migration 권장**. 기존 글의 `<Alert>` 사용 개수가 적으면 수동으로, 많으면 Spring 쪽에서 `UPDATE posts SET content = REPLACE(content, '<Alert', '<AlertBlock')` 같은 SQL 한 번.

**우선순위 (사용자 확인 — 2026-04-23):** 실제 글에서 사용 빈도가 높은 순서:
1. **`CodeAccordion`** — 가장 많이 쓰임. 코드 스니펫 접기/펼치기의 핵심 UX이자 다크모드 호환이 까다로운 컴포넌트 (Prism 테마 동적 스위치 필요). → Phase 3·4에서 **가장 먼저 검증**.
2. **`ZoomableImageModal`** — 매우 자주 쓰임. 아키텍처 다이어그램 같은 핵심 시각 자산이 여기 실림. 확대/드래그·모달 동작이 기존과 1:1 동일해야 함.
3. **`Bookmark`** — 자주 쓰임. `/seo/preview` SSR 엔드포인트 의존. 리스타일 후 favicon·썸네일·설명 추출 모두 정상 동작해야 함.
4. `AlertBlock` — 종종 쓰임. 스타일만 토큰화하면 안전.
5. `Alert` (legacy) — 드물게 쓰임. migration 후보.

**테스트 전략:** Phase 3/4 종료 시 랜덤 샘플링 대신 **위 3개 컴포넌트를 확실히 쓰는 글 5편씩을 고정 회귀 케이스로 지정** (총 15편). before/after 스크린샷 비교 + 인터랙션 수동 확인 필수.

---

## 8. 페이징 / 롤아웃

이 프로젝트는 단일 PR로 묶기엔 변화량이 크다. 다음과 같이 4단계로 나눈다:

1. **Phase 1 — Theme & Layout 기반** (이 Phase 종료시 전체 페이지가 "작동은 함", 단 디자인은 부분적):
   - `tokens.css`, `ThemeProvider`, `TopNav`, `Footer`, `App.jsx` 라우팅, 사이드바 제거.
   - 모든 페이지는 기존 Intro/kredis 등 **그대로 렌더** (스타일 일부 깨질 수 있음, 해피 패스 OK).
   - `/profile` → `/about` Navigate.
   - **모바일 햄버거 메뉴.**
2. **Phase 2 — Home + Projects 그리드**:
   - 새 `Home.jsx` (Lean Landing).
   - 신규 `/projects` + `ProjectCard` + `projects.ts` 메타데이터.
   - `Intro.jsx` 삭제.
3. **Phase 3 — Blog + 상세페이지 리스타일**:
   - `Blog.jsx` → B1-compact 재작성.
   - `BlogDetail.jsx` dead code 제거 + max-width + 댓글 정돈.
   - `MarkdownRenderer`·`MarkdownEditor`·`AlertBlock`·`Bookmark`·`CodeAccordion` 토큰화.
   - `CreatePost`·`EditPost`·`Login` 스타일 정돈.
4. **Phase 4 — 프로젝트 상세페이지 + ChatWidget + ⌘K + Cleanup**:
   - 10개 프로젝트 detail 페이지 리스타일 (`TitleSection`, `TechStack`, `ZoomableImageModal` 포함).
   - `ChatWidget` 재스타일.
   - `CommandPalette` 구현 (⌘K).
   - 미사용 패키지 삭제 + `NotionService.java` 삭제 + 주석 청소.
   - 최종 QA: 다크모드 모든 페이지 확인, 키보드 내비 확인, reduce-motion 확인.

---

## 9. 성공 기준

1. **시각적 기준** (주관적이되 판단 가능):
   - 면접관 피드백 시뮬레이션: "어느 자사 도구 같다" 수준의 인상 (Linear/Stripe/Vercel 레퍼런스와 나란히 놨을 때 이질감 없음).
   - 보라·파랑 그라디언트 `grep`으로 0건 (`#6a11cb`, `#2575fc`, `#667eea`, `#764ba2`, `#4776E6`, `#8E54E9` 리터럴이 소스에 없음).
2. **기능 기준:**
   - 모든 기존 URL이 404 없이 동작 (`/profile` → `/about` 리다이렉트 포함).
   - 블로그 글 109편 전부 렌더됨. 커스텀 태그 4종 (`CodeAccordion`, `ZoomableImageModal`, `Bookmark`, `AlertBlock`) 모두 렌더.
   - "노션 가져오기" 버튼 현재 동작 유지.
   - 댓글 작성 (게스트 + 유저) · 수정 · 삭제 현재 동작 유지.
   - 다크모드 토글 → 모든 페이지가 라이트 대비 완성도 있는 다크 상태로 전환.
   - 모바일 (375px 너비) 에서 햄버거 메뉴 · 세로 스크롤 · 읽기 가독성 확보.
3. **정리 기준:**
   - `package.json`에서 19개 패키지 제거됨. `npm run build` 성공.
   - `Spring-Blog/NotionService.java` 삭제. 빌드 성공.
   - `BlogDetail.jsx` dead Dialog 제거.
   - `MarkdownEditor.jsx`의 removed-feature 주석 4군데 제거, `tsx` 중복 제거.
4. **성능 기준** (가능하면):
   - 번들 사이즈 전후 비교. `vite build` output 비교.
   - Lighthouse 점수 전후 비교 (Performance·Accessibility·SEO·Best Practices 각 카테고리).

---

## 10. Risks & Open Questions

### Risks
- **콘텐츠 이전 리스크:** Home에서 제거되는 TechStack/Overview/Implementation 섹션이 `/about` · `/springboot` 등으로 잘 녹아들지 않으면 정보 손실 느낌. → Phase 2·4에서 꼼꼼히 확인 필요.
- **기존 커스텀 태그 렌더 회귀 (가장 큰 리스크):** `MarkdownRenderer` 리팩토링 중 태그 파싱 regex·placeholder 로직 실수 가능. **사용자 확인: `CodeAccordion` > `ZoomableImageModal` > `Bookmark` 순으로 가장 자주 쓰임.** 이 3개를 쓰는 글 5편씩(총 15편)을 고정 회귀 케이스로 잡고, Phase 3·4 종료 시 before/after 스크린샷 + 인터랙션 비교.
- **다크 모드 · Syntax 하이라이터:** `CodeAccordion`의 Prism 테마 다크 스위치가 `react-syntax-highlighter` 동적 import 패턴을 요구해서 Vite 번들 설정에 트리트먼트 필요할 수 있음.
- **모바일 햄버거 메뉴 접근성:** Sidebar 제거 → 없는 상태에서 모바일에서 내비 해결하지 못하면 UX 악화. TopNav 햄버거를 Phase 1에 반드시 포함해야 함.
- **`⌘K` 커맨드 팔레트의 블로그 타이틀 로드:** 109개 포스트 매번 로드하면 API 호출 증가. 이 스펙에서는 **`sessionStorage` 캐시 + 첫 `⌘K` 열 때 fetch** 패턴으로 단순화. 경량 엔드포인트 신설은 B phase(성능)에서 판단. fallback: 현재 `fetchPosts(0, 109)`로 가져와서 `{id, title}`만 추려 저장.

### Open Questions
- **About 페이지 자기소개 문단:** 현재 사이트에 "나는 누구다" 설명이 부재. 2~3 문단 초안이 필요함. Phase 2 또는 Phase 3 진입 전까지 사용자가 제공. (없으면 placeholder로 진행.)
- **Featured 3 프로젝트 선정:** Home의 Selected Work에 노출될 3개. 초안은 **Kredis / Spring Blog / Terraform IaC**로 추정 — 사용자 확정 필요. 변경 용이성을 위해 `src/data/projects.ts` 에 `featured: boolean` 플래그만 두고 Home이 이를 필터링. 수시로 3개 교체 가능.
- **RSS feed:** Footer에 RSS 링크 넣을지 여부. SSR이 `/rss.xml` 서빙 중인지 확인 필요. 없으면 C phase에서 추가. 이 A에서는 **Footer에 RSS 링크 미포함**으로 진행 (없는 걸 가리키지 않도록).
- **한국어 폰트:** Inter + Noto Sans KR 조합을 구글폰트로 수시 로드할지, self-host할지. 일단 구글폰트로 시작.
- **Framer Motion → View Transitions API 이전 여부:** View Transitions가 더 가볍지만 현재 `framer-motion`이 코드 다수에 이미 쓰임. **이 스펙에서는 framer-motion 유지**, 대체는 별도 작업.
- **"Now / Values" 섹션 About으로 이동 가능성:** 사용자가 원하면 `/about`에 추가할 수 있음 — H2의 타협안이었음. 이 스펙에선 **미포함**, 추후 쉽게 붙일 수 있도록 여지만 둔다.

---

## 11. 범위 밖 (B · C 후속)

- **B · 백엔드 cold-start 개선:** 현 t2.micro 환경에서 첫 `/blog` 로딩 ~5초 → JVM warmup · DB pool priming · 캐시 전략. 별도 spec.
- **C · SEO / sitemap:** 주 1명 유입 문제. `ssr-notion`의 `/sitemap.xml` 검증, 메타태그 · OG 이미지 점검. 별도 spec. 이 A에서 새 Layout에 기본 `<title>`/`<meta>`/`<link rel="canonical">` 구조는 심어둠 (C에서 활용).
