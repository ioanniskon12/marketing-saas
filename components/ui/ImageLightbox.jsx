/**
 * Image Lightbox Component
 *
 * Full-screen image preview with zoom and navigation
 */

'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${props => props.theme.zIndex.modal + 10};
  opacity: ${props => props.$visible ? 1 : 0};
  pointer-events: ${props => props.$visible ? 'all' : 'none'};
  transition: opacity 0.3s ease;
`;

const LightboxContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LightboxImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  transform: scale(${props => props.$zoom});
  transition: transform 0.3s ease;
  cursor: ${props => props.$zoom > 1 ? 'grab' : 'zoom-in'};

  &:active {
    cursor: ${props => props.$zoom > 1 ? 'grabbing' : 'zoom-in'};
  }
`;

const LightboxControls = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${props => props.theme.borderRadius.full};
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export default function ImageLightbox({ src, alt, visible, onClose }) {
  const [zoom, setZoom] = useState(1);

  // Reset zoom when image changes
  useEffect(() => {
    if (visible) {
      setZoom(1);
    }
  }, [src, visible]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && visible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [visible, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.click();
  };

  const handleImageClick = () => {
    if (zoom === 1) {
      handleZoomIn();
    }
  };

  return (
    <LightboxOverlay $visible={visible} onClick={onClose}>
      <LightboxContent onClick={(e) => e.stopPropagation()}>
        <LightboxImage
          src={src}
          alt={alt}
          $zoom={zoom}
          onClick={handleImageClick}
        />

        <LightboxControls>
          <ControlButton onClick={handleZoomIn} title="Zoom in">
            <ZoomIn size={20} />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} title="Zoom out">
            <ZoomOut size={20} />
          </ControlButton>
          <ControlButton onClick={handleDownload} title="Download">
            <Download size={20} />
          </ControlButton>
          <ControlButton onClick={onClose} title="Close">
            <X size={20} />
          </ControlButton>
        </LightboxControls>
      </LightboxContent>
    </LightboxOverlay>
  );
}
