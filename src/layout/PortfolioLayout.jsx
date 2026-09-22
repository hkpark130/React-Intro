import PropTypes from 'prop-types';
import { CssBaseline, ThemeProvider } from '@mui/material';
import TopNavigation from './TopNavigation';
import { portfolioTheme } from './portfolioTheme';
import ChatWidget from '../components/ChatWidget';
import './portfolio.css';

export default function PortfolioLayout({ blog, children }) {
  return (
    <ThemeProvider theme={portfolioTheme}>
      <CssBaseline />
      <div className={`portfolio-layout${blog ? ' portfolio-layout--blog' : ''}`}>
        <a className="portfolio-skip-link" href={blog ? '#blog-main-content' : '#main-content'}>본문으로 건너뛰기</a>
        <TopNavigation />
        {blog
          ? <div className="portfolio-blog">{children}</div>
          : <main id="main-content" className="portfolio-project" tabIndex={-1}>{children}</main>}
      </div>
      <ChatWidget />
    </ThemeProvider>
  );
}

PortfolioLayout.propTypes = { blog: PropTypes.bool, children: PropTypes.node };
