import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

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
  // width/height를 숫자(px)로 보관하여 연산을 쉽게 처리
  const [modalSize, setModalSize] = useState({ width: 640, height: 420 });
  const imageBoxRef = useRef(null); // 이미지 컨테이너 참조 추가
  const resizingRef = useRef(null); // { dir, startX, startY, startW, startH }
  
  const handleOpen = (e) => {
    // 이벤트 객체가 있는 경우 (클릭에 의한 호출)
    if (e) {
      e.preventDefault(); // 기본 동작 방지
      e.stopPropagation(); // 버블링 방지
    }
    setOpen(true);
  };
  
  const handleClose = () => {
    setOpen(false);
  };

  // 이미지 로드 시 모달 사이즈를 조정하는 함수
  const handleImageLoad = () => {
    if (imageBoxRef.current && imageBoxRef.current.naturalWidth) {
      const img = imageBoxRef.current;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      const maxW = Math.floor(window.innerWidth * 0.85);
      const maxH = Math.floor(window.innerHeight * 0.85);
      setModalSize({
        width: Math.min(naturalWidth + 100, maxW),
        height: Math.min(naturalHeight + 100, maxH)
      });
    }
  };

  // 리사이즈 시작/진행/종료 처리
  const beginResize = (dir) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const pointer = e.touches?.[0] || e;
    resizingRef.current = {
      dir,
      startX: pointer.clientX,
      startY: pointer.clientY,
      startW: modalSize.width,
      startH: modalSize.height,
    };
    // 전역 리스너 등록
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endResize, { once: true });
  };

  const endResize = () => {
    window.removeEventListener('pointermove', onPointerMove);
    resizingRef.current = null;
  };

  const onPointerMove = (e) => {
    const state = resizingRef.current;
    if (!state) return;
    const { dir, startX, startY, startW, startH } = state;
    const pointer = e.touches?.[0] || e;
    const dx = pointer.clientX - startX;
    const dy = pointer.clientY - startY;

    let nextW = startW;
    let nextH = startH;
    if (dir.includes('e')) nextW = startW + dx;
    if (dir.includes('w')) nextW = startW - dx;
    if (dir.includes('s')) nextH = startH + dy;
    if (dir.includes('n')) nextH = startH - dy;

    const maxW = Math.floor(window.innerWidth * 0.85);
    const maxH = Math.floor(window.innerHeight * 0.85);
    const minW = 300;
    const minH = 200;
    nextW = Math.max(minW, Math.min(maxW, Math.floor(nextW)));
    nextH = Math.max(minH, Math.min(maxH, Math.floor(nextH)));
    setModalSize({ width: nextW, height: nextH });
  };

  // 클릭 이벤트 직접 바인딩을 위한 useEffect
  useEffect(() => {
    const imageElement = imageBoxRef.current;
    if (imageElement) {      
      // 클릭 이벤트 핸들러 등록
      const clickHandler = (e) => handleOpen(e);
      imageElement.addEventListener('click', clickHandler);
      handleImageLoad();
      
      // 클린업 함수
      return () => {
        if (imageElement) {
          imageElement.removeEventListener('click', clickHandler);
        }
      };
    }
  }, []);  // 컴포넌트 마운트시 한 번만 실행

  return (
    <>
      <Box
        ref={imageBoxRef} // 참조 추가
        component="img"
        src={imageSrc}
        alt={altText}
        // onClick={handleOpen} - 이벤트 리스너로 대체
        sx={{
          maxWidth: 'calc(100%)',
          width: 'auto', // 원래 이미지 크기 유지
          height: 'auto', // 비율 유지
          margin: '2px', // 상하좌우 여백 추가
          objectFit: 'contain',
          borderRadius: 2,
          border: '2px solid #ddd',
          cursor: 'zoom-in',
          boxSizing: 'border-box',
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
        maxWidth={false} // 자체 maxWidth 사용
        scroll="body"
        slotProps={{
          paper: {
            sx: {
      width: `${modalSize.width}px`,   // 동적으로 계산된 너비
      height: `${modalSize.height}px`,  // 동적으로 계산된 높이
              maxWidth: '85vw', // 브라우저 창 너비의 85%로 제한
              maxHeight: '85vh', // 브라우저 창 높이의 85%로 조정
              minWidth: '300px',  // 최소 크기 설정
              minHeight: '200px', // 최소 크기 설정
              p: 1,
              overflow: 'hidden', // 스크롤바 제거
              margin: '20px', // 모달 주변 여백 추가
              boxSizing: 'content-box', // 패딩과 보더가 너비에 추가됨
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
          {/* 리사이즈 핸들 오버레이 */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 9998,
              pointerEvents: 'none',
            }}
          >
            {/* Corner icon handles (use rotated ArrowBackIosIcon) */}
            {[
              { dir: 'nw', pos: { top: -2, left: -2 },  rotate: '45deg',  cursor: 'nwse-resize' },
              { dir: 'ne', pos: { top: -2, right: -2 }, rotate: '135deg', cursor: 'nesw-resize' },
              { dir: 'sw', pos: { bottom: -2, left: -2 }, rotate: '-45deg', cursor: 'nesw-resize' },
              { dir: 'se', pos: { bottom: -2, right: -2 }, rotate: '-135deg', cursor: 'nwse-resize' },
            ].map(({ dir, pos, rotate, cursor }) => (
              <IconButton
                key={`corner-${dir}`}
                onPointerDown={beginResize(dir)}
                role="separator"
                aria-label={`resize-${dir}`}
                size="small"
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  minWidth: 20,
                  minHeight: 20,
                  p: 0,
                  ...pos,
                  pointerEvents: 'auto',
                  color: 'rgba(0,0,0,0.55)',
                  // border: '1px solid rgba(255,255,255,0.8)',
                  borderRadius: 0.75,
                  cursor,
                  fontSize: 16,
                }}
              >
                <ArrowBackIosIcon fontSize="small" sx={{ transform: `rotate(${rotate})` }} />
              </IconButton>
            ))}

            {/* Edge arrow handles (centers) - use rotated ArrowBackIosIcon */}
            {[
              { dir: 'n',  pos: { top: -1, left: '50%', transform: 'translateX(-50%)' }, rotate: '90deg',  cursor: 'ns-resize' },
              { dir: 's',  pos: { bottom: -1, left: '50%', transform: 'translateX(-50%)' }, rotate: '-90deg', cursor: 'ns-resize' },
              { dir: 'w',  pos: { left: -1, top: '50%', transform: 'translateY(-50%)' }, rotate: '0deg',   cursor: 'ew-resize' },
              { dir: 'e',  pos: { right: -1, top: '50%', transform: 'translateY(-50%)' }, rotate: '180deg', cursor: 'ew-resize' },
            ].map(({ dir, pos, rotate, cursor }) => (
              <IconButton
                key={`edge-${dir}`}
                onPointerDown={beginResize(dir)}
                role="separator"
                aria-label={`resize-${dir}`}
                size="small"
                sx={{
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  minWidth: 20,
                  minHeight: 20,
                  p: 0,
                  ...pos,
                  pointerEvents: 'auto',
                  color: 'rgba(0,0,0,0.55)',
                  // border: '1px solid rgba(255,255,255,0.8)',
                  borderRadius: 0.75,
                  cursor,
                  fontSize: 16,
                }}
              >
                <ArrowBackIosIcon fontSize="small" sx={{ transform: `rotate(${rotate})` }} />
              </IconButton>
            ))}
          </Box>
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            wheel={{ step: 0.1 }}
            panning={{ disabled: false, velocityDisabled: false }}
            limitToBounds={true}         // 경계 제한 활성화
            boundaryRatio={0.8}          // 경계 비율 조정 - 더 많은 이동 허용
            
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
                      width: 'auto',   // 원래 이미지 크기 유지
                      height: 'auto',   // 원래 이미지 크기 유지
                      maxWidth: '100%',
                      maxHeight: '75vh',
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