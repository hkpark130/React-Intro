import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import BadgeIcon from '@mui/icons-material/Badge';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { SidebarContext } from '../App';

export default function Sidebar() {
  const drawerWidth = 240;
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // App.jsx에서 공유하는 사이드바 상태 사용
  const { open, setOpen } = useContext(SidebarContext);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const isPathSelected = (path) => {
    if (path === '/') {
      // 홈(/)의 경우 정확히 일치할 때만 선택으로 처리
      return pathname === path;
    }
    // 다른 경로는 시작 부분이 일치하면 선택으로 처리
    return pathname.startsWith(path);
  };

  const items = [
    { to: '/', primary: 'Intro', secondary: '', icon: <HomeIcon /> },
    { to: '/blog', primary: 'Blog', secondary: '', icon: <StorageIcon /> },
    {
      to: '/springboot',
      primary: 'Spring Boot',
      secondary: '',
      icon: (
        <Box
          component="img"
          src="/logo/spring-boot.png"
          alt="Spring Boot"
          style={{ width: '24px', height: '24px' }}
          sx={{ 
            width: 28, 
            height: 24,
            objectFit: 'contain' // 이미지 비율 유지하면서 크기 조정
          }}
        />
      )
    },
    {
      to: '/golang',
      primary: 'Go JWT',
      secondary: '',
      icon: (
        <Box
          style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'currentColor',
            maskImage: 'url(/logo/go.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/logo/go.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
      )
    },
    {
      to: '/kredis',
      primary: 'Kubernetes',
      secondary: 'Operator (Kredis)',
      icon: (
        <Box
          style={{
            width: '35px',
            height: '35px',
            backgroundColor: 'currentColor',
            maskImage: 'url(/logo/kubernetes.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/logo/kubernetes.svg)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
      )
    },
    {
      to: '/opensearch',
      primary: 'OpenSearch',
      secondary: '',
      icon: (
        <Box
          style={{
            width: '30px',
            height: '24px',
            backgroundColor: 'currentColor',
            maskImage: 'url(/logo/opensearch.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskImage: 'url(/logo/opensearch.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
          }}
        />
      )
    },
    {
      to: '/python',
      primary: 'ML',
      secondary: '(집 값 예측)',
      icon: (
        <Box
          component="img"
          src="/logo/tensorflow.png"
          alt="Spring Boot"
          style={{ width: '32px', height: '32px' }}
          sx={{ 
            width: 28, 
            height: 24,
            objectFit: 'contain' // 이미지 비율 유지하면서 크기 조정
          }}
        />
      )
    },
    { to: '/terraform', primary: 'Terraform', secondary: '', icon: (
      <Box
        style={{
          width: '30px',
          height: '30px',
          backgroundColor: 'currentColor',
          maskImage: 'url(/logo/terraform.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: 'url(/logo/terraform.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      />
    ) },
    {
      to: '/chrome',
      primary: 'Chrome',
      secondary: 'Extension',
      icon: (
        <Box
          component="img"
          src="/logo/chrome.png"
          alt="Chrome Extension"
          style={{ width: '30px', height: '30px' }}
          sx={{ 
            width: 30, 
            height: 30,
            objectFit: 'contain' // 이미지 비율 유지하면서 크기 조정
          }}
        />
      )
    },
    {
      to: '/chatbot',
      primary: 'AI 챗봇',
      icon: <SmartToyIcon />
    },
    // 여기서 프로젝트 더 추가할 것 <------
    { to: '/redmine', primary: 'Redmine', secondary: '', icon: (
      <Box
        component="img"
        src="/logo/redmine.png"
        alt="Redmine"
        style={{ width: '24px', height: '24px' }}
        sx={{ 
          width: 30, 
          height: 30,
          objectFit: 'contain' // 이미지 비율 유지하면서 크기 조정
        }}
      />
    ) },
    { to: '/profile', primary: 'Profile', secondary: '', icon: <BadgeIcon /> }
  ];

  // 사이드바 토글 버튼 (모바일에서는 항상 표시, 데스크탑에서는 사이드바가 접혔을 때 표시)
  const toggleButton = (
    <IconButton
      color="primary"
      aria-label={open ? '사이드바 닫기' : '사이드바 열기'}
      onClick={handleDrawerToggle}
      sx={{
        position: 'fixed',
        top: 10,
        left: open ? drawerWidth - 20 : 10,
        zIndex: 1300,
        bgcolor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'left 225ms cubic-bezier(0.4, 0, 0.6, 1)',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.9)',
        }
      }}
    >
      {open ? <ChevronLeftIcon /> : <MenuIcon />}
    </IconButton>
  );

  return (
    <>
      {toggleButton}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
        PaperProps={{ className: 'sidebar' }}
        sx={{
          width: open ? drawerWidth : 0,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: 'none',
            ...(isMobile ? {} : { 
              position: 'fixed', // Make sidebar fixed so it stays in place while main content scrolls
              top: 0,
              left: 0,
              height: '100vh',
              overflowY: 'auto',
              zIndex: theme.zIndex.drawer,
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              })
            }),
            overflowX: 'hidden'
          }
        }}
      >
        {/* 프로필 영역 */}
        <Box 
          sx={{ 
            py: 3, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            background: 'linear-gradient(to right, #4776E6, #8E54E9)',
            color: 'white'
          }}
        >
          <Avatar
            sx={{ 
              width: 80, 
              height: 80, 
              mb: 2, 
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              border: '3px solid white'
            }}
            alt="박현경"
            src="/logo/profile.png" // 프로필 이미지 경로 (없으면 이니셜 표시됨)
          >
            P
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              textShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }}
          >
            박현경 Portfolio
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            DevOps Engineer
          </Typography>
        </Box>
        
        <Divider sx={{ mx: 2 }} />
        
        {/* 메뉴 영역 */}
        <List sx={{ pt: 2, px: 1 }}>
          {items.map(({ to, primary, secondary, icon }) => {
            const selected = isPathSelected(to);
            return (
              <ListItemButton
                key={to}
                component={Link}
                to={to}
                selected={selected}
                onClick={isMobile ? handleDrawerToggle : undefined}
                sx={{
                  my: 0.5,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white'
                    },
                    '& .MuiListItemText-primary, & .MuiListItemText-secondary': {
                      color: 'white'
                    }
                  },
                  '&:hover': {
                    backgroundColor: selected ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: selected ? 'white' : 'primary.main',
                    minWidth: 40
                  }}
                >
                  {React.cloneElement(icon, { 
                    fontSize: 'medium',
                    sx: { filter: selected ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none' }
                  })}
                </ListItemIcon>

                <ListItemText
                  primary={primary}
                  secondary={secondary || null}
                  style={{ textAlign: 'center' }}
                  slotProps={{
                    primary: {
                      sx: { 
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        letterSpacing: '0.4px'
                      }
                    },
                    secondary: {
                      sx: { 
                        fontWeight: 'bold',
                        fontSize: '0.95rem',
                        color: selected ? 'white' : 'black'
                      }
                    }
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
        
        <Box 
          component="div" 
          sx={{ 
            mt: 'auto', 
            mb: 2, 
            mx: 2, 
            p: 2, 
            borderRadius: 2,
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            textAlign: 'center',
            fontSize: '0.75rem'
          }}
        >
          <Typography variant="caption" color="text.secondary">
            박현경<br />
            Portfolio 
          </Typography>
        </Box>
      </Drawer>
    </>
  );
}
