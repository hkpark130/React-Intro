import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

export default function TitleSection({ title, subtitle, description, sx }) {
  return (
    <Box sx={{ py: { xs: 3, md: 4 }, ...sx }}>
      <Box
        sx={{
          fontSize: 11,
          letterSpacing: '1.6px',
          fontWeight: 700,
          color: 'var(--accent)',
          textTransform: 'uppercase',
        }}
      >
        {subtitle || 'Project'}
      </Box>
      <Box
        component="h1"
        sx={{
          fontSize: { xs: 26, md: 32 },
          fontWeight: 600,
          letterSpacing: '-0.6px',
          color: 'var(--ink)',
          lineHeight: 1.15,
          mt: 1,
          mb: 0,
        }}
      >
        {title}
      </Box>
      {description && (
        <Box sx={{ fontSize: 14, color: 'var(--ink-muted)', mt: 1.5, lineHeight: 1.65, maxWidth: 620 }}>
          {description}
        </Box>
      )}
    </Box>
  );
}

TitleSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  sx: PropTypes.object,
};
