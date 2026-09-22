import { lazy, Suspense, useEffect, useLayoutEffect } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import ScopedCssBaseline from '@mui/material/ScopedCssBaseline';
import ProtectedRoute from '../components/ProtectedRoute';
import { restoreSession } from '../api/auth';
import { blogTheme } from './blogTheme';
import '../components/blog.css';
import './blog-scope.css';

const Blog = lazy(() => import('../components/Blog'));
const BlogDetail = lazy(() => import('../components/BlogDetail'));
const CreatePost = lazy(() => import('../components/CreatePost'));
const EditPost = lazy(() => import('../components/EditPost'));

function BlogRouteTransition() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    const results = pathname === '/blog' && search
      ? document.getElementById('blog-results-title')
      : null;
    if (results) results.scrollIntoView({ block: 'start', behavior: 'instant' });
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    if (pathname === '/blog/create') document.title = '글 작성 | 박현경';
    else if (pathname.startsWith('/blog/edit/')) document.title = '글 수정 | 박현경';
    else document.title = '기술 기록 | 박현경';
  }, [pathname, search]);

  return null;
}

export default function BlogApplication() {
  useLayoutEffect(() => {
    const elements = [document.documentElement, document.body];
    const added = elements.filter(element => !element.classList.contains('blog-document'));
    const previousTitle = document.title;
    added.forEach(element => element.classList.add('blog-document'));

    return () => {
      added.forEach(element => element.classList.remove('blog-document'));
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <ThemeProvider theme={blogTheme}>
      <ScopedCssBaseline className="blog-application">
        <main id="blog-main-content" className="blog-app-main" tabIndex={-1}>
          <Suspense fallback={<div className="blog-app-container blog-app-loading" role="status">글을 불러오고 있습니다.</div>}>
            <BlogRouteTransition />
            <Routes>
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
              <Route path="/blog/edit/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="*" element={
                <div className="blog-detail-state">
                  <h1>페이지를 찾을 수 없습니다.</h1>
                  <Link to="/blog">기술 기록으로 돌아가기</Link>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>
        <footer className="blog-app-footer">
          <div className="blog-app-container">
            <p>박현경 · 기술 기록</p>
            <nav aria-label="블로그 하단 메뉴">
              <Link to="/">포트폴리오</Link>
            </nav>
          </div>
        </footer>
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}
