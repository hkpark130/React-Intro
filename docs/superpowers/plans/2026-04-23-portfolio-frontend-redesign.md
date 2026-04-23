# 포트폴리오 프론트엔드 리디자인 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `React-Intro` 포트폴리오 사이트를 G-B 테마 + 상단 네비 + `/projects` 그리드 + B1-compact 블로그로 전면 리디자인하고, 다크모드 수동 토글을 추가한다. 동시에 미사용 npm 패키지 19개와 dead code (Spring `NotionService`, `BlogDetail` dead dialogs, `MarkdownEditor` 중복·주석)를 정리한다.

**Architecture:** 4-phase 순차 배포. Phase 1에 테마 시스템·Layout 기반. Phase 2에 Home 재작성 + `/projects` 신규. Phase 3에 Blog 리스타일 + MarkdownRenderer 토큰화 + About 페이지. Phase 4에 10개 프로젝트 detail 리스타일 + ChatWidget + ⌘K + 패키지 cleanup.

**Tech Stack:** React 19, Vite 6, MUI 7, Framer Motion, react-router-dom 7, react-markdown, cmdk (신규), Vitest + @testing-library/react (신규 테스트 인프라).

**Spec:** `docs/superpowers/specs/2026-04-23-portfolio-frontend-redesign-design.md`

**Working directory:** `C:\Users\User\IdeaProjects\port\React-Intro\`

---

## Phase Overview

| Phase | 목표 | 주요 산출물 | Task 수 |
|---|---|---|---|
| 1 | Theme + Layout 기반 | `tokens.css`, `ThemeProvider`, `TopNav`, `Footer`, `Layout` | 15 |
| 2 | Home + Projects 그리드 | `Home.jsx`, `/projects`, `ProjectCard`, `projects.ts` | 10 |
| 3 | Blog + Markdown + About | `Blog.jsx` B1-compact, `MarkdownRenderer` 토큰화, `About.jsx` | 14 |
| 4 | Project detail + Widget + 정리 | 10 detail 리스타일, ChatWidget, ⌘K, 패키지 cleanup | 18 |

**Dependencies:** Phase 1이 토큰·레이아웃 제공 → Phase 2/3는 병렬 가능 → Phase 4는 Phase 1-3 필요.

**Testing strategy:**
- **Unit test (Vitest):** 로직 있는 모듈 — `ThemeProvider`, `projects.ts` 필터, `categoryColors`, `CommandPalette` 검색, `MarkdownRenderer` 유틸.
- **Visual 확인:** UI-heavy 페이지 — 각 Phase 종료 시 `npm run dev` + 브라우저 (라이트·다크, 모바일 375px).
- **Regression fixture:** Phase 4 종료 시 `CodeAccordion` · `ZoomableImageModal` · `Bookmark` 각 5편씩 총 15편 블로그 글 before/after.

**Commit 규칙:** 각 Task 끝에 commit. 메시지 형식 `feat|fix|refactor|chore(scope): 설명` 한국어 OK.

---

## Phase 1: Theme + Layout 기반

Phase 1 종료 시 사이트는 **기능적으론 완전 동작**, 시각적으론 **과도기** — 사이드바는 사라지고 상단 네비·Footer가 들어오지만 내부 페이지들은 아직 보라 그라디언트·Paper elevation이 남아있음. Phase 2-4에서 페이지 단위로 교체.

### Task 1.1: 폰트 리소스 로드

**Files:**
- Modify: `index.html`

- [ ] **Step 1: `index.html` `<head>`에 Google Fonts 3종 로드**

현재 `<title>` 직전에 삽입:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: `npm run dev`로 네트워크 탭에서 폰트 3개 로드 확인**

Run: `npm run dev`
브라우저 DevTools → Network → Fonts. `Inter-Regular.woff2`, `JetBrainsMono-Regular.woff2`, `NotoSansKR-Regular.woff2` 각각 200 응답.

- [ ] **Step 3: 커밋**

```bash
git add index.html
git commit -m "feat(fonts): Inter · JetBrains Mono · Noto Sans KR Google Fonts 로드"
```

### Task 1.2: Vitest + Testing Library 설치

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/test/setup.js`

- [ ] **Step 1: 의존성 설치**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

- [ ] **Step 2: `package.json`에 test 스크립트 추가**

`"scripts"` 블록을 다음으로 교체:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 3: `vitest.config.js` 생성**

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
});
```

- [ ] **Step 4: `src/test/setup.js` 생성**

```javascript
import '@testing-library/jest-dom';
```

- [ ] **Step 5: smoke test로 환경 검증**

Create `src/test/smoke.test.js`:
```javascript
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('test runner works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm run test:run`
Expected: `1 passed`.

- [ ] **Step 6: smoke 파일 삭제 + 커밋**

```bash
rm src/test/smoke.test.js
git add package.json package-lock.json vitest.config.js src/test/setup.js
git commit -m "chore(test): Vitest + Testing Library 설치"
```

### Task 1.3: 컬러 토큰 CSS 작성

**Files:**
- Create: `src/theme/tokens.css`
- Modify: `src/index.css`

- [ ] **Step 1: `src/theme/tokens.css` 생성**

```css
/* G-B · Cool Slate + Subtle Indigo — Light (default) */
:root {
  --bg-canvas: #ffffff;
  --bg-raised: #f8fafc;
  --bg-subtle: #f1f5f9;

  --border: #e2e8f0;
  --border-muted: #f1f5f9;

  --ink: #0f172a;
  --ink-muted: #475569;
  --ink-subtle: #64748b;
  --ink-disabled: #94a3b8;

  --accent: #6366f1;
  --accent-bg: #eef2ff;

  --on-ink: #ffffff;

  /* Terminal (B-accent) */
  --term-bg: #0d1117;
  --term-border: #1e293b;
  --term-text: #c9d1d9;
  --term-muted: #8b949e;
  --term-green: #7ee787;
  --term-amber: #ffa657;
  --term-blue: #79c0ff;

  --font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", Consolas, Menlo, monospace;

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 999px;

  --shadow-subtle: 0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06);
  --shadow-popover: 0 10px 30px rgba(15,23,42,0.10);
}

[data-theme="dark"] {
  --bg-canvas: #0b1220;
  --bg-raised: #0f172a;
  --bg-subtle: #1e293b;

  --border: #1e293b;
  --border-muted: #1e293b;

  --ink: #f1f5f9;
  --ink-muted: #cbd5e1;
  --ink-subtle: #94a3b8;
  --ink-disabled: #64748b;

  --accent: #818cf8;
  --accent-bg: rgba(129,140,248,0.12);

  --on-ink: #0b1220;

  --shadow-subtle: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4);
  --shadow-popover: 0 10px 30px rgba(0,0,0,0.5);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

body {
  background-color: var(--bg-canvas);
  color: var(--ink);
  font-family: var(--font-sans);
  transition: background-color 150ms ease-out, color 150ms ease-out;
}
```

- [ ] **Step 2: `src/index.css` 전면 교체 (사이드바 CSS 제거)**

```css
@import './theme/tokens.css';

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root > * {
  background: transparent;
}

@media (max-width: 600px) {
  .MuiContainer-root {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
  .MuiTableContainer-root {
    overflow-x: auto;
  }
}
```

기존 `--bg-main`, `--bg-sidebar`, `--bg-page`, `.sidebar` 관련 CSS 전부 제거됨.

- [ ] **Step 3: `npm run dev`로 로드 확인**

브라우저에서 `http://localhost:5173` 열림. 배경이 흰색으로 변경됨 (이전 `#E0E0E0` 회색 대신). 레이아웃은 아직 깨질 수 있음 (사이드바 CSS 의존이 있던 부분).

- [ ] **Step 4: 커밋**

```bash
git add src/theme/tokens.css src/index.css
git commit -m "feat(theme): G-B 컬러 토큰 CSS + 사이드바 CSS 제거"
```

### Task 1.4: ThemeProvider + useTheme 훅

**Files:**
- Create: `src/theme/ThemeProvider.jsx`
- Create: `src/theme/ThemeProvider.test.jsx`

- [ ] **Step 1: 실패 테스트 작성**

Create `src/theme/ThemeProvider.test.jsx`:
```jsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeProvider';

function Consumer() {
  const { mode, toggleMode } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <button onClick={toggleMode} data-testid="toggle">Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light when no localStorage and system not dark', () => {
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    expect(screen.getByTestId('mode').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('uses localStorage value when present', () => {
    localStorage.setItem('theme', 'dark');
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggleMode flips + persists + updates html attribute', () => {
    render(<ThemeProvider><Consumer /></ThemeProvider>);
    act(() => screen.getByTestId('toggle').click());
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    act(() => screen.getByTestId('toggle').click());
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- ThemeProvider`
Expected: FAIL — `Cannot find module './ThemeProvider'`.

- [ ] **Step 3: ThemeProvider 구현**

Create `src/theme/ThemeProvider.jsx`:
```jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext({ mode: 'light', toggleMode: () => {} });
export const useTheme = () => useContext(ThemeContext);

const getInitialMode = () => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
};

const buildMuiTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#818cf8' : '#6366f1' },
      background: {
        default: mode === 'dark' ? '#0b1220' : '#ffffff',
        paper: mode === 'dark' ? '#0f172a' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
        secondary: mode === 'dark' ? '#cbd5e1' : '#475569',
      },
      divider: mode === 'dark' ? '#1e293b' : '#e2e8f0',
    },
    typography: {
      fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans KR", sans-serif',
    },
    shape: { borderRadius: 6 },
  });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(getInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);
  const ctx = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeContext.Provider value={ctx}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:run -- ThemeProvider`
Expected: `3 passed`.

- [ ] **Step 5: 커밋**

```bash
git add src/theme/ThemeProvider.jsx src/theme/ThemeProvider.test.jsx
git commit -m "feat(theme): ThemeProvider + useTheme 훅"
```

### Task 1.5: main.jsx에 ThemeProvider 연결

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: `src/main.jsx` 현재 상태 확인 (read only)**

Read: `src/main.jsx`. 현재 어떤 provider들이 있는지 파악. (`BrowserRouter`가 여기 있거나 App.jsx에 있거나 둘 중 하나.)

- [ ] **Step 2: `src/main.jsx` 재작성**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

- [ ] **Step 3: `src/App.jsx`에서 중복 제거**

다음 3가지를 `App.jsx`에서 제거:
1. `import { ThemeProvider, createTheme } from '@mui/material/styles'` — 제거
2. `import { yellow, purple } from '@mui/material/colors'` — 제거
3. `const theme = createTheme({...})` 블록 전체 — 제거
4. `<ThemeProvider theme={theme}>...</ThemeProvider>` 래퍼 — 안쪽 JSX만 남기고 래퍼 제거
5. `<CssBaseline />` — 제거 (ThemeProvider가 제공)

만약 `BrowserRouter`가 App.jsx에 있었다면 그것도 제거 (main.jsx로 이동).

- [ ] **Step 4: `npm run dev` 로 렌더 확인**

`http://localhost:5173/` 열림. 기존 페이지들이 렌더됨 (사이드바 포함 — 아직 제거 전). React DevTools 또는 Console에서:
```js
document.documentElement.getAttribute('data-theme')
// "light"
```

- [ ] **Step 5: 커밋**

```bash
git add src/main.jsx src/App.jsx
git commit -m "refactor(theme): App.jsx의 MUI ThemeProvider 제거, main.jsx로 통합"
```

### Task 1.6: TopNav 데스크탑 레이아웃

**Files:**
- Create: `src/components/layout/TopNav.jsx`

- [ ] **Step 1: TopNav 기본 구조 생성**

Create `src/components/layout/TopNav.jsx`:
```jsx
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@/theme/ThemeProvider';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Writing' },
  { to: '/about', label: 'About' },
];

export default function TopNav({ onMenuClick }) {
  const { mode, toggleMode } = useTheme();

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 3 },
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        '[data-theme="dark"] &': {
          backgroundColor: 'rgba(11,18,32,0.85)',
        },
      }}
    >
      {/* Left: logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <IconButton
          size="small"
          aria-label="메뉴"
          onClick={onMenuClick}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: 'var(--ink)',
          }}
        >
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '5px',
              bgcolor: 'var(--ink)',
              color: 'var(--on-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            박
          </Box>
          <Box sx={{ fontWeight: 600, fontSize: 14 }}>박현경</Box>
        </Link>
      </Box>

      {/* Center: nav links */}
      <Box
        component="nav"
        sx={{
          display: { xs: 'none', md: 'flex' },
          gap: 3,
        }}
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontSize: 13,
              color: isActive ? 'var(--ink)' : 'var(--ink-muted)',
              fontWeight: isActive ? 600 : 500,
              borderBottom: isActive ? '1.5px solid var(--ink)' : '1.5px solid transparent',
              paddingBottom: 2,
              transition: 'color 150ms ease-out',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </Box>

      {/* Right: kbd + theme toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            px: 0.8,
            py: 0.3,
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--border)',
            color: 'var(--ink-subtle)',
            borderRadius: '4px',
          }}
        >
          ⌘ K
        </Box>
        <Tooltip title={mode === 'light' ? '다크 모드' : '라이트 모드'}>
          <IconButton size="small" onClick={toggleMode} aria-label="테마 토글">
            {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: `npm run build`로 컴파일 에러 없는지 확인**

Run: `npm run build`
Expected: 빌드 성공, 새 파일 반영됨. (아직 Layout에 연결은 안 했으므로 UI엔 반영 없음.)

- [ ] **Step 3: 커밋**

```bash
git add src/components/layout/TopNav.jsx
git commit -m "feat(layout): TopNav 데스크탑 컴포넌트"
```

### Task 1.7: Footer

**Files:**
- Create: `src/components/layout/Footer.jsx`

- [ ] **Step 1: Footer 컴포넌트 생성**

Create `src/components/layout/Footer.jsx`:
```jsx
import React from 'react';
import { Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  const linkStyle = {
    color: 'var(--ink-subtle)',
    fontSize: 12,
    textDecoration: 'none',
    transition: 'color 150ms ease-out',
    '&:hover': { color: 'var(--ink)' },
  };

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid var(--border)',
        px: { xs: 2, md: 4 },
        py: 3,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 1.5,
        color: 'var(--ink-subtle)',
        fontSize: 12,
      }}
    >
      <Box sx={{ fontWeight: 500 }}>박현경 · Portfolio</Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Link href="https://github.com/hkpark130" target="_blank" rel="noopener noreferrer" sx={linkStyle}>
          GitHub ↗
        </Link>
        <Link
          href="https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/"
          target="_blank"
          rel="noopener noreferrer"
          sx={linkStyle}
        >
          LinkedIn ↗
        </Link>
        <Link component={RouterLink} to="/sitemap.xml" reloadDocument sx={linkStyle}>
          Sitemap
        </Link>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/layout/Footer.jsx
git commit -m "feat(layout): Footer (연도 없음, 얇은 단일 줄)"
```

### Task 1.8: 모바일 햄버거 메뉴 Drawer

**Files:**
- Create: `src/components/layout/MobileNavDrawer.jsx`

- [ ] **Step 1: 모바일 슬라이드 오버 메뉴 생성**

Create `src/components/layout/MobileNavDrawer.jsx`:
```jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Drawer, Box, IconButton, List, ListItemButton, ListItemText, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useTheme } from '@/theme/ThemeProvider';

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Writing' },
  { to: '/about', label: 'About' },
];

export default function MobileNavDrawer({ open, onClose }) {
  const { mode, toggleMode } = useTheme();
  const { pathname } = useLocation();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          bgcolor: 'var(--bg-canvas)',
          color: 'var(--ink)',
          borderLeft: '1px solid var(--border)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
        <Box sx={{ fontWeight: 600, fontSize: 14 }}>박현경</Box>
        <IconButton size="small" onClick={onClose} aria-label="메뉴 닫기">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'var(--border)' }} />
      <List sx={{ p: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={onClose}
              sx={{
                borderRadius: 'var(--radius-sm)',
                mb: 0.5,
                color: active ? 'var(--ink)' : 'var(--ink-muted)',
                fontWeight: active ? 600 : 500,
                '&:hover': { bgcolor: 'var(--bg-subtle)' },
              }}
            >
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'var(--border)' }} />
      <Box sx={{ p: 2 }}>
        <ListItemButton onClick={toggleMode} sx={{ borderRadius: 'var(--radius-sm)' }}>
          {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
          <ListItemText
            primary={mode === 'light' ? '다크 모드' : '라이트 모드'}
            primaryTypographyProps={{ fontSize: 14, ml: 1.5 }}
          />
        </ListItemButton>
      </Box>
    </Drawer>
  );
}
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/layout/MobileNavDrawer.jsx
git commit -m "feat(layout): 모바일 햄버거 Drawer"
```

### Task 1.9: Layout 통합 (TopNav + Footer + MobileNav + Outlet)

**Files:**
- Modify: `src/Layout.jsx`

- [ ] **Step 1: 기존 `Layout.jsx`를 전면 교체**

```jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TopNav from './components/layout/TopNav';
import Footer from './components/layout/Footer';
import MobileNavDrawer from './components/layout/MobileNavDrawer';
import ChatWidget from './components/ChatWidget';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ChatWidget />
    </Box>
  );
}
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/Layout.jsx
git commit -m "feat(layout): TopNav + Footer + MobileNav + Outlet 통합"
```

### Task 1.10: App.jsx 라우팅 재구성 (Layout + Route element)

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: `App.jsx` 전면 재작성**

```jsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Intro from './components/Intro';
import SpringBoot from './components/SpringBoot';
import Python from './components/Python';
import Golang from './components/Golang';
import Terraform from './components/Terraform';
import Opensearch from './components/Opensearch';
import Redmine from './components/Redmine';
import Chrome from './components/Chrome';
import ChatBot from './components/ChatBot';
import KredisOperator from './components/KredisOperator';
import Profile from './components/Profile';
import Blog from './components/Blog';
import BlogDetail from './components/BlogDetail';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { scheduleTokenRefresh } from '@/api/auth';

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    scheduleTokenRefresh(token);
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Intro />} />
        <Route path="/springboot" element={<SpringBoot />} />
        <Route path="/kredis" element={<KredisOperator />} />
        <Route path="/golang" element={<Golang />} />
        <Route path="/opensearch" element={<Opensearch />} />
        <Route path="/python" element={<Python />} />
        <Route path="/terraform" element={<Terraform />} />
        <Route path="/chrome" element={<Chrome />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/redmine" element={<Redmine />} />
        {/* /profile → /about redirect (About 컴포넌트는 Phase 3에서 구현) */}
        <Route path="/profile" element={<Navigate to="/about" replace />} />
        <Route path="/about" element={<Profile />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route
          path="/blog/create"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog/edit/:id"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

**주의:** `SidebarContext` · `Sidebar` · `MUI Container` wrapping 전부 제거됨. `/about`가 아직 `Profile`를 렌더 (Phase 3에서 About 컴포넌트로 교체). `/projects` 라우트는 Phase 2에서 추가.

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: `npm run dev`로 모든 기존 경로 접근 확인**

브라우저에서 다음을 순서대로 열어 404 없는지 확인:
- `/`, `/springboot`, `/kredis`, `/golang`, `/opensearch`, `/python`, `/terraform`, `/chrome`, `/chatbot`, `/redmine`, `/profile` (→ `/about`로 redirect), `/about`, `/blog`, `/blog/1`.

사이드바가 사라지고 상단 네비가 보여야 함. 페이지 내용은 과도기 상태 (Paper elevation·보라 그라디언트 남아있음).

- [ ] **Step 4: 커밋**

```bash
git add src/App.jsx
git commit -m "refactor(routing): Layout + Route element 패턴으로 전환, /profile → /about redirect"
```

### Task 1.11: Sidebar.jsx 삭제

**Files:**
- Delete: `src/components/Sidebar.jsx`

- [ ] **Step 1: Sidebar 파일 삭제**

```bash
rm src/components/Sidebar.jsx
```

- [ ] **Step 2: Sidebar 참조하는 곳 검색**

```bash
grep -rn "from.*Sidebar" src/
grep -rn "SidebarContext" src/
```

Expected: 결과 0건. (App.jsx 재작성 시 이미 제거됨.)

- [ ] **Step 3: 빌드 & dev 동작 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: 커밋**

```bash
git add -u src/components/Sidebar.jsx
git commit -m "chore(layout): Sidebar.jsx 삭제 (TopNav로 대체)"
```

### Task 1.12: TopNav active state 시각 검증

**Files:** 없음 (수동 확인)

- [ ] **Step 1: `npm run dev` + 브라우저 `http://localhost:5173`**

- [ ] **Step 2: 각 네비 클릭 시 active 스타일 확인**

`Home` 클릭 시 "Home" 글자가 `var(--ink)` + border-bottom. 다른 항목 클릭 시 동일하게 active 스타일 전환.

`/blog/1` 에 있을 때도 "Writing" 항목이 active (start-with `/blog`).

- [ ] **Step 3: 다크 모드 토글 동작 확인**

상단 우측의 🌙 아이콘 클릭. 전체 페이지 배경·텍스트가 다크 톤으로 전환. `<html data-theme="dark">` 확인. 새로고침해도 다크 유지.

- [ ] **Step 4: 모바일 뷰 (DevTools Device mode 375px)**

햄버거 클릭 → 오른쪽 Drawer 슬라이드 → 4개 항목 표시. 항목 클릭 시 해당 경로 이동 + Drawer 자동 닫힘.

문제 있으면 TopNav/MobileNavDrawer 수정 후 재검증. 문제 없으면 다음 Task.

### Task 1.13: index.html `<meta>` + `<title>` 기본 구조

**Files:**
- Modify: `index.html`

- [ ] **Step 1: `index.html` `<head>` 정돈**

기존 `<title>` · `<meta>` 블록을 다음으로 교체/추가:
```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0b1220" media="(prefers-color-scheme: dark)" />
<title>박현경 · Portfolio</title>
<meta name="description" content="DevOps Engineer 박현경의 포트폴리오 — Kubernetes Operator · Infrastructure as Code · 백엔드·인프라 자동화" />
<link rel="icon" href="/favicon.ico" />
```

- [ ] **Step 2: 빌드 + dev 확인**

Run: `npm run build`
브라우저 탭 타이틀: "박현경 · Portfolio". DevTools Elements에서 meta description 확인.

- [ ] **Step 3: 커밋**

```bash
git add index.html
git commit -m "feat(seo): 기본 <title> / <meta description> / theme-color 추가"
```

### Task 1.14: Phase 1 회귀 — lint 통과

**Files:** 없음

- [ ] **Step 1: lint 실행**

Run: `npm run lint`
Expected: 에러 0. 경고만 있으면 OK (다음 Phase에서 정리).

에러가 있으면 해결 후 commit:
```bash
git commit -am "chore(lint): Phase 1 후 lint 에러 정리"
```

### Task 1.15: Phase 1 종료 체크리스트 + 머지

**Files:** 없음 (검증만)

- [ ] **Step 1: 최종 검증 체크리스트**

- `npm run build` 성공
- `npm run test:run` 전부 pass (ThemeProvider 3 tests)
- `npm run lint` 에러 0
- 라이트/다크 수동 토글 동작
- 모바일 햄버거 메뉴 동작
- 모든 기존 URL 404 없음
- `/profile` → `/about`로 redirect
- `data-theme` HTML 속성이 `<html>`에 걸려있음

- [ ] **Step 2: Phase 1 완료 태그 (optional)**

```bash
git tag phase-1-done
```

**Phase 1 완료 상태:**
- 사이트는 전반적으로 **작동**은 하지만 내부 페이지들은 여전히 MUI Paper elevation + 보라·파랑 그라디언트 사용 중 (Phase 2~4에서 교체).
- 다크모드 토글 사용 가능. 하지만 내부 페이지 컴포넌트들이 다크 대응 안 되어 있어서 일부 페이지는 다크에서 이상하게 보일 수 있음 (정상 — Phase 2~4에서 해결).

---

## Phase 2: Home + `/projects` 그리드

Phase 2 종료 시 **Home (`/`) 과 `/projects`가 새 디자인으로 완성**. 나머지 내부 페이지들은 여전히 과도기 상태.

### Task 2.1: 카테고리 색상 매핑 상수

**Files:**
- Create: `src/data/categoryColors.js`
- Create: `src/data/categoryColors.test.js`

- [ ] **Step 1: 실패 테스트 작성**

Create `src/data/categoryColors.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { getCategoryColor, DEFAULT_CATEGORY_COLOR } from './categoryColors';

describe('categoryColors', () => {
  it('returns mapped color for known category', () => {
    const work = getCategoryColor('Work Experience');
    expect(work.bg).toBeDefined();
    expect(work.fg).toBeDefined();
  });

  it('returns default for unknown category', () => {
    const unknown = getCategoryColor('NoSuchCategory');
    expect(unknown).toEqual(DEFAULT_CATEGORY_COLOR);
  });

  it('is deterministic — same category always same color', () => {
    expect(getCategoryColor('Kubernetes')).toBe(getCategoryColor('Kubernetes'));
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- categoryColors`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: 구현**

Create `src/data/categoryColors.js`:
```javascript
export const DEFAULT_CATEGORY_COLOR = { bg: '#f1f5f9', fg: '#334155' };

const MAP = {
  'ALL': { bg: '#0f172a', fg: '#ffffff' },
  'Work Experience': { bg: '#eff6ff', fg: '#1e40af' },
  'Kubernetes': { bg: '#f0f9ff', fg: '#0369a1' },
  'Spring Boot': { bg: '#f0fdf4', fg: '#065f46' },
  'Spring': { bg: '#f0fdf4', fg: '#065f46' },
  'Go': { bg: '#ecfccb', fg: '#365314' },
  'Terraform': { bg: '#ede9fe', fg: '#5b21b6' },
  'CS 지식': { bg: '#fef3c7', fg: '#92400e' },
  '회고': { bg: '#fef3c7', fg: '#92400e' },
  'Etc': DEFAULT_CATEGORY_COLOR,
};

export function getCategoryColor(name) {
  return MAP[name] ?? DEFAULT_CATEGORY_COLOR;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:run -- categoryColors`
Expected: `3 passed`.

- [ ] **Step 5: 커밋**

```bash
git add src/data/categoryColors.js src/data/categoryColors.test.js
git commit -m "feat(data): categoryColors 상수 매핑"
```

### Task 2.2: projects.js 메타데이터 + featured 필터

**Files:**
- Create: `src/data/projects.js`
- Create: `src/data/projects.test.js`

- [ ] **Step 1: 실패 테스트 작성**

Create `src/data/projects.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { PROJECTS, getFeaturedProjects, getProjectsByTag } from './projects';

describe('projects data', () => {
  it('has 10 projects', () => {
    expect(PROJECTS.length).toBe(10);
  });

  it('every project has required fields', () => {
    for (const p of PROJECTS) {
      expect(p.slug).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.path).toMatch(/^\/[a-z]+/);
      expect(p.description).toBeTruthy();
      expect(Array.isArray(p.stack)).toBe(true);
      expect(Array.isArray(p.tags)).toBe(true);
    }
  });

  it('slug is unique', () => {
    const slugs = new Set(PROJECTS.map((p) => p.slug));
    expect(slugs.size).toBe(PROJECTS.length);
  });

  it('getFeaturedProjects returns exactly those with featured=true', () => {
    const featured = getFeaturedProjects();
    expect(featured.every((p) => p.featured === true)).toBe(true);
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.length).toBeLessThanOrEqual(4);
  });

  it('getProjectsByTag filters correctly', () => {
    const devops = getProjectsByTag('devops');
    expect(devops.every((p) => p.tags.includes('devops'))).toBe(true);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- projects`
Expected: FAIL.

- [ ] **Step 3: 구현**

Create `src/data/projects.js`:
```javascript
export const PROJECTS = [
  {
    slug: 'kredis',
    name: 'Kredis',
    kicker: 'Kubernetes Operator',
    path: '/kredis',
    description: 'Redis 클러스터 autoscaling operator. CRD 기반 reconcile 루프.',
    stack: ['Go', 'K8s', 'Operator'],
    tags: ['devops', 'infra', 'backend'],
    thumbnail: '/logo/kubernetes.svg',
    featured: true,
  },
  {
    slug: 'springboot',
    name: 'Spring Blog',
    kicker: 'Spring Boot',
    path: '/springboot',
    description: 'JWT · 캐시 · CodeDeploy 무중단 배포까지. 이 사이트 블로그를 서빙하는 엔진.',
    stack: ['Java', 'Spring', 'MySQL'],
    tags: ['backend'],
    thumbnail: '/logo/spring-boot.png',
    featured: true,
  },
  {
    slug: 'terraform',
    name: 'Terraform IaC',
    kicker: 'Infrastructure as Code',
    path: '/terraform',
    description: 'AWS 리소스 자동 프로비저닝 파이프라인.',
    stack: ['HCL', 'AWS'],
    tags: ['devops', 'infra'],
    thumbnail: '/logo/terraform.png',
    featured: true,
  },
  {
    slug: 'golang',
    name: 'Go JWT Auth',
    kicker: 'Go · 인증 서버',
    path: '/golang',
    description: 'Go로 구현한 경량 JWT 인증 서버 + 토큰 rotation.',
    stack: ['Go', 'JWT'],
    tags: ['backend'],
    thumbnail: '/logo/go.png',
    featured: false,
  },
  {
    slug: 'opensearch',
    name: 'OpenSearch Dashboard',
    kicker: '로그 분석',
    path: '/opensearch',
    description: 'OpenSearch 기반 로그 수집·시각화 대시보드.',
    stack: ['OpenSearch', 'Kibana'],
    tags: ['devops', 'infra'],
    thumbnail: '/logo/opensearch.png',
    featured: false,
  },
  {
    slug: 'python',
    name: '집값 예측 ML',
    kicker: 'Machine Learning',
    path: '/python',
    description: 'TensorFlow로 집값 예측 모델 학습 · 평가 파이프라인.',
    stack: ['Python', 'TensorFlow'],
    tags: ['ai'],
    thumbnail: '/logo/tensorflow.png',
    featured: false,
  },
  {
    slug: 'chrome',
    name: 'Chrome Extension',
    kicker: 'Browser Tooling',
    path: '/chrome',
    description: '업무 생산성 향상용 Chrome 확장 프로그램.',
    stack: ['JavaScript', 'Chrome API'],
    tags: ['frontend'],
    thumbnail: '/logo/chrome.png',
    featured: false,
  },
  {
    slug: 'chatbot',
    name: 'AI 챗봇',
    kicker: 'LLM Integration',
    path: '/chatbot',
    description: '포트폴리오 사이트에 내장된 AI 챗봇.',
    stack: ['LLM', 'Python'],
    tags: ['ai'],
    thumbnail: '/logo/chatbot.png',
    featured: false,
  },
  {
    slug: 'redmine',
    name: 'Redmine 자동화',
    kicker: '프로젝트 관리',
    path: '/redmine',
    description: 'Redmine 이슈 관리 자동화 도구 · 보고서 생성.',
    stack: ['Ruby', 'Redmine API'],
    tags: ['devops'],
    thumbnail: '/logo/redmine.png',
    featured: false,
  },
  {
    slug: 'ssr-notion',
    name: 'SSR-Notion Service',
    kicker: 'Node.js SSR',
    path: '/chatbot',
    description: 'Notion 렌더 + SEO 메타 preview + sitemap 서빙 Node.js SSR (별도 진입점 대체).',
    stack: ['Node.js', 'Express', 'Notion API'],
    tags: ['backend', 'infra'],
    thumbnail: '/logo/node.png',
    featured: false,
  },
];

export function getFeaturedProjects() {
  return PROJECTS.filter((p) => p.featured);
}

export function getProjectsByTag(tag) {
  if (!tag || tag === 'all') return PROJECTS;
  return PROJECTS.filter((p) => p.tags.includes(tag));
}

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}
```

**Note:** 10번째 프로젝트(ssr-notion) 슬롯은 실 사이트에 라우트가 아직 없으면 `/chatbot`로 가리키는 placeholder. 실제 프로젝트가 더 있으면 사용자가 수정.

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:run -- projects`
Expected: `5 passed`.

- [ ] **Step 5: 커밋**

```bash
git add src/data/projects.js src/data/projects.test.js
git commit -m "feat(data): projects.js 10개 프로젝트 메타 + 필터 유틸"
```

### Task 2.3: ProjectCard 컴포넌트

**Files:**
- Create: `src/components/projects/ProjectCard.jsx`

- [ ] **Step 1: ProjectCard 생성**

Create `src/components/projects/ProjectCard.jsx`:
```jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';

export default function ProjectCard({ project }) {
  return (
    <Box
      component={RouterLink}
      to={project.path}
      sx={{
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-canvas)',
        transition: 'border-color 150ms ease-out, transform 150ms ease-out',
        '&:hover': {
          borderColor: 'var(--ink)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          height: 140,
          bgcolor: 'var(--bg-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Box
          component="img"
          src={project.thumbnail}
          alt={project.name}
          sx={{ maxHeight: 64, maxWidth: 96, objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Box
          sx={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1.4px',
            color: 'var(--ink-subtle)',
            textTransform: 'uppercase',
          }}
        >
          {project.kicker}
        </Box>
        <Box sx={{ fontSize: 16, fontWeight: 700, mt: 0.5, color: 'var(--ink)' }}>
          {project.name}
        </Box>
        <Box sx={{ fontSize: 12, color: 'var(--ink-muted)', mt: 0.8, lineHeight: 1.55, minHeight: 36 }}>
          {project.description}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.6, mt: 1.2, flexWrap: 'wrap' }}>
          {project.stack.map((s) => (
            <Box
              key={s}
              sx={{
                fontSize: 10,
                px: 1,
                py: 0.25,
                bgcolor: 'var(--bg-subtle)',
                color: 'var(--ink-muted)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              {s}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/projects/ProjectCard.jsx
git commit -m "feat(projects): ProjectCard 컴포넌트"
```

### Task 2.4: /projects ProjectsGrid 페이지

**Files:**
- Create: `src/components/projects/ProjectsGrid.jsx`

- [ ] **Step 1: ProjectsGrid 생성**

Create `src/components/projects/ProjectsGrid.jsx`:
```jsx
import React from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { PROJECTS } from '@/data/projects';

const variant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
};

export default function ProjectsGrid() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
          Selected Work · {PROJECTS.length}
        </Box>
        <Box sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 600, letterSpacing: '-0.6px', mt: 1, color: 'var(--ink)' }}>
          Projects
        </Box>
        <Box sx={{ fontSize: 14, color: 'var(--ink-muted)', mt: 1, maxWidth: 540 }}>
          Cloud infrastructure, Kubernetes operators, 그리고 빌드해 본 도구들.
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {PROJECTS.map((p, i) => (
          <motion.div
            key={p.slug}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={variant}
          >
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/projects/ProjectsGrid.jsx
git commit -m "feat(projects): ProjectsGrid 페이지 컴포넌트"
```

### Task 2.5: /projects 라우트 추가

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: 라우트 추가**

`src/App.jsx`에 `ProjectsGrid` import 추가 + 라우트 추가:

```jsx
import ProjectsGrid from './components/projects/ProjectsGrid';
```

라우트 목록의 `Home (/)` 아래에 삽입:
```jsx
<Route path="/projects" element={<ProjectsGrid />} />
```

- [ ] **Step 2: `npm run dev` → `/projects` 방문 검증**

브라우저 `http://localhost:5173/projects` → 10개 카드 그리드 표시. 각 카드 클릭 시 해당 detail 페이지로 이동.

라이트·다크 양쪽에서 카드 보더·호버 스타일 동작 확인.

- [ ] **Step 3: TopNav "Projects" 링크 active 검증**

`/projects`에 있을 때 TopNav의 "Projects" 메뉴가 active 상태 (border-bottom).

- [ ] **Step 4: 커밋**

```bash
git add src/App.jsx
git commit -m "feat(routing): /projects 라우트 추가"
```

### Task 2.6: 새 Home 컴포넌트 — Hero 섹션

**Files:**
- Create: `src/components/home/Home.jsx`
- Create: `src/components/home/Hero.jsx`

- [ ] **Step 1: Hero 섹션 컴포넌트**

Create `src/components/home/Hero.jsx`:
```jsx
import React from 'react';
import { Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <Box
      component={motion.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        py: { xs: 7, md: 10 },
        px: { xs: 2, md: 0 },
        background: 'linear-gradient(180deg, var(--bg-canvas) 0%, var(--bg-raised) 100%)',
      }}
    >
      <Box sx={{ maxWidth: 720, mx: 'auto' }}>
        <Box
          sx={{
            fontSize: 11,
            letterSpacing: '1.6px',
            fontWeight: 700,
            color: 'var(--ink-subtle)',
            textTransform: 'uppercase',
          }}
        >
          Portfolio · 2026
        </Box>
        <Box
          component="h1"
          sx={{
            fontSize: { xs: 32, md: 40 },
            fontWeight: 600,
            letterSpacing: '-1px',
            lineHeight: 1.05,
            mt: 1.5,
            mb: 0,
            color: 'var(--ink)',
          }}
        >
          박현경
        </Box>
        <Box
          sx={{
            display: 'inline-block',
            mt: 1.5,
            px: 1.2,
            py: 0.4,
            bgcolor: 'var(--ink)',
            color: 'var(--on-ink)',
            borderRadius: 'var(--radius-xs)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          DEVOPS ENGINEER
        </Box>
        <Box sx={{ fontSize: { xs: 15, md: 16 }, color: 'var(--ink-muted)', mt: 3, lineHeight: 1.7, maxWidth: 540 }}>
          Cloud platforms at scale — Kubernetes operators, Infrastructure as Code, 그리고 데이터가 흐르는 시스템을
          안정적으로 운영합니다. CKA · AWS SAA 보유.
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            component={RouterLink}
            to="/projects"
            variant="contained"
            sx={{
              bgcolor: 'var(--ink)',
              color: 'var(--on-ink)',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              px: 2,
              py: 1,
              '&:hover': { bgcolor: 'var(--ink)', opacity: 0.9 },
            }}
          >
            View Projects →
          </Button>
          <Button
            component="a"
            href="https://github.com/hkpark130"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            sx={{
              color: 'var(--ink-muted)',
              borderColor: 'var(--border)',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 500,
              px: 2,
              py: 1,
              '&:hover': { borderColor: 'var(--ink)', color: 'var(--ink)' },
            }}
          >
            GitHub ↗
          </Button>
          <Box
            component={RouterLink}
            to="/blog"
            sx={{
              fontSize: 13,
              color: 'var(--accent)',
              fontWeight: 500,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              ml: 0.5,
            }}
          >
            Read writing →
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/home/Hero.jsx
git commit -m "feat(home): Hero 섹션 컴포넌트"
```

### Task 2.7: Home Selected Work + Recent Writing + Contact + 통합

**Files:**
- Create: `src/components/home/SelectedWork.jsx`
- Create: `src/components/home/RecentWriting.jsx`
- Create: `src/components/home/Contact.jsx`
- Create: `src/components/home/Home.jsx`

- [ ] **Step 1: SelectedWork (featured 3) 컴포넌트**

Create `src/components/home/SelectedWork.jsx`:
```jsx
import React from 'react';
import { Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProjectCard from '@/components/projects/ProjectCard';
import { getFeaturedProjects } from '@/data/projects';

export default function SelectedWork() {
  const featured = getFeaturedProjects();
  return (
    <Box
      component="section"
      sx={{ borderTop: '1px solid var(--border)', py: { xs: 5, md: 7 } }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
          <Box>
            <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
              Selected Work
            </Box>
            <Box sx={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px', mt: 0.5, color: 'var(--ink)' }}>
              Projects
            </Box>
          </Box>
          <Box
            component={RouterLink}
            to="/projects"
            sx={{
              fontSize: 12,
              color: 'var(--accent)',
              fontWeight: 500,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            See all 10 →
          </Box>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 2: RecentWriting (최신 3개 포스트) 컴포넌트**

Create `src/components/home/RecentWriting.jsx`:
```jsx
import React, { useEffect, useState } from 'react';
import { Box, Container, Skeleton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchPosts } from '@/api/api';
import { getCategoryColor } from '@/data/categoryColors';

export default function RecentWriting() {
  const [posts, setPosts] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPosts(0, 3)
      .then(({ data }) => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .catch(() => setPosts([]));
  }, []);

  return (
    <Box
      component="section"
      sx={{ borderTop: '1px solid var(--border)', py: { xs: 5, md: 7 } }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
          <Box>
            <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
              Recent Writing
            </Box>
            <Box sx={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px', mt: 0.5, color: 'var(--ink)' }}>
              Blog
            </Box>
          </Box>
          <Box
            component={RouterLink}
            to="/blog"
            sx={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            All {total || 109} posts →
          </Box>
        </Box>
        <Box sx={{ maxWidth: 720 }}>
          {posts === null && [...Array(3)].map((_, i) => (
            <Box key={i} sx={{ py: 1.2, borderBottom: '1px solid var(--border-muted)' }}>
              <Skeleton width="65%" height={22} />
              <Skeleton width="20%" height={16} />
            </Box>
          ))}
          {posts?.map((p) => (
            <Box
              key={p.id}
              component={RouterLink}
              to={`/blog/${p.id}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.3,
                borderBottom: '1px solid var(--border-muted)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 150ms ease-out',
                '&:hover': { bgcolor: 'var(--accent-bg)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                {p.category && (() => {
                  const c = getCategoryColor(p.category);
                  return (
                    <Box sx={{ fontSize: 10, px: 0.8, py: 0.2, borderRadius: 'var(--radius-xs)', bgcolor: c.bg, color: c.fg, flexShrink: 0 }}>
                      {p.category}
                    </Box>
                  );
                })()}
                <Box sx={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </Box>
              </Box>
              <Box sx={{ fontSize: 11, color: 'var(--ink-subtle)', flexShrink: 0, ml: 2 }}>
                {new Date(p.createdAt).toLocaleDateString()}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 3: Contact 섹션**

Create `src/components/home/Contact.jsx`:
```jsx
import React from 'react';
import { Box, Container } from '@mui/material';

export default function Contact() {
  return (
    <Box
      component="section"
      sx={{
        borderTop: '1px solid var(--border)',
        py: { xs: 5, md: 7 },
        bgcolor: 'var(--bg-raised)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--ink-subtle)', textTransform: 'uppercase' }}>
          Get in touch
        </Box>
        <Box sx={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px', mt: 0.5, color: 'var(--ink)' }}>
          Let's talk.
        </Box>
        <Box sx={{ fontSize: 13, color: 'var(--ink-muted)', mt: 1.5, maxWidth: 480 }}>
          DevOps · 풀스택 · 인프라 자동화 관련 이슈 언제든 환영합니다.
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box
            component="a"
            href="mailto:hkpark130@naver.com"
            sx={{
              px: 1.8,
              py: 0.9,
              bgcolor: 'var(--ink)',
              color: 'var(--on-ink)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            hkpark130@naver.com
          </Box>
          <Box
            component="a"
            href="https://github.com/hkpark130"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}
          >
            GitHub ↗
          </Box>
          <Box
            component="a"
            href="https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}
          >
            LinkedIn ↗
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 4: Home 통합 컴포넌트**

Create `src/components/home/Home.jsx`:
```jsx
import React from 'react';
import Hero from './Hero';
import SelectedWork from './SelectedWork';
import RecentWriting from './RecentWriting';
import Contact from './Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <RecentWriting />
      <Contact />
    </>
  );
}
```

- [ ] **Step 5: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 6: 커밋**

```bash
git add src/components/home/
git commit -m "feat(home): Hero + SelectedWork + RecentWriting + Contact 컴포넌트"
```

### Task 2.8: / 라우트를 새 Home 으로 교체

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: `src/App.jsx`에서 교체**

`import Intro from './components/Intro';` → `import Home from './components/home/Home';`
`<Route path="/" element={<Intro />} />` → `<Route path="/" element={<Home />} />`

- [ ] **Step 2: `npm run dev`로 Home 방문 검증**

`/` 열림. Hero (이름 · DEVOPS ENGINEER · 요약 · 3버튼) · SelectedWork (3카드) · RecentWriting (최신 3개 포스트) · Contact. 각 섹션 사이 `border-top` 구분. 기존 `Intro` 페이지의 긴 스크롤은 사라짐.

라이트·다크 양쪽 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/App.jsx
git commit -m "feat(home): / 라우트 새 Home 컴포넌트로 교체"
```

### Task 2.9: 기존 Intro.jsx 삭제

**Files:**
- Delete: `src/components/Intro.jsx`

- [ ] **Step 1: Intro.jsx 참조 검색**

```bash
grep -rn "from.*Intro" src/
```

Expected: `from './components/home/Home'` 만 검색되고 `from './components/Intro'`는 0건.

- [ ] **Step 2: 삭제**

```bash
rm src/components/Intro.jsx
```

- [ ] **Step 3: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: 커밋**

```bash
git add -u src/components/Intro.jsx
git commit -m "chore(home): 기존 Intro.jsx 삭제 (Home으로 대체)"
```

### Task 2.10: Phase 2 종료 검증 + lint

**Files:** 없음

- [ ] **Step 1: 전체 테스트 통과**

Run: `npm run test:run`
Expected: 전 테스트 pass (ThemeProvider 3, categoryColors 3, projects 5 = 11).

- [ ] **Step 2: 빌드 성공**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: lint**

Run: `npm run lint`
Expected: 에러 0.

- [ ] **Step 4: 수동 QA 체크리스트**

브라우저 수동 확인:
- `/` Home 페이지 Hero · 3 featured cards · 3 blog posts · Contact 섹션 모두 보임
- `/projects` 10개 카드 그리드
- 라이트/다크 양쪽에서 카드·섹션 경계·텍스트 콘트라스트 OK
- 모바일 375px에서 카드 1열, 섹션 세로 스택
- TopNav active state가 페이지 이동 시 따라감

- [ ] **Step 5: Phase 2 완료 태그**

```bash
git tag phase-2-done
```

---

## Phase 3: Blog + MarkdownRenderer + About

Phase 3 종료 시 `/blog` · `/blog/:id` · `/about` · Login · CreatePost · EditPost 전부 새 테마.

### Task 3.1: MarkdownRenderer 토큰화 + 커스텀 태그 정리

**Files:**
- Modify: `src/components/markdown/MarkdownRenderer.jsx`

- [ ] **Step 1: `CUSTOM_TAGS`에서 `Alert` 제거 (AlertBlock만 유지)**

`src/components/markdown/MarkdownRenderer.jsx` L20:
```javascript
// Before:
const CUSTOM_TAGS = ['CodeAccordion', 'ZoomableImageModal', 'Bookmark', 'Alert', 'AlertBlock'];

// After:
const CUSTOM_TAGS = ['CodeAccordion', 'ZoomableImageModal', 'Bookmark', 'AlertBlock'];
```

componentMap (L151 근처)에서 `alert:` 항목 제거:
```javascript
// Before:
alert: () => <AlertBlock severity={attrs.severity || 'info'}>{innerContent}</AlertBlock>,
alertblock: () => <AlertBlock severity={attrs.severity || 'info'}>{innerContent}</AlertBlock>

// After:
alertblock: () => <AlertBlock severity={attrs.severity || 'info'}>{innerContent}</AlertBlock>,
```

**참고:** 109편 기존 글 중 `<Alert>` 사용은 Phase 4에서 DB migration으로 일괄 `<AlertBlock>` 치환 (Task 4.15 참조).

- [ ] **Step 2: `sanitizeUnknownTags` allowlist 정리**

L97 근처:
```javascript
// Before:
const allowedTags = `custom|section|p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary|video|source|u|small|mark|b`;

// After (custom, section 제거):
const allowedTags = `p|div|span|h[1-6]|a|ul|ol|li|pre|code|em|strong|br|hr|blockquote|table|thead|tbody|tr|th|td|img|figure|figcaption|details|summary|video|source|u|small|mark|b`;
```

- [ ] **Step 3: `CODE_BLOCK_STYLE` 토큰화**

L116 근처:
```javascript
// Before:
const CODE_BLOCK_STYLE = { marginTop: 0, marginBottom: 0, backgroundColor: 'rgb(224, 224, 224)', padding: '10px', borderRadius: '4px', overflowX: 'auto' };

// After:
const CODE_BLOCK_STYLE = {
  marginTop: 0,
  marginBottom: 0,
  backgroundColor: 'var(--term-bg)',
  color: 'var(--term-text)',
  border: '1px solid var(--term-border)',
  padding: '12px 14px',
  borderRadius: 'var(--radius-md)',
  overflowX: 'auto',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  lineHeight: 1.7,
};
```

- [ ] **Step 4: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: 커밋**

```bash
git add src/components/markdown/MarkdownRenderer.jsx
git commit -m "refactor(markdown): CUSTOM_TAGS에서 Alert 제거, sanitize allowlist 정리, CODE_BLOCK_STYLE 토큰화"
```

### Task 3.2: MarkdownEditor 중복·주석 정리

**Files:**
- Modify: `src/components/markdown/MarkdownEditor.jsx`

- [ ] **Step 1: 언어 드롭다운 `tsx` 중복 제거**

L800 근처:
```javascript
// Before:
{['bash','json','yaml','yml','java','kotlin','go','python','javascript','typescript','tsx','tsx','sql','xml','html','css','dockerfile','ini','toml'].map(...)}

// After:
{['bash','json','yaml','yml','java','kotlin','go','python','javascript','typescript','tsx','sql','xml','html','css','dockerfile','ini','toml'].map(...)}
```

- [ ] **Step 2: 철거 흔적 주석 4군데 제거**

다음 주석 라인들을 삭제:
- L80-81: `// Html 경로 제거: 마크다운만 지원`
- L262: `// 마크다운 붙여넣기 기능 제거`
- L647: `{/* HTML 삽입 형식 제거: 항상 마크다운만 */}`
- L757: `{/* 마크다운 붙여넣기 모드 제거 */}`

- [ ] **Step 3: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: 커밋**

```bash
git add src/components/markdown/MarkdownEditor.jsx
git commit -m "chore(editor): tsx 중복 제거, 철거 흔적 주석 4군데 정리"
```

### Task 3.3: AlertBlock 토큰화

**Files:**
- Modify: `src/components/markdown/AlertBlock.jsx`

- [ ] **Step 1: 색상 토큰화**

`src/components/markdown/AlertBlock.jsx` 전면 교체:
```jsx
import React from 'react';
import { Alert } from '@mui/material';

const normalizeSeverity = (val) => {
  const allowed = new Set(['info', 'warning', 'error']);
  const s = String(val || '').toLowerCase();
  return allowed.has(s) ? s : 'info';
};

const STYLE_MAP = {
  info: {
    bgcolor: 'var(--accent-bg)',
    borderLeft: '3px solid var(--accent)',
  },
  warning: {
    bgcolor: 'rgba(234, 179, 8, 0.08)',
    borderLeft: '3px solid #eab308',
  },
  error: {
    bgcolor: 'rgba(239, 68, 68, 0.08)',
    borderLeft: '3px solid #ef4444',
  },
};

export default function AlertBlock({ severity = 'info', children }) {
  const sev = normalizeSeverity(severity);
  return (
    <Alert
      severity={sev}
      sx={{
        mt: 2,
        fontSize: '0.875rem',
        color: 'var(--ink)',
        bgcolor: STYLE_MAP[sev].bgcolor,
        borderLeft: STYLE_MAP[sev].borderLeft,
        borderRadius: 'var(--radius-sm)',
        '& .MuiAlert-icon': { color: 'var(--ink-muted)' },
      }}
    >
      {children}
    </Alert>
  );
}
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/markdown/AlertBlock.jsx
git commit -m "refactor(markdown): AlertBlock 색상 토큰화"
```

### Task 3.4: Bookmark 토큰화

**Files:**
- Modify: `src/components/markdown/Bookmark.jsx`

- [ ] **Step 1: Paper 테두리 + 배경 토큰화**

`src/components/markdown/Bookmark.jsx`의 Paper sx 블록 찾아서 수정:
```jsx
// 검색: sx={{ ... border: '1px solid #e0e0e0' ... }}
// 변경: 
sx={{
  width: '100%',
  maxWidth: '700px',
  my: 1.5,
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
  border: '1px solid var(--border)',
  bgcolor: 'var(--bg-canvas)',
  transition: 'transform 150ms ease-out, border-color 150ms ease-out',
  cursor: 'pointer',
  boxShadow: 'none',
  '&:hover': {
    borderColor: 'var(--ink)',
    transform: 'translateY(-2px)',
  },
}}
```

Paper는 `elevation={0}` 로 명시. MUI elevation 제거.

제목·설명 색상도 토큰으로:
- 제목 Typography `sx={{ ... }}`에 `color: 'var(--ink)'` 추가
- 설명 Typography에 `color: 'var(--ink-muted)'` 추가
- 도메인 Typography에 `color: 'var(--ink-subtle)'` 추가

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/markdown/Bookmark.jsx
git commit -m "refactor(markdown): Bookmark 색상·elevation 토큰화"
```

### Task 3.5: CodeAccordion 다크모드 Prism 테마 스위치

**Files:**
- Modify: `src/components/section/CodeAccordion.jsx`

- [ ] **Step 1: useTheme 훅 + 동적 Prism 테마**

`src/components/section/CodeAccordion.jsx` 재작성:
```jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Accordion, AccordionSummary, AccordionDetails, Typography,
} from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/theme/ThemeProvider';

export default function CodeAccordion({
  codeString,
  title = '코드 살펴보기',
  language = 'java',
  showLineNumbers = true,
  wrapLines = true,
  defaultExpanded = false,
}) {
  const { mode } = useTheme();
  const initial = String(defaultExpanded) === 'true' || defaultExpanded === true;
  const [expanded, setExpanded] = useState(initial);
  const prismStyle = mode === 'dark' ? vscDarkPlus : solarizedlight;

  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        m: 0,
        my: 2,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md) !important',
        bgcolor: 'var(--bg-canvas)',
        '&:before': { display: 'none' },
        '&.Mui-expanded': { margin: '16px 0 !important' },
      }}
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
    >
      <AccordionSummary
        sx={{
          backgroundColor: 'var(--bg-subtle)',
          flexDirection: 'row-reverse',
          minHeight: 44,
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          '&.Mui-expanded': { minHeight: 44 },
          '& .MuiAccordionSummary-content': { margin: '10px 0' },
          '& .MuiAccordionSummary-content.Mui-expanded': { margin: '10px 0' },
          '& .MuiAccordionSummary-expandIconWrapper': {
            marginRight: 1,
            color: 'var(--ink-muted)',
            transform: 'none',
            transition: 'none',
          },
          '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': { transform: 'none' },
        }}
        expandIcon={expanded ? <ArrowDropDownIcon sx={{ fontSize: 28 }} /> : <ArrowRightIcon sx={{ fontSize: 28 }} />}
      >
        <Typography variant="subtitle2" sx={{ color: 'var(--ink)', fontWeight: 600 }}>
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <SyntaxHighlighter
          language={language}
          style={prismStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={wrapLines}
          customStyle={{
            background: mode === 'dark' ? '#0d1117' : undefined,
            margin: 0,
            padding: '16px',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
            borderRadius: '0 0 var(--radius-md) var(--radius-md)',
          }}
          lineNumberStyle={{
            color: mode === 'dark' ? 'var(--term-muted)' : '#94a3b8',
            marginRight: '1em',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </AccordionDetails>
    </Accordion>
  );
}

CodeAccordion.propTypes = {
  codeString: PropTypes.string.isRequired,
  title: PropTypes.string,
  language: PropTypes.string,
  showLineNumbers: PropTypes.bool,
  wrapLines: PropTypes.bool,
  defaultExpanded: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};
```

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/section/CodeAccordion.jsx
git commit -m "feat(code): CodeAccordion 다크모드 Prism 테마 동적 스위치"
```

### Task 3.6: Blog.jsx B1-compact feed 재작성

**Files:**
- Modify: `src/components/Blog.jsx`

- [ ] **Step 1: Blog.jsx 전면 재작성**

`src/components/Blog.jsx`를 다음으로 교체:
```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, TextField, InputAdornment, CircularProgress, Pagination, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { fetchPosts, fetchCategories } from '../api/api';
import { getCategoryColor } from '@/data/categoryColors';

const POSTS_PER_PAGE = 10;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const totalPages = Math.ceil(total / POSTS_PER_PAGE) || 1;

  // Load categories once
  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(data || []))
      .catch(() => setCategories([]));
  }, []);

  // Sync state from URL
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const nextPage = Math.max(1, parseInt(p.get('page'), 10) || 1);
    const nextSearch = p.get('search') || '';
    const nextCatId = p.get('categoryId') || '';
    setPage(nextPage);
    setSearchTerm(nextSearch);
    setSearchInput(nextSearch);
    setSelectedCategoryId(nextCatId);
  }, [location.search]);

  // Fetch posts on state change
  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * POSTS_PER_PAGE;
    fetchPosts(offset, POSTS_PER_PAGE, searchTerm, selectedCategoryId)
      .then(({ data }) => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .catch(() => {
        setPosts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, searchTerm, selectedCategoryId]);

  const updateUrl = (next) => {
    const p = new URLSearchParams(location.search);
    Object.entries(next).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    navigate(`/blog?${p.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrl({ search: searchInput, page: '1' });
  };

  const handleSearchClear = () => {
    setSearchInput('');
    updateUrl({ search: '', page: '1' });
  };

  const handleCategorySelect = (catId) => {
    updateUrl({ categoryId: catId, page: '1' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
          Writing · {total}
        </Box>
        <Box sx={{ fontSize: { xs: 26, md: 30 }, fontWeight: 600, letterSpacing: '-0.5px', mt: 0.5, color: 'var(--ink)' }}>
          Blog
        </Box>
        <Box sx={{ fontSize: 13, color: 'var(--ink-muted)', mt: 0.5 }}>
          DevOps · 백엔드 · 인프라 · 회고. 지금까지 {total}편.
        </Box>
      </Box>

      {/* Category chips + search */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          <CategoryChip
            name="ALL"
            active={!selectedCategoryId}
            onClick={() => handleCategorySelect('')}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              name={c.name}
              active={String(selectedCategoryId) === String(c.id)}
              onClick={() => handleCategorySelect(c.id)}
            />
          ))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              size="small"
              placeholder="글 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearchClear}><CloseIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>
      </Box>

      {/* Posts */}
      <Box sx={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', bgcolor: 'var(--bg-canvas)' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!loading && posts.length === 0 && (
          <Box sx={{ py: 5, textAlign: 'center', color: 'var(--ink-subtle)', fontSize: 13 }}>
            조건에 맞는 글이 없습니다.
          </Box>
        )}
        {!loading && posts.map((post) => (
          <PostRow key={post.id} post={post} onClick={() => navigate(`/blog/${post.id}?page=${page}`)} />
        ))}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Box sx={{ fontSize: 11, color: 'var(--ink-subtle)' }}>
            {(page - 1) * POSTS_PER_PAGE + 1}-{Math.min(page * POSTS_PER_PAGE, total)} of {total}
          </Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => updateUrl({ page: String(v) })}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}

function CategoryChip({ name, active, onClick }) {
  const c = getCategoryColor(name);
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        fontSize: 11,
        px: 1.2,
        py: 0.5,
        borderRadius: 'var(--radius-pill)',
        fontWeight: 500,
        bgcolor: active ? 'var(--ink)' : c.bg,
        color: active ? 'var(--on-ink)' : c.fg,
        border: active ? '1px solid var(--ink)' : '1px solid transparent',
        transition: 'all 150ms ease-out',
        '&:hover': { opacity: 0.85 },
      }}
    >
      {name}
    </Box>
  );
}

function PostRow({ post, onClick }) {
  const cat = post.category ? getCategoryColor(post.category) : null;
  const formatted = new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'grid',
        gridTemplateColumns: '48px 100px 1fr auto 90px',
        gap: 1.5,
        alignItems: 'center',
        px: 2,
        py: 1.3,
        borderBottom: '1px solid var(--border-muted)',
        cursor: 'pointer',
        transition: 'background-color 150ms ease-out',
        '&:last-child': { borderBottom: 0 },
        '&:hover': { bgcolor: 'var(--accent-bg)' },
      }}
    >
      <Box sx={{ color: 'var(--ink-subtle)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
        #{post.id}
      </Box>
      {cat ? (
        <Box sx={{
          fontSize: 10,
          fontWeight: 600,
          px: 1,
          py: 0.3,
          borderRadius: 'var(--radius-xs)',
          bgcolor: cat.bg,
          color: cat.fg,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {post.category}
        </Box>
      ) : <Box />}
      <Box sx={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {post.title}
      </Box>
      <Box sx={{
        fontSize: 10,
        fontWeight: 700,
        px: 0.8,
        py: 0.2,
        borderRadius: 'var(--radius-pill)',
        bgcolor: post.commentCount > 0 ? 'var(--accent)' : 'var(--border)',
        color: post.commentCount > 0 ? '#fff' : 'var(--ink-subtle)',
        minWidth: 22,
        textAlign: 'center',
      }}>
        💬 {post.commentCount || 0}
      </Box>
      <Box sx={{ fontSize: 11, color: 'var(--ink-subtle)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
        {formatted}
      </Box>
    </Box>
  );
}
```

**제거된 기능:** 로그인 버튼 · 새 게시글 작성 버튼 · 필터 초기화 버튼. 이들은 Phase 4에서 ⌘K 커맨드 팔레트로 이동.

- [ ] **Step 2: `npm run dev` → `/blog` 방문 확인**

카테고리 chip 가로 나열 + 검색 인풋 + posts 행 형태 확인. 번호 `#109` 표시. 댓글수 뱃지. 날짜.

페이지네이션 동작 확인. 카테고리 chip 클릭 시 필터링.

- [ ] **Step 3: 커밋**

```bash
git add src/components/Blog.jsx
git commit -m "feat(blog): B1-compact feed 재작성 (# index + 카테고리 chip + 검색)"
```

### Task 3.7: BlogDetail dead code 제거 + 리스타일

**Files:**
- Modify: `src/components/BlogDetail.jsx`

- [ ] **Step 1: Dead Edit Dialog 삭제 (L662-706)**

`BlogDetail.jsx`에서 다음 블록을 **완전 삭제**:
- `const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);` (사용 안 됨)
- `const [editedPost, setEditedPost] = useState(...);`
- `handleUpdatePost` 함수 전체
- `/* 게시글 수정 다이얼로그 */` 블록 전체 `<Dialog open={isEditDialogOpen}>...</Dialog>`

- [ ] **Step 2: Dead Login Dialog 삭제 (L721)**

- `const [isLoginOpen, setIsLoginOpen] = useState(false);`
- `<Login open={isLoginOpen} onClose={...} />` 블록
- `import Login from './Login';` 라인

- [ ] **Step 3: 본문 컨테이너 max-width 680px + Paper elevation 제거**

`Container maxWidth="lg"` → `Container maxWidth="md"` 로. 
`Paper elevation={3}` → `elevation={0}` + `sx={{ border: '1px solid var(--border)', bgcolor: 'var(--bg-canvas)', borderRadius: 'var(--radius-lg)' }}`

본문 `Box` wrapper에 `maxWidth: 680, mx: 'auto'`.

- [ ] **Step 4: 제목·메타 색상 토큰화**

- `Typography variant="h4"` 에 `sx={{ color: 'var(--ink)', letterSpacing: '-0.5px' }}`
- 작성자·날짜 Typography에 `color: 'var(--ink-subtle)'`

- [ ] **Step 5: Prose 스타일 적용**

본문 렌더 `Box` 의 sx에 다음 추가:
```jsx
sx={{
  mb: 3,
  '& h2, & h3': { mt: '2em', mb: '0.5em', color: 'var(--ink)' },
  '& p, & li': { fontSize: 16, lineHeight: 1.75, color: 'var(--ink)' },
  '& blockquote': {
    borderLeft: '3px solid var(--accent)',
    pl: 2,
    color: 'var(--ink-muted)',
    fontStyle: 'italic',
    margin: 0,
    my: 2,
  },
  '& a': { color: 'var(--accent)' },
  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 'var(--radius-md)' },
  '& code': {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85em',
    bgcolor: 'var(--bg-subtle)',
    px: 0.6,
    py: 0.15,
    borderRadius: 'var(--radius-xs)',
  },
  '& pre code': { bgcolor: 'transparent', p: 0 },
  '& *': { maxWidth: '100%', boxSizing: 'border-box' },
  wordWrap: 'break-word',
  width: '100%',
  overflow: 'hidden',
}}
```

- [ ] **Step 6: 댓글 섹션 리스타일**

댓글 Paper → `elevation={0}` + border. 댓글 작성 `Box`의 `bgcolor: '#f5f7fa'` → `bgcolor: 'var(--bg-subtle)'`. 댓글 wrapper `border-bottom: '1px solid #eee'` → `'1px solid var(--border-muted)'`.

- [ ] **Step 7: 빌드 + `/blog/1` 검증**

Run: `npm run build && npm run dev`
브라우저 `/blog/1` 방문. 본문 max-width 680, 여백 적절. 다크모드 토글 → 본문·댓글이 다크로 자연스럽게 전환.

- [ ] **Step 8: 커밋**

```bash
git add src/components/BlogDetail.jsx
git commit -m "refactor(blog): BlogDetail dead dialog 제거 + max-width 680 + Prose 스타일"
```

### Task 3.8: Login 다이얼로그 리스타일

**Files:**
- Modify: `src/components/Login.jsx`

- [ ] **Step 1: Dialog Paper 토큰화**

`src/components/Login.jsx`의 Dialog PaperProps에 다음 추가:
```jsx
PaperProps={{
  sx: {
    bgcolor: 'var(--bg-canvas)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
  }
}}
```

TextField 기본 색상은 MUI theme가 이미 처리. 특별 조정 불필요.

Submit Button: `color: 'var(--on-ink)', bgcolor: 'var(--ink)'`.

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/Login.jsx
git commit -m "refactor(auth): Login 다이얼로그 토큰화"
```

### Task 3.9: CreatePost + EditPost 리스타일

**Files:**
- Modify: `src/components/CreatePost.jsx`
- Modify: `src/components/EditPost.jsx`

- [ ] **Step 1: CreatePost — native `<input>` → MUI TextField**

`src/components/CreatePost.jsx`의 제목 input 교체:
```jsx
// Before:
<input type="text" name="title" value={post.title} onChange={handleChange} style={{...}} required placeholder="제목을 입력하세요" />

// After:
<TextField
  name="title"
  value={post.title}
  onChange={handleChange}
  fullWidth
  required
  placeholder="제목을 입력하세요"
  inputProps={{ style: { fontSize: '1.2rem' } }}
/>
```

`TextField` 를 import 리스트에 추가 (이미 `@mui/material`에서 import 중).

Paper → `elevation={0}` + border.

- [ ] **Step 2: EditPost — 동일한 교체**

`src/components/EditPost.jsx`에서도 동일하게 native `<input>` → `TextField`, Paper elevation 제거.

- [ ] **Step 3: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: 커밋**

```bash
git add src/components/CreatePost.jsx src/components/EditPost.jsx
git commit -m "refactor(editor): CreatePost/EditPost 제목 input을 MUI TextField로, Paper elevation 제거"
```

### Task 3.10: About 컴포넌트 생성

**Files:**
- Create: `src/components/about/About.jsx`
- Create: `src/components/about/Bio.jsx`
- Create: `src/components/about/TechStackCompact.jsx`

- [ ] **Step 1: Bio 플레이스홀더 섹션**

Create `src/components/about/Bio.jsx`:
```jsx
import React from 'react';
import { Box, Container } from '@mui/material';

export default function Bio() {
  return (
    <Box component="section" sx={{ py: { xs: 5, md: 7 } }}>
      <Container maxWidth="md">
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
          About
        </Box>
        <Box component="h1" sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 600, letterSpacing: '-0.6px', color: 'var(--ink)', mt: 1, mb: 0 }}>
          박현경
        </Box>
        <Box sx={{ display: 'inline-block', mt: 1, px: 1.2, py: 0.4, bgcolor: 'var(--ink)', color: 'var(--on-ink)', borderRadius: 'var(--radius-xs)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px' }}>
          DEVOPS ENGINEER · CKA · AWS SAA
        </Box>
        <Box sx={{ maxWidth: 620, fontSize: 15, color: 'var(--ink-muted)', lineHeight: 1.75, mt: 3 }}>
          {/* TODO(user): 2~3 문단의 본인 소개를 여기에. 현재는 placeholder. */}
          Cloud-native 시스템을 설계·운영하며 Kubernetes Operator, Infrastructure as Code,
          그리고 관찰성(observability)을 깊이 다뤄 왔습니다. 작은 리소스 위에서도 안정적으로
          움직이는 시스템, 측정 가능한 개선, 반복 가능한 자동화에 관심이 있습니다.
        </Box>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 2: TechStackCompact 섹션 (Home에서 이전됐던 기술 스택)**

Create `src/components/about/TechStackCompact.jsx`:
```jsx
import React from 'react';
import { Box, Container } from '@mui/material';

const STACKS = [
  { category: '인프라·DevOps', items: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Nginx'] },
  { category: '백엔드', items: ['Spring Boot', 'Go', 'Node.js', 'MySQL / MariaDB', 'JWT'] },
  { category: '프론트엔드', items: ['React', 'Vite', 'MUI', 'Framer Motion'] },
  { category: '관찰성·ML', items: ['OpenSearch', 'Grafana', 'TensorFlow'] },
];

export default function TechStackCompact() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--ink-subtle)', textTransform: 'uppercase' }}>
          Tech Stack
        </Box>
        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: { xs: 0, sm: 1.5 } }}>
          {STACKS.map((s) => (
            <React.Fragment key={s.category}>
              <Box sx={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, py: 1, pr: 2 }}>{s.category}</Box>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', py: 1, borderBottom: '1px solid var(--border-muted)' }}>
                {s.items.map((i) => (
                  <Box key={i} sx={{ fontSize: 12, px: 1, py: 0.3, bgcolor: 'var(--bg-subtle)', color: 'var(--ink-muted)', borderRadius: 'var(--radius-xs)' }}>
                    {i}
                  </Box>
                ))}
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
```

- [ ] **Step 3: About 메인 컴포넌트 (Bio + Links + Certs + Awards + TechStack + Infra)**

Create `src/components/about/About.jsx`:
```jsx
import React from 'react';
import { Box, Container, Link, Stack, Grid, Card, CardMedia, CardContent, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SchoolIcon from '@mui/icons-material/School';
import ZoomableImageModal from '@/components/section/ZoomableImageModal';
import Bio from './Bio';
import TechStackCompact from './TechStackCompact';

const SectionTitle = ({ icon: Icon, children }) => (
  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 2.5 }}>
    <Icon sx={{ fontSize: 20, color: 'var(--ink-muted)' }} />
    <Box sx={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{children}</Box>
  </Stack>
);

function LinksSection() {
  const linkSx = { display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'var(--ink)', fontSize: 14 };
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={EmailIcon}>Links</SectionTitle>
        <Stack spacing={1.2}>
          <Link href="https://github.com/hkpark130" target="_blank" rel="noopener noreferrer" sx={linkSx}>
            <GitHubIcon fontSize="small" /> github.com/hkpark130
          </Link>
          <Link href="https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/" target="_blank" rel="noopener noreferrer" sx={linkSx}>
            <LinkedInIcon fontSize="small" /> LinkedIn
          </Link>
          <Link href="mailto:hkpark130@naver.com" sx={linkSx}>
            <EmailIcon fontSize="small" /> hkpark130@naver.com
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}

function CertsSection() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={EmojiEventsIcon}>Certifications</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none', bgcolor: 'var(--bg-canvas)' }} elevation={0}>
              <CardMedia component="img" image="/images/cka.png" alt="CKA" sx={{ height: 180, objectFit: 'contain', bgcolor: '#1a73e8', p: 0 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>Certified Kubernetes Administrator</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>CNCF</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none', bgcolor: 'var(--bg-canvas)' }} elevation={0}>
              <CardMedia component="img" image="/images/aws.png" alt="AWS SAA" sx={{ height: 180, objectFit: 'contain', bgcolor: 'var(--bg-subtle)', p: 0 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>AWS Certified Solutions Architect — Associate</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>Amazon Web Services</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function AwardsSection() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={SchoolIcon}>Awards</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none' }} elevation={0}>
              <CardMedia component="img" image="/images/award1.png" alt="JAVA 프로그래밍 경진대회" sx={{ height: 200 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>JAVA 프로그래밍 경진대회</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>한빛미디어 (은상) · 2016</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card sx={{ border: '1px solid var(--border)', boxShadow: 'none' }} elevation={0}>
              <CardMedia component="img" image="/images/award2.png" alt="신규 사업 아이디어 콘테스트" sx={{ height: 200 }} />
              <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)' }}>신규 사업 아이디어 콘테스트</Typography>
                <Typography variant="caption" sx={{ color: 'var(--ink-subtle)' }}>KWC (장려상) · 2018</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function InfraSection() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <SectionTitle icon={EmojiEventsIcon}>Infra & Deployment</SectionTitle>
        <Box sx={{ fontSize: 14, color: 'var(--ink-muted)', lineHeight: 1.7, mb: 3 }}>
          이 사이트의 프론트엔드(React) · 백엔드(Spring Boot) · SSR(Node.js) 세 서비스가 Docker로 분리되어
          Nginx 뒤에서 실행됩니다. GitHub push → AWS CodePipeline → CodeDeploy → EC2 의 CI/CD 파이프라인으로 배포.
        </Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)', mb: 1 }}>CI/CD 파이프라인</Typography>
          <ZoomableImageModal imageSrc="/images/cicd.png" altText="CI/CD pipeline" caption="🔼 클릭 후 스크롤로 확대/축소" />
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--ink)', mb: 1 }}>시스템 아키텍처</Typography>
          <ZoomableImageModal imageSrc="/images/spring-blog.png" altText="System architecture" caption="🔼 클릭 후 스크롤로 확대/축소" />
        </Box>
      </Container>
    </Box>
  );
}

export default function About() {
  return (
    <>
      <Bio />
      <LinksSection />
      <TechStackCompact />
      <CertsSection />
      <AwardsSection />
      <InfraSection />
    </>
  );
}
```

- [ ] **Step 4: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 5: 커밋**

```bash
git add src/components/about/
git commit -m "feat(about): About 페이지 컴포넌트 (Bio · Links · TechStack · Certs · Awards · Infra)"
```

### Task 3.11: /about 라우트를 새 About 으로 교체

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Profile → About 교체**

`src/App.jsx`에서:
- `import Profile from './components/Profile';` → `import About from './components/about/About';`
- `<Route path="/about" element={<Profile />} />` → `<Route path="/about" element={<About />} />`

- [ ] **Step 2: `/about` 방문 검증**

브라우저 `/about` → 새 About 페이지 표시. 이전 `/profile` 방문 시 `/about`로 redirect. 각 섹션 표시 · Certs 이미지 · Awards 이미지 · Infra 이미지 zoom 동작.

- [ ] **Step 3: 커밋**

```bash
git add src/App.jsx
git commit -m "feat(about): /about 라우트 새 About 컴포넌트로 교체"
```

### Task 3.12: Profile.jsx 삭제

**Files:**
- Delete: `src/components/Profile.jsx`

- [ ] **Step 1: Profile 참조 검색**

```bash
grep -rn "from.*Profile" src/
```

Expected: 0건.

- [ ] **Step 2: 삭제**

```bash
rm src/components/Profile.jsx
```

- [ ] **Step 3: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: 커밋**

```bash
git add -u src/components/Profile.jsx
git commit -m "chore(about): 기존 Profile.jsx 삭제 (About.jsx로 대체)"
```

### Task 3.13: MarkdownRenderer 유틸 함수 단위 테스트

**Files:**
- Create: `src/components/markdown/MarkdownRenderer.test.jsx`

- [ ] **Step 1: `extractCustomComponents` · `sanitizeUnknownTags` · `parseAttributes` 테스트**

Create `src/components/markdown/MarkdownRenderer.test.jsx`:
```jsx
/**
 * @file MarkdownRenderer의 내부 유틸 로직 검증.
 * 함수가 export되지 않아 간접 테스트 — 컴포넌트 렌더링 결과로 확인.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MarkdownRenderer from './MarkdownRenderer';

const setup = (content) => render(
  <MemoryRouter>
    <MarkdownRenderer content={content} />
  </MemoryRouter>
);

describe('MarkdownRenderer custom tags', () => {
  it('renders plain markdown heading', () => {
    const { container } = setup('# Hello');
    expect(container.querySelector('h1')?.textContent).toContain('Hello');
  });

  it('extracts and renders CodeAccordion', () => {
    const md = `<CodeAccordion title="테스트" language="javascript">\nconst x = 1;\n</CodeAccordion>`;
    const { container } = setup(md);
    expect(container.textContent).toContain('테스트');
  });

  it('extracts and renders AlertBlock', () => {
    const { container } = setup(`<AlertBlock severity="warning">주의</AlertBlock>`);
    expect(container.textContent).toContain('주의');
  });

  it('escapes unknown HTML tags', () => {
    const { container } = setup(`<foobar>bad</foobar>`);
    expect(container.innerHTML).not.toContain('<foobar>');
  });
});
```

- [ ] **Step 2: 테스트 실행**

Run: `npm run test:run -- MarkdownRenderer`
Expected: 4 passed. (만약 실패 시 `MemoryRouter`가 필요한지 확인하고 수정.)

- [ ] **Step 3: 커밋**

```bash
git add src/components/markdown/MarkdownRenderer.test.jsx
git commit -m "test(markdown): MarkdownRenderer 커스텀 태그 렌더 회귀 테스트"
```

### Task 3.14: Phase 3 종료 검증

**Files:** 없음

- [ ] **Step 1: 전체 테스트 통과**

Run: `npm run test:run`
Expected: ThemeProvider 3 + categoryColors 3 + projects 5 + MarkdownRenderer 4 = 15 passed.

- [ ] **Step 2: 빌드 · lint 성공**

Run: `npm run build && npm run lint`
Expected: 성공, lint 에러 0.

- [ ] **Step 3: 수동 QA 체크리스트**

- `/blog` B1-compact feed, 카테고리 chip, 검색, 페이지네이션
- `/blog/1` 본문 max-width, Prose 스타일, 다크모드 전환
- `/about` 모든 섹션 (Bio · Links · TechStack · Certs · Awards · Infra)
- `/blog/create` 로그인 후 접근 · MUI TextField 제목 · MarkdownEditor 동작
- `/blog/edit/<id>` 동일
- `<CodeAccordion>` 태그가 있는 기존 블로그 글 1편 방문 → 라이트·다크 양쪽에서 코드 하이라이팅 색상이 달라지는지 확인

- [ ] **Step 4: Phase 3 완료 태그**

```bash
git tag phase-3-done
```

---

## Phase 4: 프로젝트 detail 리스타일 + ChatWidget + ⌘K + Cleanup

Phase 4 종료 시 **리디자인 완성**. 10개 프로젝트 detail 페이지가 새 테마로 통일, ChatWidget 단색, ⌘K 동작, 미사용 패키지 19개 제거, Spring `NotionService` 삭제.

### Task 4.1: TitleSection 리스타일 (보라 그라디언트 제거)

**Files:**
- Modify: `src/components/section/TitleSection.jsx`

- [ ] **Step 1: 컴포넌트 전면 재작성**

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

export default function TitleSection({ title, subtitle, description, sx }) {
  return (
    <Box sx={{ py: { xs: 3, md: 4 }, ...sx }}>
      <Box
        sx={{
          fontSize: 11,
          letterSpacing: '1.6px',
          fontWeight: 700,
          color: 'var(--accent)',
          textTransform: 'uppercase',
        }}
      >
        {subtitle || 'Project'}
      </Box>
      <Box
        component="h1"
        sx={{
          fontSize: { xs: 26, md: 32 },
          fontWeight: 600,
          letterSpacing: '-0.6px',
          color: 'var(--ink)',
          lineHeight: 1.15,
          mt: 1,
          mb: 0,
        }}
      >
        {title}
      </Box>
      {description && (
        <Box sx={{ fontSize: 14, color: 'var(--ink-muted)', mt: 1.5, lineHeight: 1.65, maxWidth: 620 }}>
          {description}
        </Box>
      )}
    </Box>
  );
}

TitleSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  sx: PropTypes.object,
};
```

**변경점:** 보라 그라디언트 배경 제거 → `subtitle`을 kicker로, `title`을 h1으로. 중앙정렬 제거 (좌측 정렬).

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/section/TitleSection.jsx
git commit -m "refactor(ui): TitleSection 보라 그라디언트 제거, kicker+h1 구조로"
```

### Task 4.2: TechStack 리스타일

**Files:**
- Modify: `src/components/section/TechStack.jsx`

- [ ] **Step 1: 박스 그림자·파랑 상단 바 제거, 평평한 구조로**

`src/components/section/TechStack.jsx` 전면 재작성:
```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Stack } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

export default function TechStack({ techStacks }) {
  return (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <CodeIcon sx={{ fontSize: 18, color: 'var(--ink-muted)' }} />
        <Box sx={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Tech Stack</Box>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
          gap: { xs: 0, sm: 2 },
        }}
      >
        {techStacks.map((tech, index) => (
          <React.Fragment key={index}>
            <Box sx={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', py: 1.2 }}>
              {tech.category}
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 0.8,
                flexWrap: 'wrap',
                py: 1.2,
                borderBottom: index < techStacks.length - 1 ? '1px solid var(--border-muted)' : 'none',
              }}
            >
              {tech.labels.map((item, i) => (
                <Chip
                  key={i}
                  label={item.label}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    bgcolor: 'var(--bg-canvas)',
                    color: 'var(--ink-muted)',
                    borderColor: 'var(--border)',
                    '&:hover': { borderColor: 'var(--ink)', color: 'var(--ink)' },
                  }}
                />
              ))}
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

TechStack.propTypes = {
  techStacks: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, color: PropTypes.string })).isRequired,
    })
  ).isRequired,
};
```

**변경:** 박스 그림자·파랑 상단 bar·그라디언트 제거. color prop은 무시 (단색 chip 사용).

- [ ] **Step 2: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/components/section/TechStack.jsx
git commit -m "refactor(ui): TechStack 박스 그림자 제거, 평평한 grid 구조로"
```

### Task 4.3: ZoomableImageModal + Reference 토큰화

**Files:**
- Modify: `src/components/section/ZoomableImageModal.jsx`
- Modify: `src/components/section/Reference.jsx`

- [ ] **Step 1: ZoomableImageModal 기본 테두리 토큰화**

`ZoomableImageModal.jsx`에서:
- Container `border: '2px solid #ddd'` → `border: '1px solid var(--border)'`
- 배경 `bgcolor` 지정된 곳은 `bgcolor: 'var(--bg-subtle)'` 로
- 모달 오버레이는 이미 `rgba(0, 0, 0, 0.7)` 잘 되어있으면 유지

- [ ] **Step 2: Reference 컴포넌트 토큰화**

`Reference.jsx`에서 링크 색상 `color: 'var(--accent)'`, 배경 Paper 제거, 단순 링크 리스트로. (구체 내용은 현재 파일 확인 후 판단.)

- [ ] **Step 3: 빌드 + 커밋**

Run: `npm run build`
Expected: 성공.

```bash
git add src/components/section/ZoomableImageModal.jsx src/components/section/Reference.jsx
git commit -m "refactor(ui): ZoomableImageModal · Reference 토큰화"
```

### Task 4.4: 프로젝트 detail 페이지 래핑 교체 (10개 일괄)

각 detail 페이지가 공통으로 가진 `Container > Paper (elevation=3, bgcolor='#f9f9ff', borderRadius=3)` 패턴을 `Container > Box` 로 전환. Paper 는 제거.

**Files (10개):**
- Modify: `src/components/SpringBoot.jsx`
- Modify: `src/components/KredisOperator.jsx`
- Modify: `src/components/Golang.jsx`
- Modify: `src/components/Opensearch.jsx`
- Modify: `src/components/Python.jsx`
- Modify: `src/components/Terraform.jsx`
- Modify: `src/components/Chrome.jsx`
- Modify: `src/components/ChatBot.jsx`
- Modify: `src/components/Redmine.jsx`
- (Kredis sections는 `src/components/kredis/KredisSections.jsx` — 페이지 래퍼와 별개, 내부 섹션은 그대로)

- [ ] **Step 1: 한 페이지씩 공통 패턴 적용**

각 파일에서 다음 교체:
```jsx
// Before:
<Container maxWidth="lg" sx={{...}}>
  <Paper elevation={3} sx={{ borderRadius: 3, p: {...}, mb: {...}, bgcolor: '#f9f9ff' }}>
    <motion.div ...>
      ...
    </motion.div>
  </Paper>
</Container>

// After:
<Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
  <motion.article
    initial="hidden"
    animate="visible"
    variants={sectionVariant}
    style={{ maxWidth: 1040, margin: '0 auto' }}
  >
    ...
  </motion.article>
</Container>
```

`motion.div` → `motion.article`. Paper 완전히 삭제. bgcolor `#f9f9ff` 제거.

- [ ] **Step 2: 각 페이지 수정 체크리스트**

각 페이지 수정 후 브라우저에서 라이트·다크 양쪽 방문해 렌더 깨지지 않는지 확인:

- [ ] `/springboot` — SpringBoot.jsx
- [ ] `/kredis` — KredisOperator.jsx (긴 14섹션, 특히 꼼꼼히)
- [ ] `/golang` — Golang.jsx
- [ ] `/opensearch` — Opensearch.jsx
- [ ] `/python` — Python.jsx
- [ ] `/terraform` — Terraform.jsx
- [ ] `/chrome` — Chrome.jsx
- [ ] `/chatbot` — ChatBot.jsx
- [ ] `/redmine` — Redmine.jsx

- [ ] **Step 3: 빌드 성공 확인**

Run: `npm run build`
Expected: 성공.

- [ ] **Step 4: 커밋 (페이지 그룹별로 나눠 commit 권장)**

예를 들어 3번에 나눠:
```bash
git add src/components/SpringBoot.jsx src/components/KredisOperator.jsx src/components/Golang.jsx
git commit -m "refactor(detail): Spring/Kredis/Golang 페이지 Paper 제거"

git add src/components/Opensearch.jsx src/components/Python.jsx src/components/Terraform.jsx
git commit -m "refactor(detail): Opensearch/Python/Terraform 페이지 Paper 제거"

git add src/components/Chrome.jsx src/components/ChatBot.jsx src/components/Redmine.jsx
git commit -m "refactor(detail): Chrome/ChatBot/Redmine 페이지 Paper 제거"
```

### Task 4.5: ChatWidget 보라 그라디언트 제거

**Files:**
- Modify: `src/components/ChatWidget.jsx`

- [ ] **Step 1: FAB 배경을 단색 ink로**

`ChatWidget.jsx`에서 `background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important'` 블록 전부 찾아서 `bgcolor: 'var(--ink)'` + `color: 'var(--on-ink)'` 로.

- FAB hover: `bgcolor: 'var(--ink)', opacity: 0.9`
- Panel 헤더 배경: `bgcolor: 'var(--bg-subtle)', color: 'var(--ink)', borderBottom: '1px solid var(--border)'`
- 유저 메시지 버블: `bgcolor: 'var(--ink)', color: 'var(--on-ink)'`
- 봇 메시지 버블: `bgcolor: 'var(--bg-subtle)', color: 'var(--ink)'`
- 봇 아바타 원: `bgcolor: 'var(--ink)'` 단색
- Send 버튼: `bgcolor: 'var(--ink)', color: 'var(--on-ink)'`
- Paper `elevation={8}` → `elevation={0}` + `sx={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow-popover)' }}`

- [ ] **Step 2: 링크 색상 토큰화**

`renderMessageWithLinks` 함수 내 Link `color: '#667eea'` → `color: 'var(--accent)'`.
hover `color: '#764ba2'` → `color: 'var(--ink)'`.

- [ ] **Step 3: 빌드 + dev 확인**

Run: `npm run build && npm run dev`
우하단 FAB가 단색 검정(라이트) / 단색 흰색(다크). 클릭 → Panel 열림. 헤더·메시지·입력창 모두 G-B 톤.

- [ ] **Step 4: 커밋**

```bash
git add src/components/ChatWidget.jsx
git commit -m "refactor(chat): ChatWidget 보라 그라디언트 제거, 단색 ink 테마로"
```

### Task 4.6: cmdk 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: cmdk 설치**

```bash
npm install cmdk
```

- [ ] **Step 2: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): cmdk 설치 (⌘K 커맨드 팔레트)"
```

### Task 4.7: CommandPalette 컴포넌트 생성

**Files:**
- Create: `src/components/layout/CommandPalette.jsx`
- Create: `src/components/layout/CommandPalette.test.jsx`

- [ ] **Step 1: 테스트 작성 (검색 필터 로직)**

Create `src/components/layout/CommandPalette.test.jsx`:
```jsx
import { describe, it, expect } from 'vitest';
import { filterItems } from './CommandPalette';

const items = [
  { label: 'Home', group: 'Navigate' },
  { label: 'Projects', group: 'Navigate' },
  { label: 'Kredis', group: 'Projects' },
  { label: 'Spring Blog', group: 'Projects' },
];

describe('CommandPalette filterItems', () => {
  it('returns all when query empty', () => {
    expect(filterItems(items, '')).toEqual(items);
  });

  it('filters case-insensitive substring match', () => {
    const result = filterItems(items, 'spring');
    expect(result.map((x) => x.label)).toEqual(['Spring Blog']);
  });

  it('returns empty when no match', () => {
    expect(filterItems(items, 'xyz')).toEqual([]);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test:run -- CommandPalette`
Expected: FAIL — cannot resolve module.

- [ ] **Step 3: CommandPalette 구현**

Create `src/components/layout/CommandPalette.jsx`:
```jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Box, Modal } from '@mui/material';
import { PROJECTS } from '@/data/projects';
import { fetchPosts } from '@/api/api';
import { isAuthenticated, logout } from '@/api/auth';

export function filterItems(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((i) => i.label.toLowerCase().includes(q));
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const authed = isAuthenticated();

  useEffect(() => {
    if (!open || posts.length > 0) return;
    const cached = sessionStorage.getItem('cmdk.posts');
    if (cached) {
      try {
        setPosts(JSON.parse(cached));
        return;
      } catch { /* fallthrough */ }
    }
    fetchPosts(0, 200)
      .then(({ data }) => {
        const titles = (data.posts || []).map((p) => ({ id: p.id, title: p.title }));
        setPosts(titles);
        sessionStorage.setItem('cmdk.posts', JSON.stringify(titles));
      })
      .catch(() => setPosts([]));
  }, [open, posts.length]);

  const go = (path) => { onClose(); navigate(path); };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="command-palette">
      <Box
        sx={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '92%', sm: 560 },
          bgcolor: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-popover)',
          overflow: 'hidden',
        }}
      >
        <Command label="명령 팔레트" style={{ width: '100%' }}>
          <Command.Input
            placeholder="검색 · 이동..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              padding: '14px 16px',
              background: 'transparent',
              color: 'var(--ink)',
              fontFamily: 'var(--font-sans)',
              borderBottom: '1px solid var(--border)',
            }}
          />
          <Command.List style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
            <Command.Empty style={{ padding: '18px 12px', fontSize: 13, color: 'var(--ink-subtle)' }}>
              결과 없음
            </Command.Empty>

            <Command.Group heading="Navigate">
              <PaletteItem onSelect={() => go('/')}>Home</PaletteItem>
              <PaletteItem onSelect={() => go('/projects')}>Projects</PaletteItem>
              <PaletteItem onSelect={() => go('/blog')}>Writing (Blog)</PaletteItem>
              <PaletteItem onSelect={() => go('/about')}>About</PaletteItem>
            </Command.Group>

            <Command.Group heading="Projects">
              {PROJECTS.map((p) => (
                <PaletteItem key={p.slug} onSelect={() => go(p.path)}>
                  {p.name} <span style={{ color: 'var(--ink-subtle)', fontSize: 11, marginLeft: 6 }}>{p.kicker}</span>
                </PaletteItem>
              ))}
            </Command.Group>

            {posts.length > 0 && (
              <Command.Group heading="Blog posts">
                {posts.slice(0, 50).map((p) => (
                  <PaletteItem key={p.id} onSelect={() => go(`/blog/${p.id}`)}>
                    #{p.id} · {p.title}
                  </PaletteItem>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Actions">
              {authed ? (
                <>
                  <PaletteItem onSelect={() => go('/blog/create')}>새 게시글 작성</PaletteItem>
                  <PaletteItem onSelect={async () => { await logout(); onClose(); window.location.reload(); }}>
                    로그아웃
                  </PaletteItem>
                </>
              ) : (
                <PaletteItem onSelect={() => { onClose(); /* Login dialog trigger는 TopNav나 페이지 레벨에서 핸들 */ }}>
                  로그인 (화면 상단 아바타 클릭)
                </PaletteItem>
              )}
              <PaletteItem onSelect={() => { window.open('https://github.com/hkpark130', '_blank'); onClose(); }}>
                GitHub ↗
              </PaletteItem>
              <PaletteItem onSelect={() => { window.open('https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/', '_blank'); onClose(); }}>
                LinkedIn ↗
              </PaletteItem>
            </Command.Group>
          </Command.List>
        </Command>
      </Box>
    </Modal>
  );
}

function PaletteItem({ children, onSelect }) {
  return (
    <Command.Item
      onSelect={onSelect}
      style={{
        padding: '8px 12px',
        fontSize: 13,
        color: 'var(--ink)',
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {children}
    </Command.Item>
  );
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `npm run test:run -- CommandPalette`
Expected: 3 passed.

- [ ] **Step 5: 커밋**

```bash
git add src/components/layout/CommandPalette.jsx src/components/layout/CommandPalette.test.jsx
git commit -m "feat(cmdk): CommandPalette 컴포넌트 (cmdk 기반)"
```

### Task 4.8: Layout에 CommandPalette 연결 + ⌘K 단축키

**Files:**
- Modify: `src/Layout.jsx`

- [ ] **Step 1: 키보드 리스너 + open 상태**

`src/Layout.jsx`를 다음으로 수정:
```jsx
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TopNav from './components/layout/TopNav';
import Footer from './components/layout/Footer';
import MobileNavDrawer from './components/layout/MobileNavDrawer';
import CommandPalette from './components/layout/CommandPalette';
import ChatWidget from './components/ChatWidget';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const isK = e.key === 'k' || e.key === 'K';
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav onMenuClick={() => setMobileOpen(true)} onCmdKClick={() => setPaletteOpen(true)} />
      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ChatWidget />
    </Box>
  );
}
```

- [ ] **Step 2: TopNav `⌘ K` 인디케이터 클릭 가능하게**

`src/components/layout/TopNav.jsx`에서 kbd 인디케이터 Box를 clickable로:
```jsx
// Before:
<Box sx={{ ... }}>⌘ K</Box>

// After (onClick + hover):
<Box
  onClick={onCmdKClick}
  sx={{
    ...기존 sx,
    cursor: 'pointer',
    '&:hover': { borderColor: 'var(--ink)', color: 'var(--ink)' },
  }}
>⌘ K</Box>
```

`TopNav` 함수 props에 `onCmdKClick` 추가.

- [ ] **Step 3: `npm run dev` → `⌘K` 또는 `Ctrl+K` 테스트**

브라우저에서 단축키 누르면 Command Palette 모달 중앙 표시. 검색으로 필터링 가능. 항목 선택 시 네비게이트.

- [ ] **Step 4: 커밋**

```bash
git add src/Layout.jsx src/components/layout/TopNav.jsx
git commit -m "feat(cmdk): Layout에 CommandPalette 연결 + ⌘K 단축키"
```

### Task 4.9: Legacy `<Alert>` → `<AlertBlock>` DB Migration

**Files:**
- Create: `Spring-Blog/docs/migrations/2026-04-23-alert-to-alertblock.sql`

- [ ] **Step 1: Migration SQL 작성**

Create `../Spring-Blog/docs/migrations/2026-04-23-alert-to-alertblock.sql`:
```sql
-- 2026-04-23: 기존 블로그 글의 <Alert ...>를 <AlertBlock ...>으로 일괄 치환.
-- MarkdownRenderer에서 <Alert> 지원이 제거됨에 따라 실제 콘텐츠를 마이그레이션.
-- 실행 전에 backup 필수.

START TRANSACTION;

UPDATE posts
SET content = REPLACE(content, '<Alert', '<AlertBlock')
WHERE content LIKE '%<Alert%';

UPDATE posts
SET content = REPLACE(content, '</Alert>', '</AlertBlock>')
WHERE content LIKE '%</Alert>%';

-- 실행 후 검증:
SELECT COUNT(*) AS with_alertblock FROM posts WHERE content LIKE '%<AlertBlock%';
SELECT COUNT(*) AS with_legacy_alert FROM posts WHERE content LIKE '%<Alert %' OR content LIKE '%<Alert>%';
-- with_legacy_alert는 0이어야 함.

-- 문제 없으면 COMMIT, 이상하면 ROLLBACK.
COMMIT;
```

- [ ] **Step 2: 사용자에게 DB 접근 가능 시점에 실행 요청 (매뉴얼 단계)**

실제 실행은 사용자가 적절한 시점에 prod DB에 접속해 수행. 로컬 H2 (개발) 에서 먼저 테스트 권장.

- [ ] **Step 3: 커밋**

```bash
cd ../Spring-Blog
git add docs/migrations/2026-04-23-alert-to-alertblock.sql
git commit -m "chore(migration): legacy <Alert> → <AlertBlock> 치환 SQL"
cd ../React-Intro
```

### Task 4.10: 15편 회귀 Fixture 수동 QA

**Files:** 없음 (수동 QA)

사용 빈도 높은 3개 커스텀 컴포넌트를 쓰는 글 각각 5편씩 15편 고정 케이스 지정.

- [ ] **Step 1: Fixture 글 ID 수집**

DB 쿼리로 각 컴포넌트를 가장 많이 쓰는 글 5개씩 추출:
```sql
SELECT id, title FROM posts WHERE content LIKE '%<CodeAccordion%' ORDER BY id DESC LIMIT 5;
SELECT id, title FROM posts WHERE content LIKE '%<ZoomableImageModal%' ORDER BY id DESC LIMIT 5;
SELECT id, title FROM posts WHERE content LIKE '%<Bookmark%' ORDER BY id DESC LIMIT 5;
```

결과를 `docs/superpowers/plans/regression-fixtures-2026-04-23.md` 에 저장.

- [ ] **Step 2: 각 글 방문해 before/after 수동 확인**

각 글 `/blog/<id>` 방문:
- 라이트 모드에서 커스텀 컴포넌트 렌더 OK
- 다크 모드에서도 OK (특히 CodeAccordion Prism 테마 다크 전환)
- 인터랙션 정상 (Accordion 펼치기/접기, Image zoom, Bookmark 호버)

문제 발견 시 해당 컴포넌트 수정 → 재확인.

- [ ] **Step 3: 결과 기록 + 커밋**

```bash
git add docs/superpowers/plans/regression-fixtures-2026-04-23.md
git commit -m "chore(qa): 15편 회귀 fixture 수동 확인 완료"
```

### Task 4.11: 미사용 npm 패키지 일괄 제거

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 현재 빌드·테스트 상태 기록 (before snapshot)**

```bash
npm run build
ls -lh dist/assets/*.js
```
번들 사이즈 기록.

- [ ] **Step 2: 패키지 제거 명령**

```bash
npm uninstall \
  marked marked-extended-tables @fsegurai/marked-extended-tables \
  markdown-it markdown-it-container \
  react-notion-x notion-client notion-to-md \
  @notion-render/bookmark-plugin @notion-render/client @notion-render/hljs-plugin @notionhq/client \
  katex \
  remark-contributors remark-directive remark-extended-table remark-git-contributors remark-grid-tables
```

**주의:** `prismjs`는 일단 **제외** — `react-syntax-highlighter`가 간접 의존 가능성. 다음 단계에서 확인.

- [ ] **Step 3: 빌드 + 테스트 재실행**

```bash
npm run build
npm run test:run
```

빌드 성공 + 전 테스트 pass 확인.

- [ ] **Step 4: 수동 QA — CodeAccordion 렌더 확인**

`npm run dev` → `/blog/<CodeAccordion을 쓰는 글>` 방문. 코드 하이라이팅 제대로 나오는지. 라이트·다크 양쪽.

- [ ] **Step 5: `prismjs` 제거 시도 (optional)**

`prismjs`도 제거 시도:
```bash
npm uninstall prismjs
npm run build
```

빌드 성공하고 `CodeAccordion` 정상이면 커밋. 실패하면:
```bash
npm install prismjs
```
원복. `prismjs`는 direct dependency로 유지.

- [ ] **Step 6: 번들 사이즈 after snapshot**

```bash
ls -lh dist/assets/*.js
```
before와 비교. 감소량 기록.

- [ ] **Step 7: 커밋**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): 미사용 npm 패키지 19개 제거 (번들 다이어트)"
```

### Task 4.12: Spring-Blog `NotionService.java` 삭제

**Files:**
- Delete: `Spring-Blog/src/main/java/kr/p_e/hkpark130/springblog/service/NotionService.java`

- [ ] **Step 1: 참조 검색**

```bash
cd ../Spring-Blog
grep -rn "NotionService" src/
```

Expected: 0건 또는 자체 import만 있음.

- [ ] **Step 2: 파일 삭제**

```bash
rm src/main/java/kr/p_e/hkpark130/springblog/service/NotionService.java
```

- [ ] **Step 3: Gradle 빌드 확인**

```bash
./gradlew build
```

Expected: 성공. 컴파일러 에러가 나면 참조 남은 곳 있음 — 제거.

- [ ] **Step 4: 커밋**

```bash
git add -u src/main/java/kr/p_e/hkpark130/springblog/service/NotionService.java
git commit -m "chore: dead NotionService 삭제 (실제 Notion 변환은 ssr-notion SSR이 담당)"
cd ../React-Intro
```

### Task 4.13: Final QA — 라이트/다크 모든 페이지

**Files:** 없음 (수동 QA)

- [ ] **Step 1: `npm run build && npm run preview` 프로덕션 빌드 확인**

- [ ] **Step 2: 다음 페이지를 라이트·다크·모바일(375px)에서 방문**

- [ ] `/` Home
- [ ] `/projects`
- [ ] `/springboot`, `/kredis`, `/golang`, `/opensearch`, `/python`, `/terraform`, `/chrome`, `/chatbot`, `/redmine`
- [ ] `/about`
- [ ] `/profile` → `/about` redirect 확인
- [ ] `/blog`
- [ ] `/blog/1`, `/blog/109` (임의 3편)
- [ ] `⌘K` 팔레트 열림·검색·이동
- [ ] ChatWidget FAB 열림·메시지 테스트
- [ ] 다크 모드 토글 → localStorage persistence → 새로고침 후 유지
- [ ] 모바일 햄버거 → 메뉴 → 각 링크 → Drawer 닫힘

- [ ] **Step 3: Lighthouse (선택)**

DevTools → Lighthouse → Desktop/Mobile 양쪽 측정. Before와 비교. Performance·Accessibility·SEO·Best Practices 점수 기록.

- [ ] **Step 4: 전체 테스트 통과**

```bash
npm run test:run
npm run lint
```

Expected: 전부 green.

### Task 4.14: 브레인스토밍 세션 파일 정리

**Files:**
- Delete: `.superpowers/brainstorm/*/` (세션 종료)

- [ ] **Step 1: Visual companion 서버 종료 (이미 자동 종료 가능성 높음)**

`.superpowers/brainstorm/` 디렉토리의 세션들은 `.gitignore` 덕에 repo에 들어가지 않음. 로컬 정리는 선택:

```bash
rm -rf .superpowers/brainstorm/
```

### Task 4.15: 최종 커밋 + Phase 4 태그

**Files:** 없음

- [ ] **Step 1: Phase 4 완료 태그**

```bash
git tag phase-4-done
git tag redesign-v1.0
```

- [ ] **Step 2: PR / 머지 결정**

단일 브랜치 작업이면 main에 merge. feature 브랜치면 PR 오픈.

---

## Self-review notes

스펙 §2 Goals/Non-goals 와 대조:
- Goal 1 "제품 인상": Phase 4의 모든 페이지 리스타일로 커버.
- Goal 2 "프로젝트 그리드": Phase 2 T2.4-T2.5.
- Goal 3 "라이트/다크": Phase 1 T1.3-T1.5 + 각 Phase 검증 단계.
- Goal 4 "블로그 분리": Phase 3 T3.6 (Blog.jsx).
- Goal 5 "번들 다이어트": Phase 4 T4.11.

스펙 §6 페이지별 설계와 대조:
- Home (H1 Lean Landing): Phase 2 T2.6-T2.9. ✓
- /projects 그리드: Phase 2 T2.3-T2.5. ✓
- 프로젝트 detail 10개: Phase 4 T4.1-T4.4. ✓
- /blog B1-compact: Phase 3 T3.6. ✓
- /blog/:id: Phase 3 T3.7. ✓
- /about: Phase 3 T3.10-T3.11. ✓
- Login/Create/Edit: Phase 3 T3.8-T3.9. ✓
- ChatWidget: Phase 4 T4.5. ✓
- ⌘K: Phase 4 T4.6-T4.8. ✓
- Footer: Phase 1 T1.7. ✓

스펙 §7.2 패키지 삭제 19개 → Phase 4 T4.11에 명시. ✓
스펙 §7 MarkdownRenderer 변경사항 → Phase 3 T3.1-T3.5. ✓
스펙 §5.6 /profile → /about: Phase 1 T1.10 (redirect) + Phase 3 T3.11 (컴포넌트 교체). ✓
스펙 §11 회귀 fixture 15편 → Phase 4 T4.10. ✓

**Gaps 확인 결과: 커버됨.** 스펙의 §10 Open Questions는 실행 중 사용자 확정 포인트 (About bio 문단, Featured 3 확정 등) 이므로 각 Task에서 placeholder 또는 default로 진행 후 사용자가 수시 수정.

---



