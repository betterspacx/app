'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useImageStore } from '@/lib/store';
import { getMockupDefinition } from '@/lib/constants/mockups';
import { CSSDeviceFrame } from './CSSDeviceFrame';
import type { Mockup } from '@/types/mockup';

interface HTMLMockupRendererProps {
  mockup: Mockup;
  canvasWidth: number;
  canvasHeight: number;
}

export function HTMLMockupRenderer({ mockup, canvasWidth, canvasHeight }: HTMLMockupRendererProps) {
  const { uploadedImageUrl, updateMockup } = useImageStore();
  const definition = getMockupDefinition(mockup.definitionId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!definition || !mockup.isVisible) return null;

  const mockupWidth = mockup.size;
  const mockupHeight = mockup.size / definition.aspectRatio;

  // Handle drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - mockup.position.x,
        y: e.clientY - mockup.position.y,
      });
    },
    [mockup.position.x, mockup.position.y]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      updateMockup(mockup.id, { position: { x: newX, y: newY } });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, mockup.id, updateMockup]);

  return (
    <div
      ref={containerRef}
      data-mockup-id={mockup.id}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${mockup.position.x}px`,
        top: `${mockup.position.y}px`,
        width: `${mockupWidth}px`,
        height: `${mockupHeight}px`,
        transform: `rotate(${mockup.rotation}deg)`,
        transformOrigin: 'center center',
        opacity: mockup.opacity,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      <CSSDeviceFrame type={definition.type} width={mockupWidth} height={mockupHeight}>
        {uploadedImageUrl && (
          <img
            src={uploadedImageUrl}
            alt="User content"
            draggable={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: mockup.imageFit || 'cover',
              display: 'block',
            }}
          />
        )}
      </CSSDeviceFrame>
    </div>
  );
}
