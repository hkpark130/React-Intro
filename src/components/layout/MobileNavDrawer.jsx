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
