import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Intro from './components/Intro'
import Profile from './components/Profile'
import NotFound from './components/NotFound'
import SpringBoot from './components/SpringBoot'
import Python from './components/Python'
import Go from './components/Go'
import './index.css';
import Blog from './components/Blog'
import BlogDetail from './components/BlogDetail'
import CreatePost from './components/CreatePost'
import ProtectedRoute from './components/ProtectedRoute';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/springboot" element={<SpringBoot />} />
          <Route path="/python" element={<Python />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route 
            path="/blog/create" 
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            } 
          />
          <Route path="/go" element={<Go />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
