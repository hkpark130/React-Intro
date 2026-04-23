import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Home from './components/home/Home';
import SpringBoot from './components/SpringBoot';
import Python from './components/Python';
import Golang from './components/Golang';
import Terraform from './components/Terraform';
import Opensearch from './components/Opensearch';
import Redmine from './components/Redmine';
import Chrome from './components/Chrome';
import ChatBot from './components/ChatBot';
import KredisOperator from './components/KredisOperator';
import Profile from './components/Profile';
import Blog from './components/Blog';
import BlogDetail from './components/BlogDetail';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import { scheduleTokenRefresh } from '@/api/auth';
import ProjectsGrid from './components/projects/ProjectsGrid';

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    scheduleTokenRefresh(token);
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsGrid />} />
        <Route path="/springboot" element={<SpringBoot />} />
        <Route path="/kredis" element={<KredisOperator />} />
        <Route path="/golang" element={<Golang />} />
        <Route path="/opensearch" element={<Opensearch />} />
        <Route path="/python" element={<Python />} />
        <Route path="/terraform" element={<Terraform />} />
        <Route path="/chrome" element={<Chrome />} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="/redmine" element={<Redmine />} />
        {/* /profile → /about redirect (About 컴포넌트는 Phase 3에서 구현) */}
        <Route path="/profile" element={<Navigate to="/about" replace />} />
        <Route path="/about" element={<Profile />} />
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
        <Route
          path="/blog/edit/:id"
          element={
            <ProtectedRoute>
              <EditPost />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
