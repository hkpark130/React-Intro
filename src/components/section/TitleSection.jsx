import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';
import './project-sections.css';

export default function TitleSection({ title, subtitle = '', description = '', sx = {} }) {
  return <Box component="header" className="project-title" sx={sx}>
    <Typography component="h1" variant="inherit" className="project-title-heading">{title}</Typography>
    {subtitle && <Typography component="p" variant="inherit" className="project-title-subtitle">{subtitle}</Typography>}
    {description && <Typography component="p" variant="inherit" className="project-title-description">{description}</Typography>}
  </Box>;
}
TitleSection.propTypes = { title: PropTypes.string.isRequired, subtitle: PropTypes.string, description: PropTypes.string, sx: PropTypes.object };
