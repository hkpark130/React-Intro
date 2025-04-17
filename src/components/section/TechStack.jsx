import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Chip } from '@mui/material';

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
      <Typography variant="h4" gutterBottom>
        기술 스택
      </Typography>

      <Box
        component="ul"
        sx={{
          pl: 2,
          background: 'linear-gradient(135deg, rgba(153,153,153,0.5), rgba(153,153,153,0.1))',
          borderRadius: 2,
          py: 1,
        }}
      >
        {techStacks.map((tech, index) => (
            <Typography
              key={index}
              variant="body1"
              component="div" // div로 변경
              sx={{
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                py: 0.5,
              }}
            >
              {/* 카테고리 부분 스타일링 */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  py: 0.3,
                  px: 1,
                  borderRadius: 1,
                  background: 'linear-gradient(90deg,rgb(105, 105, 105),rgb(104, 104, 104))',
                  border: 1,
                  color: 'white',
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  position: 'relative',
                  minWidth: 70,
                  justifyContent: 'center',
                  // 렌더링 격리 추가
                  isolation: 'isolate',
                  willChange: 'auto',
                  '&::after': {
                    content: '":"',
                    position: 'absolute',
                    right: -10,
                    color: '#555',
                    fontWeight: 800,
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
                  gap: 0.5,
                  // 새 렌더링 컨텍스트 생성으로 격리
                  isolation: 'isolate',
                  perspective: 1 
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
                      fontSize: '0.85rem', 
                      backgroundColor: 'white',
                      // 마진으로 변경
                      mb: 0,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        // transform 대신 마진 사용
                        mb: '2px',
                        mt: '-2px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }
                    }}
                  />
                ))}
              </Box>
            </Typography>
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