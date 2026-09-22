import { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Box, CssBaseline, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { yellow, purple } from '@mui/material/colors';
import { SidebarContext } from './legacySidebarContext';
import Sidebar from './components/Sidebar';
import Intro from './components/Intro';
import ChatWidget from './components/ChatWidget';

const Profile = lazy(() => import('./components/Profile'));
const SpringBoot = lazy(() => import('./components/SpringBoot'));
const Python = lazy(() => import('./components/Python'));
const Golang = lazy(() => import('./components/Golang'));
const Terraform = lazy(() => import('./components/Terraform'));
const Opensearch = lazy(() => import('./components/Opensearch'));
const Redmine = lazy(() => import('./components/Redmine'));
const Chrome = lazy(() => import('./components/Chrome'));
const ChatBot = lazy(() => import('./components/ChatBot'));
const KredisOperator = lazy(() => import('./components/KredisOperator'));
const OpenStackBuild = lazy(() => import('./components/OpenStackBuild'));
const NotFound = lazy(() => import('./components/NotFound'));

const theme = createTheme({ palette: { yellow: { main: yellow[900] }, purple: { main: purple[900] } } });

export default function LegacyPortfolio({ blog = false, children }) {
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  return <ThemeProvider theme={theme}>
    <SidebarContext.Provider value={{ open: sidebarOpen, setOpen: setSidebarOpen }}>
      <Box className={`portfolio-layout ${blog ? 'portfolio-layout--blog' : 'legacy-portfolio'}`} sx={{ display: 'flex' }}>
        <CssBaseline />
        <Sidebar />
        <Box component={blog ? 'div' : 'main'} id={blog ? undefined : 'main-content'} sx={{
          flexGrow: 1, minWidth: 0, p: blog ? 0 : 3, display: 'flex', justifyContent: 'center',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen,
          }),
          ml: !blog && sidebarOpen && !isMobile ? '10px' : 0,
          pt: blog ? (sidebarOpen && !isMobile ? 0 : 7) : { xs: 6, sm: 5, md: 3 },
        }}>
          <Box sx={{ width: '100%', maxWidth: blog ? 'none' : 1200, minWidth: 0 }}>
            <Suspense fallback={<p role="status">페이지를 불러오는 중입니다.</p>}>
              {blog ? children : <Routes>
                <Route path="/" element={<Intro />} />
                <Route path="/openstack" element={<OpenStackBuild />} />
                <Route path="/springboot" element={<SpringBoot />} />
                <Route path="/python" element={<Python />} />
                <Route path="/golang" element={<Golang />} />
                <Route path="/terraform" element={<Terraform />} />
                <Route path="/opensearch" element={<Opensearch />} />
                <Route path="/redmine" element={<Redmine />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chrome" element={<Chrome />} />
                <Route path="/chatbot" element={<ChatBot />} />
                <Route path="/kredis" element={<KredisOperator />} />
                <Route path="/projects" element={<Navigate to="/" replace />} />
                <Route path="/cicd" element={<Navigate to="/blog/55" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>}
            </Suspense>
          </Box>
        </Box>
      </Box>
      {!blog && <ChatWidget />}
    </SidebarContext.Provider>
  </ThemeProvider>;
}

LegacyPortfolio.propTypes = {
  blog: PropTypes.bool,
  children: PropTypes.node,
};
