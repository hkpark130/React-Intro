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
