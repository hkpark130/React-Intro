import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Reference
 * - 내부 SPA 링크 및 외부 링크를 한 곳에서 관리할 수 있는 재사용 컴포넌트
 *
 * Props:
 *  - spaLinks: [{ prefix: string, to: string, label: string }]
 *  - externalLinks: [{ prefix: string, href: string, label: string }]
 */
export default function Reference({ spaLinks, externalLinks }) {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Reference
      </Typography>

      {spaLinks.map(({ prefix, to, label }, idx) => (
        <Typography key={idx} variant="body1" component="p" sx={{ mb: 1 }}>
          {prefix}{' '}
          <MuiLink component={RouterLink} to={to} underline="hover" sx={{ ml: 0.5 }}>
            {label}
          </MuiLink>
        </Typography>
      ))}

      {externalLinks.map(({ prefix, href, label }, idx) => (
        <Typography key={idx} variant="body1" component="p">
          {prefix}{' '}
          <MuiLink href={href} target="_blank" rel="noopener noreferrer" sx={{ ml: 0.5 }}>
            {label}
          </MuiLink>
        </Typography>
      ))}
    </Box>
  );
}

Reference.propTypes = {
  spaLinks: PropTypes.arrayOf(
    PropTypes.shape({
      prefix: PropTypes.string,
      to: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  externalLinks: PropTypes.arrayOf(
    PropTypes.shape({
      prefix: PropTypes.string,
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
};

Reference.defaultProps = {
  spaLinks: [],
  externalLinks: [],
};
