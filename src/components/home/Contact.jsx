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
