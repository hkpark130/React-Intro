import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

/**
 * ZoomableImageModal
 * - 클릭 가능한 이미지와 모달을 하나의 컴포넌트로 관리합니다.
 * - 내부 state로 open/close를 처리하여 재사용성을 높였습니다.
 * - 브라우저 창(viewport) 높이에 따라 동적으로 크기를 조절하며, 풀스크린을 사용하지 않습니다.
 * - 이미지 전체 영역을 드래그로 탐색 가능하지만, 화면 밖으로 너무 벗어나지 않도록 제한합니다.
 *
 * Props:
 *  - imageSrc: 이미지 URL (required)
 *  - altText: 이미지 대체 텍스트
 *  - caption: 이미지 아래 캡션 텍스트
 *  - sx: Box 컴포넌트 스타일 override
 */
export default function ZoomableImageModal({ imageSrc, altText, caption, sx }) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Box
        component="img"
        src={imageSrc}
        alt={altText}
        onClick={handleOpen}
        sx={{
          width: '100%',
          objectFit: 'cover',
          borderRadius: 2,
          border: '2px solid #ddd',
          cursor: 'url(/zoom-in.svg) 12 12, zoom-in',
          '&:hover': {
            filter: 'brightness(0.85)',
            '&::after': {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '2rem',
              color: 'rgba(255,255,255,0.8)'
            }
          },
          ...sx
        }}
      />
      {caption && (
        <Typography
          variant="caption"
          display="block"
          align="center"
          fontSize={16}
          color="textSecondary"
          sx={{ mt: 1 }}
        >
          {caption}
        </Typography>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        scroll="body"
        slotProps={{
          paper: {
            sx: {
              height: 'auto',
              maxHeight: '90vh',  // 브라우저 창 높이의 90% 유지
              p: 0,
              overflow: 'hidden', // 스크롤바 제거
            }
          }
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ 
            position: 'absolute', 
            top: 8, 
            right: 8, 
            zIndex: 9999,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.4)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.6)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box
          sx={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.paper'
          }}
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            wheel={{ step: 0.1 }}
            panning={{ disabled: false, velocityDisabled: false }}
            // limitToBounds={false}
            limitToBounds={true}         // 경계 제한 활성화
            boundaryRatio={0.2}          // 이미지가 화면 밖으로 나갈 수 있는 비율 (0.8 = 최대 20%만 나갈 수 있음)
            
            alignmentAnimation={{ 
              disabled: true,            // 정렬 애니메이션 비활성화
              sizeX: 0,                  // X축 정렬 크기
              sizeY: 0,                  // Y축 정렬 크기
              velocityAlignmentTime: 10 // 속도 정렬 시간
            }}
            doubleClick={{ disabled: true }}
            zoomAnimation={{ disabled: false, size: 0.1 }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    left: 8, 
                    bottom: 8, 
                    zIndex: 9999, 
                    display: 'flex', 
                    gap: 1 
                  }}
                >
                  <IconButton 
                    onClick={() => zoomIn(0.5)} 
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.4)', 
                      width: '40px', 
                      height: '40px', 
                      color: 'white', 
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } 
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => zoomOut(0.5)} 
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.4)', 
                      width: '40px', 
                      height: '40px', 
                      color: 'white', 
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } 
                    }}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => resetTransform()} 
                    sx={{ 
                      bgcolor: 'rgba(0,0,0,0.4)', 
                      width: '40px', 
                      height: '40px', 
                      color: 'white', 
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } 
                    }}
                  >
                    <RestartAltIcon />
                  </IconButton>
                </Box>
                <TransformComponent 
                  wrapperStyle={{ 
                    width: '100%', 
                    height: '100%',
                    cursor: 'grab'
                  }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <Box
                    component="img"
                    src={imageSrc}
                    alt={altText}
                    sx={{ 
                      maxWidth: '100%',
                      maxHeight: '90vh', // 기본 이미지 높이 제한
                      objectFit: 'contain',
                      '&:active': { cursor: 'grabbing' }
                    }}
                  />
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </Box>
      </Dialog>
    </>
  );
}

ZoomableImageModal.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  altText: PropTypes.string,
  caption: PropTypes.string,
  sx: PropTypes.object,
};

ZoomableImageModal.defaultProps = {
  altText: '',
  caption: '',
  sx: {},
};