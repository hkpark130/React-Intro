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

export default function TopNav({ onMenuClick, onCmdKClick }) {
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
          onClick={onCmdKClick}
          sx={{
            display: { xs: 'none', md: 'inline-flex' },
            px: 0.8,
            py: 0.3,
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
            border: '1px solid var(--border)',
            color: 'var(--ink-subtle)',
            borderRadius: '4px',
            cursor: 'pointer',
            '&:hover': { borderColor: 'var(--ink)', color: 'var(--ink)' },
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
