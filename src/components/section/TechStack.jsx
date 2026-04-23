import React from 'react';
import PropTypes from 'prop-types';
import { Box, Chip, Stack } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

export default function TechStack({ techStacks }) {
  return (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <CodeIcon sx={{ fontSize: 18, color: 'var(--ink-muted)' }} />
        <Box sx={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>Tech Stack</Box>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '140px 1fr' },
          gap: { xs: 0, sm: 2 },
        }}
      >
        {techStacks.map((tech, index) => (
          <React.Fragment key={index}>
            <Box sx={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-muted)', py: 1.2 }}>
              {tech.category}
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: 0.8,
                flexWrap: 'wrap',
                py: 1.2,
                borderBottom: index < techStacks.length - 1 ? '1px solid var(--border-muted)' : 'none',
              }}
            >
              {tech.labels.map((item, i) => (
                <Chip
                  key={i}
                  label={item.label}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    bgcolor: 'var(--bg-canvas)',
                    color: 'var(--ink-muted)',
                    borderColor: 'var(--border)',
                    '&:hover': { borderColor: 'var(--ink)', color: 'var(--ink)' },
                  }}
                />
              ))}
            </Box>
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

TechStack.propTypes = {
  techStacks: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, color: PropTypes.string })).isRequired,
    })
  ).isRequired,
};
