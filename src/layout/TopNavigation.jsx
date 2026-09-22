import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { projectNavigation } from './projectNavigation';

export default function TopNavigation() {
  const { pathname } = useLocation();
  const [anchor, setAnchor] = useState(null);
  const isProject = projectNavigation.some(item => item.path === pathname);
  const open = Boolean(anchor);
  useEffect(() => { setAnchor(null); }, [pathname]);

  return (
    <header className="portfolio-header">
      <div className="portfolio-header-inner">
        <Link className="portfolio-brand" to="/" aria-label="박현경 포트폴리오 홈">
          <strong>박현경</strong><span>Portfolio</span>
        </Link>
        <nav className="portfolio-navigation" aria-label="포트폴리오 메뉴">
          <button
            type="button"
            className={`portfolio-project-trigger${isProject ? ' is-active' : ''}`}
            id="project-menu-trigger"
            aria-haspopup="menu"
            aria-controls={open ? 'project-navigation' : undefined}
            aria-expanded={open}
            onClick={event => setAnchor(open ? null : event.currentTarget)}
            onKeyDown={event => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setAnchor(event.currentTarget);
              }
            }}
          >프로젝트<KeyboardArrowDownRoundedIcon aria-hidden="true" /></button>
          <NavLink to="/blog" className={({ isActive }) => isActive ? 'is-active' : ''}>기술 기록</NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'is-active' : ''}>소개</NavLink>
        </nav>
      </div>
      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        marginThreshold={16}
        slotProps={{
          paper: { className: 'portfolio-project-menu' },
          list: { id: 'project-navigation', 'aria-labelledby': 'project-menu-trigger' },
        }}
      >
        {projectNavigation.map(item => (
          <MenuItem
            key={item.path}
            component={Link}
            to={item.path}
            selected={pathname === item.path}
            aria-current={pathname === item.path ? 'page' : undefined}
            onClick={() => setAnchor(null)}
          >
            <span className="portfolio-menu-icon" aria-hidden="true">
              {item.logo ? <img src={item.logo} alt="" /> : item.icon === 'home' ? <HomeOutlinedIcon /> : <SmartToyOutlinedIcon />}
            </span>
            <span>{item.label}</span>
          </MenuItem>
        ))}
      </Menu>
    </header>
  );
}
