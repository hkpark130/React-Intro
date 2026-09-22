import { lazy, Suspense, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PortfolioLayout from './layout/PortfolioLayout';
import { projectNavigation } from './layout/projectNavigation';

const BlogApplication = lazy(() => import('./blog/BlogApplication'));
const PortfolioRoutes = lazy(() => import('./layout/PortfolioRoutes'));

export default function App() {
  const { pathname } = useLocation();
  const isBlog = pathname === '/blog' || pathname.startsWith('/blog/');

  useEffect(() => {
    if (isBlog) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const project = projectNavigation.find(item => item.path === pathname);
    document.title = `${pathname === '/profile' ? '소개' : project?.title || project?.label || '포트폴리오'} | 박현경`;
  }, [pathname, isBlog]);

  return (
    <PortfolioLayout blog={isBlog}>
      <Suspense fallback={<p role="status" className="portfolio-loading">페이지를 불러오는 중입니다.</p>}>
        {isBlog ? <BlogApplication /> : <PortfolioRoutes />}
      </Suspense>
    </PortfolioLayout>
  );
}
