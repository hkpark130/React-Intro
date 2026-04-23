import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import TopNav from './components/layout/TopNav';
import Footer from './components/layout/Footer';
import MobileNavDrawer from './components/layout/MobileNavDrawer';
import ChatWidget from './components/ChatWidget';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <MobileNavDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ChatWidget />
    </Box>
  );
}
