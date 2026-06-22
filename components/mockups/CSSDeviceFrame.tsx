'use client';

import { memo } from 'react';
import type { MockupType } from '@/types/mockup';

interface CSSDeviceFrameProps {
  type: MockupType;
  width: number;
  height: number;
  children?: React.ReactNode;
}

function CSSDeviceFrameInner({ type, width, height, children }: CSSDeviceFrameProps) {
  if (type === 'macbook') {
    const bezel = width * 0.04;
    const baseHeight = height * 0.06;
    const screenH = height - baseHeight;
    const innerRadius = width * 0.012;
    return (
      <div style={{ width, height, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            width,
            height: screenH,
            background: '#1a1a1c',
            borderRadius: `${innerRadius}px ${innerRadius}px 2px 2px`,
            padding: bezel,
            boxSizing: 'border-box',
            position: 'relative',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
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
            {children}
          </div>
        </div>
        <div
          style={{
            width,
            height: baseHeight,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(180deg, #c0c0c4 0%, #a8a8ac 40%, #909094 100%)',
              borderRadius: `0 0 ${width * 0.02}px ${width * 0.02}px`,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                bottom: '15%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '18%',
                height: '30%',
                background: 'rgba(0,0,0,0.12)',
                borderRadius: '2px 2px 0 0',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'imac') {
    const chinHeight = height * 0.08;
    const standHeight = height * 0.12;
    const bezel = width * 0.025;
    const screenH = height - chinHeight - standHeight;
    const innerRadius = width * 0.015;
    return (
      <div
        style={{ width, height, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div
          style={{
            width,
            height: screenH + chinHeight,
            background: '#1a1a1c',
            borderRadius: `${innerRadius}px ${innerRadius}px ${width * 0.008}px ${width * 0.008}px`,
            padding: `${bezel}px ${bezel}px 0`,
            boxSizing: 'border-box',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
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
            {children}
          </div>
          <div
            style={{
              height: chinHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: width * 0.04,
                height: width * 0.04,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
              }}
            />
          </div>
        </div>
        <div
          style={{
            width: width * 0.25,
            height: standHeight,
            background: 'linear-gradient(180deg, #c8c8cc 0%, #a0a0a4 100%)',
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
            marginTop: -1,
          }}
        />
        <div
          style={{
            width: width * 0.35,
            height: height * 0.015,
            background: 'linear-gradient(180deg, #909094 0%, #707074 100%)',
            borderRadius: '0 0 6px 6px',
          }}
        />
      </div>
    );
  }

  if (type === 'iphone') {
    const bezel = width * 0.05;
    const radius = width * 0.14;
    const notchW = width * 0.4;
    const notchH = height * 0.028;
    return (
      <div
        style={{
          width,
          height,
          background: 'linear-gradient(145deg, #2a2a2e 0%, #1a1a1e 50%, #2a2a2e 100%)',
          borderRadius: radius,
          padding: bezel,
          boxSizing: 'border-box',
          position: 'relative',
          boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 0 2px rgba(255,255,255,0.05)',
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
          {children}
          <div
            style={{
              position: 'absolute',
              top: '2%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: notchW,
              height: notchH,
              background: '#000',
              borderRadius: notchH / 2,
              zIndex: 10,
            }}
          />
        </div>
      </div>
    );
  }

  if (type === 'iwatch') {
    const bezel = width * 0.06;
    const radius = width * 0.22;
    return (
      <div
        style={{
          width,
          height,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -width * 0.03,
            top: '30%',
            width: width * 0.06,
            height: height * 0.15,
            background: 'linear-gradient(90deg, #3a3a3e 0%, #5a5a5e 100%)',
            borderRadius: '3px 6px 6px 3px',
            zIndex: 1,
          }}
        />
        <div
          style={{
            width,
            height,
            background: 'linear-gradient(145deg, #3a3a3e 0%, #1e1e22 50%, #3a3a3e 100%)',
            borderRadius: radius,
            padding: bezel,
            boxSizing: 'border-box',
            position: 'relative',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4), inset 0 0 2px rgba(255,255,255,0.05)',
            zIndex: 2,
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
            {children}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export const CSSDeviceFrame = memo(CSSDeviceFrameInner);
