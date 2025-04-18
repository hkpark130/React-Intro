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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/springboot" element={<SpringBoot />} />
        <Route path="/python" element={<Python />} />

        <Route path="/go" element={<Go />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}

export default App