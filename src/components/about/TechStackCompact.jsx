import React from 'react';
import { Box, Container } from '@mui/material';

const STACKS = [
  { category: '인프라·DevOps', items: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'Nginx'] },
  { category: '백엔드', items: ['Spring Boot', 'Go', 'Node.js', 'MySQL / MariaDB', 'JWT'] },
  { category: '프론트엔드', items: ['React', 'Vite', 'MUI', 'Framer Motion'] },
  { category: '관찰성·ML', items: ['OpenSearch', 'Grafana', 'TensorFlow'] },
];

export default function TechStackCompact() {
  return (
    <Box component="section" sx={{ borderTop: '1px solid var(--border)', py: { xs: 4, md: 5 } }}>
      <Container maxWidth="md">
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--ink-subtle)', textTransform: 'uppercase' }}>
          Tech Stack
        </Box>
        <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: { xs: 0, sm: 1.5 } }}>
          {STACKS.map((s) => (
            <React.Fragment key={s.category}>
              <Box sx={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, py: 1, pr: 2 }}>{s.category}</Box>
              <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', py: 1, borderBottom: '1px solid var(--border-muted)' }}>
                {s.items.map((i) => (
                  <Box key={i} sx={{ fontSize: 12, px: 1, py: 0.3, bgcolor: 'var(--bg-subtle)', color: 'var(--ink-muted)', borderRadius: 'var(--radius-xs)' }}>
                    {i}
                  </Box>
                ))}
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
