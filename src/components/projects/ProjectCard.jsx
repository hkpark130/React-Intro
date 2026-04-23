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
