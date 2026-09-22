import { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import './zoomable-image-modal.css';

const resizeHandles = [
  ['nw', 45], ['ne', 135], ['sw', -45], ['se', -135],
  ['n', 90], ['s', -90], ['w', 0], ['e', 180],
];

function viewportBounds() {
  const viewport = window.visualViewport;
  const width = Math.min(window.innerWidth, viewport?.width || window.innerWidth);
  const height = Math.min(window.innerHeight, viewport?.height || window.innerHeight);
  const maxWidth = Math.max(1, Math.floor(width - 24));
  const maxHeight = Math.max(1, Math.floor(height - 24));

  return {
    maxWidth,
    maxHeight,
    minWidth: Math.min(300, Math.floor(maxWidth * 0.7)),
    minHeight: Math.min(200, Math.floor(maxHeight * 0.7)),
  };
}

function clampSize(size) {
  const bounds = viewportBounds();
  return {
    width: Math.max(bounds.minWidth, Math.min(bounds.maxWidth, Math.round(size.width))),
    height: Math.max(bounds.minHeight, Math.min(bounds.maxHeight, Math.round(size.height))),
  };
}

export default function ZoomableImageModal({ imageSrc, altText = '', caption = '', sx = {} }) {
  const [open, setOpen] = useState(false);
  const [modalSize, setModalSize] = useState({ width: 640, height: 420 });
  const [resizing, setResizing] = useState(false);
  const imageRef = useRef(null);
  const paperRef = useRef(null);
  const resizeRef = useRef(null);
  const dismissedResizeClickRef = useRef(null);

  const endResize = useCallback((event) => {
    const gesture = resizeRef.current;
    if (!gesture || (event?.pointerId !== undefined && event.pointerId !== gesture.pointerId)) return;

    // Clear first: releasing capture also dispatches lostpointercapture.
    resizeRef.current = null;
    if (gesture.target.hasPointerCapture?.(gesture.pointerId)) {
      gesture.target.releasePointerCapture(gesture.pointerId);
    }
    setResizing(false);
  }, []);

  const handleOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const dismissed = dismissedResizeClickRef.current;
    if (event.type === 'click' && event.detail > 0 && dismissed
      && event.nativeEvent.pointerId === dismissed.pointerId
      && event.nativeEvent.pointerType === dismissed.pointerType) {
      // Chrome may retarget the held touch's click after its dialog disappears.
      dismissedResizeClickRef.current = null;
      return;
    }
    imageRef.current?.focus({ preventScroll: true });
    const bounds = viewportBounds();
    const image = imageRef.current;
    setModalSize(clampSize({
      width: Math.min(image?.naturalWidth ? image.naturalWidth + 48 : 640, bounds.maxWidth * 0.9),
      height: Math.min(image?.naturalHeight ? image.naturalHeight + 96 : 420, bounds.maxHeight * 0.9),
    }));
    setOpen(true);
  };

  const handleClose = () => {
    if (resizeRef.current) {
      const { pointerId, pointerType } = resizeRef.current;
      dismissedResizeClickRef.current = { pointerId, pointerType };
    }
    endResize();
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;

    const viewport = window.visualViewport;
    const handleViewportResize = () => {
      endResize();
      setModalSize(current => clampSize(current));
    };
    window.addEventListener('resize', handleViewportResize);
    viewport?.addEventListener('resize', handleViewportResize);

    return () => {
      endResize();
      window.removeEventListener('resize', handleViewportResize);
      viewport?.removeEventListener('resize', handleViewportResize);
    };
  }, [open, endResize]);

  const beginResize = (direction, event) => {
    if (event.button !== 0 || event.isPrimary === false) return;
    event.preventDefault();
    event.stopPropagation();
    endResize();
    const rectangle = paperRef.current?.getBoundingClientRect();
    resizeRef.current = {
      direction,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      target: event.currentTarget,
      x: event.clientX,
      y: event.clientY,
      width: rectangle?.width || modalSize.width,
      height: rectangle?.height || modalSize.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setResizing(true);
  };

  const moveResize = (event) => {
    const gesture = resizeRef.current;
    if (!gesture || event.pointerId !== gesture.pointerId) return;
    event.preventDefault();
    event.stopPropagation();

    // The dialog stays centered, so each edge moves by half its size change.
    const dx = (event.clientX - gesture.x) * 2;
    const dy = (event.clientY - gesture.y) * 2;
    const { direction } = gesture;
    setModalSize(clampSize({
      width: gesture.width + (direction.includes('e') ? dx : direction.includes('w') ? -dx : 0),
      height: gesture.height + (direction.includes('s') ? dy : direction.includes('n') ? -dy : 0),
    }));
  };

  const keyboardResize = (direction, event) => {
    const step = event.shiftKey ? 40 : 10;
    const dx = event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
    const dy = event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
    if ((!dx || !/[ew]/.test(direction)) && (!dy || !/[ns]/.test(direction))) return;
    event.preventDefault();
    event.stopPropagation();
    setModalSize(current => clampSize({
      width: current.width + (direction.includes('e') ? dx : direction.includes('w') ? -dx : 0),
      height: current.height + (direction.includes('s') ? dy : direction.includes('n') ? -dy : 0),
    }));
  };

  return (
    <>
      <Box
        ref={imageRef}
        component="img"
        className="zoomable-image-trigger"
        src={imageSrc}
        alt={altText}
        role="button"
        tabIndex={0}
        aria-label={`${altText || '구성도'} 크게 보기`}
        onPointerDown={(event) => {
          // A new gesture is valid even when the browser reuses a pointer ID.
          if (dismissedResizeClickRef.current?.pointerId === event.pointerId) dismissedResizeClickRef.current = null;
        }}
        onClick={handleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') handleOpen(event);
        }}
        sx={sx}
      />
      {caption && <Typography component="p" variant="caption" className="zoomable-image-caption">{caption}</Typography>}

      <Dialog
        className="zoomable-image-dialog"
        open={open}
        onClose={handleClose}
        maxWidth={false}
        aria-label={`${altText || '이미지'} 확대`}
        slotProps={{
          paper: {
            ref: paperRef,
            className: 'zoomable-image-paper',
            style: { width: modalSize.width, height: modalSize.height },
          },
        }}
      >
        <IconButton aria-label="이미지 닫기" onClick={handleClose} className="zoomable-image-close">
          <CloseIcon />
        </IconButton>
        <TransformWrapper
          key={imageSrc}
          initialScale={1}
          minScale={0.5}
          maxScale={16}
          wheel={{ step: 0.1 }}
          panning={{ disabled: resizing, velocityDisabled: true }}
          limitToBounds
          alignmentAnimation={{ disabled: true }}
          doubleClick={{ disabled: true }}
          zoomAnimation={{ disabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="zoomable-image-stage">
                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img className="zoomable-image-content" src={imageSrc} alt={altText} draggable={false} />
                </TransformComponent>
              </div>
              <div className="zoomable-image-controls" role="toolbar" aria-label="이미지 확대 제어">
                <IconButton aria-label="이미지 확대" onClick={() => zoomIn(0.5, 0)}><ZoomInIcon /></IconButton>
                <IconButton aria-label="이미지 축소" onClick={() => zoomOut(0.5, 0)}><ZoomOutIcon /></IconButton>
                <IconButton aria-label="이미지 배율 초기화" onClick={() => resetTransform(0)}><RestartAltIcon /></IconButton>
              </div>
            </>
          )}
        </TransformWrapper>
        {resizeHandles.map(([direction, angle]) => (
          <IconButton
            key={direction}
            className={`zoomable-image-resize zoomable-image-resize--${direction}`}
            aria-label={`resize-${direction}`}
            data-resize-direction={direction}
            onPointerDown={event => beginResize(direction, event)}
            onPointerMove={moveResize}
            onPointerUp={endResize}
            onPointerCancel={endResize}
            onLostPointerCapture={endResize}
            onKeyDown={event => keyboardResize(direction, event)}
            disableRipple
          >
            <ArrowBackIosIcon sx={{ transform: `rotate(${angle}deg)` }} />
          </IconButton>
        ))}
      </Dialog>
    </>
  );
}

ZoomableImageModal.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  altText: PropTypes.string,
  caption: PropTypes.string,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};
