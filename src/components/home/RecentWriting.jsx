import React, { useEffect, useState } from 'react';
import { Box, Container, Skeleton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchPosts } from '@/api/api';
import { getCategoryColor } from '@/data/categoryColors';

export default function RecentWriting() {
  const [posts, setPosts] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPosts(0, 3)
      .then(({ data }) => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .catch(() => setPosts([]));
  }, []);

  return (
    <Box
      component="section"
      sx={{ borderTop: '1px solid var(--border)', py: { xs: 5, md: 7 } }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
          <Box>
            <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
              Recent Writing
            </Box>
            <Box sx={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.3px', mt: 0.5, color: 'var(--ink)' }}>
              Blog
            </Box>
          </Box>
          <Box
            component={RouterLink}
            to="/blog"
            sx={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            All {total || 109} posts →
          </Box>
        </Box>
        <Box sx={{ maxWidth: 720 }}>
          {posts === null && [...Array(3)].map((_, i) => (
            <Box key={i} sx={{ py: 1.2, borderBottom: '1px solid var(--border-muted)' }}>
              <Skeleton width="65%" height={22} />
              <Skeleton width="20%" height={16} />
            </Box>
          ))}
          {posts?.map((p) => (
            <Box
              key={p.id}
              component={RouterLink}
              to={`/blog/${p.id}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 1.3,
                borderBottom: '1px solid var(--border-muted)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background-color 150ms ease-out',
                '&:hover': { bgcolor: 'var(--accent-bg)' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                {p.category && (() => {
                  const c = getCategoryColor(p.category);
                  return (
                    <Box sx={{ fontSize: 10, px: 0.8, py: 0.2, borderRadius: 'var(--radius-xs)', bgcolor: c.bg, color: c.fg, flexShrink: 0 }}>
                      {p.category}
                    </Box>
                  );
                })()}
                <Box sx={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </Box>
              </Box>
              <Box sx={{ fontSize: 11, color: 'var(--ink-subtle)', flexShrink: 0, ml: 2 }}>
                {new Date(p.createdAt).toLocaleDateString()}
              </Box>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
