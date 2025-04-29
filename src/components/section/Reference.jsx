import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Link as MuiLink, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch';

/**
 * Reference
 * - 내부 SPA 링크 및 외부 링크를 한 곳에서 관리할 수 있는 재사용 컴포넌트
 *
 * Props:
 *  - spaLinks: [{ prefix: string, to: string, label: string }]
 *  - externalLinks: [{ prefix: string, href: string, label: string, highlighted: boolean }]
 */
export default function Reference({ spaLinks, externalLinks }) {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Typography variant="h5" gutterBottom>
        🔗 Reference
      </Typography>

      {spaLinks.map(({ prefix, to, label, highlighted }, idx) => (
        <Box key={idx} sx={{ mb: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {highlighted ? (
            <>
              <Typography variant="h5" component="span">
                {prefix}{' '}
              </Typography>
              <Button 
                component={RouterLink}
                to={to}
                variant="outlined" 
                color="primary"
                endIcon={<LaunchIcon />}
                sx={{ 
                  ml: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  border: '2px solid',
                  '&:hover': {
                    border: '2px solid',
                  }
                }}
              >
                {label}
              </Button>
            </>
          ) : (
            <Typography variant="body1" component="p">
              {prefix}{' '}
              <MuiLink component={RouterLink} to={to} underline="hover" sx={{ ml: 0.5 }}>
                {label}
              </MuiLink>
            </Typography>
          )}
        </Box>
      ))}

      {externalLinks.map(({ prefix, href, label, highlighted }, idx) => (
        <Box key={idx} sx={{ mb: 1, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          {highlighted ? (
            <>
              <Typography variant="h5" component="span">
                {prefix}{' '}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary"
                href={href}
                target="_blank" 
                rel="noopener noreferrer"
                endIcon={<LaunchIcon />}
                sx={{ 
                  ml: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  border: '2px solid',
                  '&:hover': {
                    border: '2px solid',
                  }
                }}
              >
                {label}
              </Button>
            </>
          ) : (
            <Typography variant="body1" component="p">
              {prefix}{' '}
              <MuiLink href={href} target="_blank" rel="noopener noreferrer" sx={{ ml: 0.5 }}>
                {label}
              </MuiLink>
            </Typography>
          )}
        </Box>
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
      highlighted: PropTypes.bool
    })
  ),
  externalLinks: PropTypes.arrayOf(
    PropTypes.shape({
      prefix: PropTypes.string,
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      highlighted: PropTypes.bool
    })
  ),
};

Reference.defaultProps = {
  spaLinks: [],
  externalLinks: [],
};
