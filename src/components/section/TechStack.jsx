import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip, Stack } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';

/**
 * TechStack
 * - 기술 스택 목록을 렌더링하는 재사용 가능한 컴포넌트입니다.
 *
 * Props:
 *  - techStacks: [{ category: string, labels: [{ label: string, color: string }] }]
 */
export default function TechStack({ techStacks }) {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      {/* 제목 영역에 아이콘 추가 및 스타일링 */}
      <Stack 
        direction="row" 
        spacing={1} 
        alignItems="center" 
        sx={{
          borderBottom: '2.5px solid #3d5afe',
          width: 'fit-content',
        }}
      >
        <CodeIcon sx={{ fontSize: 28, color: '#3d5afe' }} />
        <Typography variant="h5" fontWeight="600">
          기술 스택
        </Typography>
      </Stack>

      <Box
        component="ul"
        sx={{
          pl: 2,
          borderRadius: 2,
          boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          py: 0.5,
          px: 1.2,
          border: '1px solid #e0e0e0',
          background: 'linear-gradient(to bottom, #fdfdfd, #f9f9f9)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #3d5afe, #536dfe, #8c9eff)',
            borderRadius: '2px 2px 0 0',
          }
        }}
      >
        {techStacks.map((tech, index) => (
          <Box
            key={index}
            component="li"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 1.5,
              py: 1.2,
              borderBottom: index < techStacks.length - 1 ? '1px dashed #e0e0e0' : 'none',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.01)',
              }
            }}
          >
            {/* 카테고리 부분 스타일링 */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.7,
                py: 0.5,
                px: 1.5,
                borderRadius: 5,
                // background: 'linear-gradient(180deg,rgb(225, 225, 225), rgb(153,153,153))',
                color: 'black',
                fontWeight: 600,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                position: 'relative',
                minWidth: 90,
                justifyContent: 'center',
                isolation: 'isolate',
                willChange: 'auto',
                border: '1px solid rgb(132, 97, 227)',
                '&::after': {
                  content: '":"',
                  position: 'absolute',
                  right: -12,
                  color: '#666',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  display: { xs: 'none', sm: 'block' }
                }
              }}
            >
              {tech.category}
            </Box>
            
            {/* 라벨 칩 */}
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.8,
                isolation: 'isolate',
                perspective: 1,
                ml: { xs: 2, sm: 0 }
              }}
            >
              {tech.labels.map((item, i) => (
                <Chip
                  key={i}
                  label={item.label}
                  color={item.color}
                  variant="outlined"
                  size="small"
                  sx={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 500,
                    backgroundColor: 'white',
                    border: `1px solid ${item.color}`,
                    mb: 0,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      mb: '3px',
                      mt: '-3px',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                      borderColor: `${item.color}`,
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

TechStack.propTypes = {
  techStacks: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string.isRequired,
      labels: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          color: PropTypes.string,
        })
      ).isRequired,
    })
  ).isRequired,
};