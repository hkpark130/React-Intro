import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, TextField, InputAdornment, CircularProgress, Pagination, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { fetchPosts, fetchCategories } from '../api/api';
import { getCategoryColor } from '@/data/categoryColors';

const POSTS_PER_PAGE = 10;

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const totalPages = Math.ceil(total / POSTS_PER_PAGE) || 1;

  useEffect(() => {
    fetchCategories()
      .then(({ data }) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const nextPage = Math.max(1, parseInt(p.get('page'), 10) || 1);
    const nextSearch = p.get('search') || '';
    const nextCatId = p.get('categoryId') || '';
    setPage(nextPage);
    setSearchTerm(nextSearch);
    setSearchInput(nextSearch);
    setSelectedCategoryId(nextCatId);
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    const offset = (page - 1) * POSTS_PER_PAGE;
    fetchPosts(offset, POSTS_PER_PAGE, searchTerm, selectedCategoryId)
      .then(({ data }) => {
        setPosts(data.posts || []);
        setTotal(data.total || 0);
      })
      .catch(() => {
        setPosts([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, searchTerm, selectedCategoryId]);

  const updateUrl = (next) => {
    const p = new URLSearchParams(location.search);
    Object.entries(next).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    navigate(`/blog?${p.toString()}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateUrl({ search: searchInput, page: '1' });
  };

  const handleSearchClear = () => {
    setSearchInput('');
    updateUrl({ search: '', page: '1' });
  };

  const handleCategorySelect = (catId) => {
    updateUrl({ categoryId: catId, page: '1' });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ fontSize: 11, letterSpacing: '1.6px', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase' }}>
          Writing · {total}
        </Box>
        <Box sx={{ fontSize: { xs: 26, md: 30 }, fontWeight: 600, letterSpacing: '-0.5px', mt: 0.5, color: 'var(--ink)' }}>
          Blog
        </Box>
        <Box sx={{ fontSize: 13, color: 'var(--ink-muted)', mt: 0.5 }}>
          DevOps · 백엔드 · 인프라 · 회고. 지금까지 {total}편.
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          <CategoryChip
            name="ALL"
            active={!selectedCategoryId}
            onClick={() => handleCategorySelect('')}
          />
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              name={c.name}
              active={String(selectedCategoryId) === String(c.id)}
              onClick={() => handleCategorySelect(c.id)}
            />
          ))}
        </Box>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <form onSubmit={handleSearchSubmit}>
            <TextField
              fullWidth
              size="small"
              placeholder="글 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleSearchClear}><CloseIcon fontSize="small" /></IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </form>
        </Box>
      </Box>

      <Box sx={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', bgcolor: 'var(--bg-canvas)' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {!loading && posts.length === 0 && (
          <Box sx={{ py: 5, textAlign: 'center', color: 'var(--ink-subtle)', fontSize: 13 }}>
            조건에 맞는 글이 없습니다.
          </Box>
        )}
        {!loading && posts.map((post) => (
          <PostRow key={post.id} post={post} onClick={() => navigate(`/blog/${post.id}?page=${page}`)} />
        ))}
      </Box>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
          <Box sx={{ fontSize: 11, color: 'var(--ink-subtle)' }}>
            {(page - 1) * POSTS_PER_PAGE + 1}-{Math.min(page * POSTS_PER_PAGE, total)} of {total}
          </Box>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => updateUrl({ page: String(v) })}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
}

function CategoryChip({ name, active, onClick }) {
  const c = getCategoryColor(name);
  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        fontSize: 11,
        px: 1.2,
        py: 0.5,
        borderRadius: 'var(--radius-pill)',
        fontWeight: 500,
        bgcolor: active ? 'var(--ink)' : c.bg,
        color: active ? 'var(--on-ink)' : c.fg,
        border: active ? '1px solid var(--ink)' : '1px solid transparent',
        transition: 'all 150ms ease-out',
        '&:hover': { opacity: 0.85 },
      }}
    >
      {name}
    </Box>
  );
}

function PostRow({ post, onClick }) {
  const cat = post.category ? getCategoryColor(post.category) : null;
  const formatted = new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'grid',
        gridTemplateColumns: '48px 100px 1fr auto 90px',
        gap: 1.5,
        alignItems: 'center',
        px: 2,
        py: 1.3,
        borderBottom: '1px solid var(--border-muted)',
        cursor: 'pointer',
        transition: 'background-color 150ms ease-out',
        '&:last-child': { borderBottom: 0 },
        '&:hover': { bgcolor: 'var(--accent-bg)' },
      }}
    >
      <Box sx={{ color: 'var(--ink-subtle)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>
        #{post.id}
      </Box>
      {cat ? (
        <Box sx={{
          fontSize: 10,
          fontWeight: 600,
          px: 1,
          py: 0.3,
          borderRadius: 'var(--radius-xs)',
          bgcolor: cat.bg,
          color: cat.fg,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {post.category}
        </Box>
      ) : <Box />}
      <Box sx={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {post.title}
      </Box>
      <Box sx={{
        fontSize: 10,
        fontWeight: 700,
        px: 0.8,
        py: 0.2,
        borderRadius: 'var(--radius-pill)',
        bgcolor: post.commentCount > 0 ? 'var(--accent)' : 'var(--border)',
        color: post.commentCount > 0 ? '#fff' : 'var(--ink-subtle)',
        minWidth: 22,
        textAlign: 'center',
      }}>
        💬 {post.commentCount || 0}
      </Box>
      <Box sx={{ fontSize: 11, color: 'var(--ink-subtle)', fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
        {formatted}
      </Box>
    </Box>
  );
}
