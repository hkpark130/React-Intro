import React from 'react'
import Box from '@mui/material/Box'
import Sidebar from './components/Sidebar'

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh'}}>
      {/* 왼쪽 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 영역 */}
      <Box 
        component="main" 
        sx={{ flexGrow: 1, p: 2}}
      >
        {children}
      </Box>
    </Box>
  )
}
