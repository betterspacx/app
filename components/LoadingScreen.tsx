// Created by konlyzx (2026) - Loading spinner component with animated gradient effects
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import { motion } from 'motion/react';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: '#0b0b0c' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <style>{`
        .bf-spinner {
          width: 3em;
          height: 3em;
          border-radius: 50%;
          border: 2px solid #2a2a2e;
          box-shadow:
            -10px -10px 10px rgba(99,89,248,0.4),
            0px -10px 10px 0px rgba(156,50,226,0.4),
            10px -10px 10px rgba(243,104,150,0.4),
            10px 0 10px rgba(255,11,11,0.3),
            10px 10px 10px 0px rgba(255,85,0,0.3),
            0 10px 10px 0px rgba(255,149,0,0.3),
            -10px 10px 10px 0px rgba(255,183,0,0.3);
          animation: bf-spin 0.7s linear infinite;
        }
        .bf-spinnerin {
          border: 2px solid #2a2a2e;
          width: 1.5em;
          height: 1.5em;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        @keyframes bf-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="relative">
        <div className="bf-spinner" />
        <div className="bf-spinnerin" />
      </div>
    </motion.div>
  );
}
