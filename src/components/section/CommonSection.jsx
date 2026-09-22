import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import './project-sections.css';

export default function CommonSection({ title, body, sx = {} }) {
  return <Box component="section" className="project-section" sx={sx}>
    <Box className="project-section-heading">
      {typeof title === 'string' ? <Typography component="h2" variant="inherit">{title}</Typography> : title}
    </Box>
    <div className="project-section-copy">
      {typeof body === 'string'
        ? body.split(/\r?\n/).map((line, index) => <Typography component="p" key={index}>{line}</Typography>)
        : body}
    </div>
  </Box>;
}
CommonSection.propTypes = { title: PropTypes.node.isRequired, body: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired, sx: PropTypes.object };
