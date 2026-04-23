import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TopNav from './components/layout/TopNav';
import Footer from './components/layout/Footer';
import MobileNavDrawer from './components/layout/MobileNavDrawer';
import CommandPalette from './components/layout/CommandPalette';
import ChatWidget from './components/ChatWidget';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const isK = e.key === 'k' || e.key === 'K';
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === 'Escape') setPaletteOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav onMenuClick={() => setMobileOpen(true)} onCmdKClick={() => setPaletteOpen(true)} />
      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ChatWidget />
    </Box>
  );
}
