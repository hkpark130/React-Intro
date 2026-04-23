import React from 'react';
import { Box, Container } from '@mui/material';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';
import { PROJECTS } from '@/data/projects';

const variant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
};

export default function ProjectsGrid() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
          Selected Work · {PROJECTS.length}
        </Box>
        <Box sx={{ fontSize: { xs: 28, md: 32 }, fontWeight: 600, letterSpacing: '-0.6px', mt: 1, color: 'var(--ink)' }}>
          Projects
        </Box>
        <Box sx={{ fontSize: 14, color: 'var(--ink-muted)', mt: 1, maxWidth: 540 }}>
          Cloud infrastructure, Kubernetes operators, 그리고 빌드해 온 도구들.
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {PROJECTS.map((p, i) => (
          <motion.div
            key={p.slug}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={variant}
          >
            <ProjectCard project={p} />
          </motion.div>
        ))}
      </Box>
    </Container>
  );
}
