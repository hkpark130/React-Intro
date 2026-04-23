import React from 'react';
import { Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ProjectCard from '@/components/projects/ProjectCard';
import { getFeaturedProjects } from '@/data/projects';

export default function SelectedWork() {
  const featured = getFeaturedProjects();
  return (
    <Box
      component="section"
      sx={{ borderTop: '1px solid var(--border)', py: { xs: 5, md: 7 } }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
          <Box>
            <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
              Selected Work
            </Box>
            <Box sx={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px', mt: 0.5, color: 'var(--ink)' }}>
              Projects
            </Box>
          </Box>
          <Box
            component={RouterLink}
            to="/projects"
            sx={{
              fontSize: 12,
              color: 'var(--accent)',
              fontWeight: 500,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            See all 10 →
          </Box>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
