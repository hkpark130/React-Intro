import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Box, Modal } from '@mui/material';
import { PROJECTS } from '@/data/projects';
import { fetchPosts } from '@/api/api';
import { isAuthenticated, logout } from '@/api/auth';

export function filterItems(items, query) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter((i) => i.label.toLowerCase().includes(q));
}

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const authed = isAuthenticated();

  useEffect(() => {
    if (!open || posts.length > 0) return;
    const cached = sessionStorage.getItem('cmdk.posts');
    if (cached) {
      try {
        setPosts(JSON.parse(cached));
        return;
      } catch { /* fallthrough */ }
    }
    fetchPosts(0, 200)
      .then(({ data }) => {
        const titles = (data.posts || []).map((p) => ({ id: p.id, title: p.title }));
        setPosts(titles);
        sessionStorage.setItem('cmdk.posts', JSON.stringify(titles));
      })
      .catch(() => setPosts([]));
  }, [open, posts.length]);

  const go = (path) => { onClose(); navigate(path); };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="command-palette">
      <Box
        sx={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: { xs: '92%', sm: 560 },
          bgcolor: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-popover)',
          overflow: 'hidden',
        }}
      >
        <Command label="명령 팔레트" style={{ width: '100%' }}>
          <Command.Input
            placeholder="검색 · 이동..."
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              padding: '14px 16px',
              background: 'transparent',
              color: 'var(--ink)',
              fontFamily: 'var(--font-sans)',
              borderBottom: '1px solid var(--border)',
            }}
          />
          <Command.List style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
            <Command.Empty style={{ padding: '18px 12px', fontSize: 13, color: 'var(--ink-subtle)' }}>
              결과 없음
            </Command.Empty>

            <Command.Group heading="Navigate">
              <PaletteItem onSelect={() => go('/')}>Home</PaletteItem>
              <PaletteItem onSelect={() => go('/projects')}>Projects</PaletteItem>
              <PaletteItem onSelect={() => go('/blog')}>Writing (Blog)</PaletteItem>
              <PaletteItem onSelect={() => go('/about')}>About</PaletteItem>
            </Command.Group>

            <Command.Group heading="Projects">
              {PROJECTS.map((p) => (
                <PaletteItem key={p.slug} onSelect={() => go(p.path)}>
                  {p.name} <span style={{ color: 'var(--ink-subtle)', fontSize: 11, marginLeft: 6 }}>{p.kicker}</span>
                </PaletteItem>
              ))}
            </Command.Group>

            {posts.length > 0 && (
              <Command.Group heading="Blog posts">
                {posts.slice(0, 50).map((p) => (
                  <PaletteItem key={p.id} onSelect={() => go(`/blog/${p.id}`)}>
                    #{p.id} · {p.title}
                  </PaletteItem>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Actions">
              {authed ? (
                <>
                  <PaletteItem onSelect={() => go('/blog/create')}>새 게시글 작성</PaletteItem>
                  <PaletteItem onSelect={async () => { await logout(); onClose(); window.location.reload(); }}>
                    로그아웃
                  </PaletteItem>
                </>
              ) : (
                <PaletteItem onSelect={() => { onClose(); }}>
                  로그인 (화면 상단 아바타 클릭)
                </PaletteItem>
              )}
              <PaletteItem onSelect={() => { window.open('https://github.com/hkpark130', '_blank'); onClose(); }}>
                GitHub ↗
              </PaletteItem>
              <PaletteItem onSelect={() => { window.open('https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/', '_blank'); onClose(); }}>
                LinkedIn ↗
              </PaletteItem>
            </Command.Group>
          </Command.List>
        </Command>
      </Box>
    </Modal>
  );
}

function PaletteItem({ children, onSelect }) {
  return (
    <Command.Item
      onSelect={onSelect}
      style={{
        padding: '8px 12px',
        fontSize: 13,
        color: 'var(--ink)',
        cursor: 'pointer',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      {children}
    </Command.Item>
  );
}
