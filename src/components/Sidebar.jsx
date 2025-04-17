import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import BadgeIcon from '@mui/icons-material/Badge';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

export default function Sidebar() {
  const drawerWidth = 200;
  const { pathname } = useLocation();

  const items = [
    { to: '/', primary: 'Intro', secondary: '', icon: <HomeIcon /> },
    {
      to: '/springboot',
      primary: 'Spring Boot',
      secondary: '',
      icon: (
        <Box
          component="img"
          src="/logo/spring-boot.png"
          alt="Spring Boot"
          sx={{ width: 28, height: 24 }}
        />
      )
    },
    { to: '/blog', primary: 'Blog', secondary: '', icon: <StorageIcon /> },
    {
      to: '/python',
      primary: 'ML',
      secondary: '(집 값 예측)',
      icon: <PrecisionManufacturingIcon />
    },

    { to: '/profile', primary: 'Profile', secondary: '', icon: <BadgeIcon /> }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg,rgba(227, 227, 227, 0.26) 0%,rgba(206, 206, 206, 0.84) 100%)',
          color: 'black'
        }
      }}
    >
      <Typography
        variant="h6"
        textAlign="center"
        mt={2}
        sx={{ fontWeight: 'bold' }}
      >
        박현경 Portfolio
      </Typography>

      <List>
        {items.map(({ to, primary, secondary, icon }) => {
          const selected = pathname === to;
          return (
            <ListItemButton
              key={to}
              component={Link}
              to={to}
              selected={selected}
              sx={{
                textAlign: 'center',
                pl: 1.3,
                '&.Mui-selected': {
                  backgroundColor: '#E3F2FD',
                  color: '#1976D2',
                  '& .MuiListItemIcon-root': {
                    color: '#1976D2'
                  },
                  '& .MuiListItemText-primary': {
                    color: '#1976D2'
                  },
                  '& .MuiListItemText-secondary': {
                    color: '#1976D2'
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)'
                },
                '& .MuiListItemIcon-root': {
                  minWidth: 5,
                  mr: 0.8
                }
              }}
            >
              <ListItemIcon sx={{ color: selected ? '#1976D2' : 'black' }}>
                {React.cloneElement(icon, { fontSize: 'medium' })}
              </ListItemIcon>

              <ListItemText
                primary={primary}
                secondary={secondary || null}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      lineHeight: secondary ? 1.1 : 1.5
                    }
                  },
                  secondary: {
                    sx: {
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      color: 'black',
                      lineHeight: 1
                    }
                  }
                }}
                
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
