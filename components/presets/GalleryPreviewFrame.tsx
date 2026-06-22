'use client';

import { memo } from 'react';

export type GalleryDeviceType = 'macbook' | 'imac' | 'iphone' | 'browser' | 'none';

interface GalleryPreviewFrameProps {
  type: GalleryDeviceType;
  width: number;
  height: number;
  imageSrc: string;
}

function GalleryPreviewFrameInner({ type, width, height, imageSrc }: GalleryPreviewFrameProps) {
  if (type === 'macbook') {
    const bezel = Math.max(2, width * 0.025);
    const baseHeight = height * 0.05;
    const screenH = height - baseHeight;
    const radius = Math.max(2, width * 0.008);
    return (
      <div style={{ width, height, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width,
            height: screenH,
            background: '#1a1a1c',
            borderRadius: `${radius}px ${radius}px 2px 2px`,
            padding: bezel,
            boxSizing: 'border-box',
            boxShadow: '0 1px 4px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: '#000',
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img src={imageSrc} alt="" className="w-full h-full object-cover" draggable={false} />
          </div>
        </div>
        <div
          style={{
            width: width * 1.08,
            height: baseHeight,
            background: 'linear-gradient(180deg, #d4d4d8 0%, #b0b0b4 100%)',
            borderRadius: `0 0 ${width * 0.015}px ${width * 0.015}px`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        />
      </div>
    );
  }

  if (type === 'imac') {
    const bezel = Math.max(2, width * 0.02);
    const chin = height * 0.07;
    const stand = height * 0.1;
    const screenH = height - chin - stand;
    const radius = Math.max(2, width * 0.01);
    return (
      <div style={{ width, height, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width,
            height: screenH + chin,
            background: '#1a1a1c',
            borderRadius: `${radius}px ${radius}px 4px 4px`,
            padding: `${bezel}px ${bezel}px 0`,
            boxSizing: 'border-box',
            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}
        >
          <div
            style={{
              width: '100%',
              height: screenH - bezel,
              background: '#000',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <img src={imageSrc} alt="" className="w-full h-full object-cover" draggable={false} />
          </div>
          <div style={{ height: chin, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: width * 0.03,
                height: width * 0.03,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: width * 0.22,
            height: stand,
            background: 'linear-gradient(180deg, #d4d4d8 0%, #a8a8ac 100%)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
          }}
        />
      </div>
    );
  }

  if (type === 'iphone') {
    const bezel = Math.max(2, width * 0.03);
    const radius = Math.max(6, width * 0.1);
    return (
      <div
        style={{
          width,
          height,
          background: 'linear-gradient(145deg, #2a2a2e 0%, #1a1a1e 50%, #2a2a2e 100%)',
          borderRadius: radius,
          padding: bezel,
          boxSizing: 'border-box',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 0 2px rgba(255,255,255,0.05)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#000',
            borderRadius: radius - bezel,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img src={imageSrc} alt="" className="w-full h-full object-cover" draggable={false} />
          <div
            style={{
              position: 'absolute',
              top: '2%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40%',
              height: '4%',
              background: '#000',
              borderRadius: 999,
              zIndex: 10,
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'browser') {
    const barHeight = Math.max(14, height * 0.07);
    const radius = Math.max(6, width * 0.04);
    return (
      <div
        style={{
          width,
          height,
          background: '#1a1a1e',
          borderRadius: radius,
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: barHeight,
            background: 'linear-gradient(180deg, #2c2c30 0%, #1e1e22 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: width * 0.015,
            padding: `0 ${width * 0.02}px`,
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{ width: barHeight * 0.28, height: barHeight * 0.28, borderRadius: '50%', background: '#ff5f57' }}
          />
          <div
            style={{ width: barHeight * 0.28, height: barHeight * 0.28, borderRadius: '50%', background: '#febc2e' }}
          />
          <div
            style={{ width: barHeight * 0.28, height: barHeight * 0.28, borderRadius: '50%', background: '#28c840' }}
          />
          <div
            style={{
              flex: 1,
              height: '55%',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 4,
              marginLeft: width * 0.01,
            }}
          />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <img src={imageSrc} alt="" className="w-full h-full object-cover" draggable={false} />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height,
        borderRadius: Math.max(4, width * 0.02),
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        position: 'relative',
      }}
    >
      <img src={imageSrc} alt="" className="w-full h-full object-cover" draggable={false} />
    </div>
  );
}

export const GalleryPreviewFrame = memo(GalleryPreviewFrameInner);
