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
