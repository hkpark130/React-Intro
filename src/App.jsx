import { React, useEffect, useState, createContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Intro from './components/Intro'
import Profile from './components/Profile'
import NotFound from './components/NotFound'
import SpringBoot from './components/SpringBoot'
import Python from './components/Python'
import Golang from './components/Golang'
import Terraform from './components/Terraform'
import Opensearch from './components/Opensearch'
import Redmine from './components/Redmine'
import './index.css';
import Blog from './components/Blog'
import BlogDetail from './components/BlogDetail'
import CreatePost from './components/CreatePost'
import EditPost from './components/EditPost' // EditPost 컴포넌트 추가
import ProtectedRoute from './components/ProtectedRoute';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Sidebar from './components/Sidebar';
import { scheduleTokenRefresh } from '@/api/auth';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { yellow, purple } from '@mui/material/colors';
import Chrome from '@/components/Chrome';
import ChatBot from '@/components/ChatBot';
import ChatWidget from '@/components/ChatWidget';
import KredisOperator from '@/components/KredisOperator'

// 사이드바 상태 컨텍스트 생성
export const SidebarContext = createContext({
  open: true,
  setOpen: () => {},
});

const theme = createTheme({
  palette: {
    yellow: {
      main: yellow[900],
    },
    purple: {
      main: purple[900],
    },
  },
});

function App() {
  const appTheme = useTheme();
  const isMobile = useMediaQuery(appTheme.breakpoints.down('md'));
  const drawerWidth = 240; // Keep in sync with Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    scheduleTokenRefresh(accessToken);
  }, []);

  // 화면 크기 변경 시 사이드바 상태 조정
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <ThemeProvider theme={theme}>
      <SidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <Sidebar />
          <Box 
            component="main" 
            sx={{
              flexGrow: 1, 
              p: 3,
              display: 'flex',
              justifyContent: 'center',
              transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              ml: sidebarOpen && !isMobile ? `10px` : 0,
              pt: { xs: 6, sm: 5, md: 3 }, // 모바일에서는 상단 여백을 좀 더 주어 토글 버튼 공간 확보
            }}
          >
            <Box sx={{ width: '100%', maxWidth: 1200 }}>
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
              <Route 
                path="/blog/edit/:id" 
                element={
                  <ProtectedRoute>
                    <EditPost />
                  </ProtectedRoute>
                } 
              />
              <Route path="/golang" element={<Golang />} />
              <Route path="/terraform" element={<Terraform />} />
              <Route path="/opensearch" element={<Opensearch />} />
              <Route path="/redmine" element={<Redmine />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/chrome" element={<Chrome />} />
              <Route path="/chatbot" element={<ChatBot />} />
              <Route path="/kredis" element={<KredisOperator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Box>
          </Box>
        </Box>
        
        {/* 채팅 위젯 - 화면 고정 */}
        <ChatWidget />
      </SidebarContext.Provider>
    </ThemeProvider>
  )
}

export default App
