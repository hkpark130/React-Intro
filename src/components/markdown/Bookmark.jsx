import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Paper, 
  Typography, 
  Box, 
  IconButton, 
  Tooltip, 
  Skeleton
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

/**
 * 북마크 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.url - 북마크 URL
 * @param {string} [props.title] - 북마크 제목 (옵션)
 * @param {string} [props.description] - 북마크 설명 (옵션)
 * @param {string} [props.imageUrl] - 북마크 이미지 URL (옵션)
 */
const Bookmark = ({ url, title, description, imageUrl }) => {
  const [bookmarkData, setBookmarkData] = useState({
    title: title || '',
    description: description || '',
    imageUrl: imageUrl || '',
    isLoading: true
  });

  // URL 정보 추출 및 파비콘 설정
  useEffect(() => {
    const run = async () => {
      try {
        const urlObj = new URL(url);
        if (!title || !description || !imageUrl) {
          setBookmarkData(prev => ({ ...prev, isLoading: true }));
          // SSR 서비스가 같은 도메인 프록시 뒤에 배치된 것을 가정하여 절대 경로 사용하지 않음
          const { data } = await axios.get(`/seo/preview`, {
            params: { url },
            timeout: 6000
          });
          setBookmarkData(prev => ({
            ...prev,
            title: title || data?.title || urlObj.hostname,
            description: description || data?.description || '북마크 설명이 제공되지 않았습니다.',
            imageUrl: imageUrl || data?.image || '',
            isLoading: false
          }));
        } else {
          setBookmarkData(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Bookmark preview error:', error?.message || error);
        setBookmarkData(prev => ({
          ...prev,
          title: title || '유효하지 않은 URL',
          description: description || '올바른 URL을 입력해주세요.',
          isLoading: false
        }));
      }
    };
    run();
  }, [url, title, description, imageUrl]);

  // 파비콘 URL 생성
  const getFaviconUrl = () => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch (error) {
      return '';
    }
  };

  // 링크로 이동하는 함수
  const handleBookmarkClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Paper
      elevation={1}
      onClick={handleBookmarkClick}
      sx={{
        width: '100%',
        maxWidth: '700px',
        my: 0,
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box sx={{ display: 'flex', p: 0 }}>
        {/* 북마크 내용 */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            p: 2, 
            flex: 1,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {/* 파비콘 */}
            <Box 
              component="img" 
              src={getFaviconUrl()}
              alt="favicon"
              sx={{ 
                width: 16, 
                height: 16, 
                mr: 1,
                display: 'block'
              }}
            />
            
            {/* URL 도메인 */}
            {bookmarkData.isLoading ? (
              <Skeleton width="40%" />
            ) : (
              <Typography 
                variant="caption" 
                color="text.secondary"
                noWrap
                sx={{ opacity: 0.7 }}
              >
                {(() => {
                  try {
                    return new URL(url).hostname;
                  } catch (error) {
                    return 'Invalid URL';
                  }
                })()}
              </Typography>
            )}
          </Box>
          
          {/* 제목 */}
          {bookmarkData.isLoading ? (
            <Skeleton width="80%" height={28} />
          ) : (
            <Typography 
              variant="subtitle1" 
              component="h3" 
              sx={{ 
                fontWeight: 'bold',
                mb: 0.5,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {bookmarkData.title}
            </Typography>
          )}
          
          {/* 설명 */}
          {bookmarkData.isLoading ? (
            <Skeleton width="100%" height={20} />
          ) : (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 1,
                fontSize: '0.875rem',
                lineHeight: 1.3
              }}
            >
              {bookmarkData.description}
            </Typography>
          )}
          
          {/* 액션 버튼들 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
            <Tooltip title="새 탭에서 열기">
              <IconButton 
                size="small"
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()} // 버블링 방지
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* 이미지 */}
        {imageUrl && (
          <Box
            sx={{
              width: 220,
              minHeight: 140,
              display: { xs: 'none', sm: 'block' },
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src={imageUrl}
              alt="북마크 썸네일"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)'
              }}
            />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default Bookmark;