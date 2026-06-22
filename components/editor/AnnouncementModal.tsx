'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useImageStore } from '@/lib/store';

const STORAGE_KEY = 'spacx-announcement-browser-mockups-v1';
const COVER_IMAGE = '/announcements/browsers/announcement1.png';

export function AnnouncementModal() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        const t = setTimeout(() => setOpen(true), 600);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  const dismiss = React.useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
  }, []);

  const exploreTemplates = React.useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
    const { setShowTemplates } = useImageStore.getState();
    setShowTemplates(true);
    setTimeout(() => {
      const el = document.getElementById('preset-category-Browser');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
            onClick={dismiss}
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280, mass: 1 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[61] w-full max-w-[440px] px-4"
          >
            <div className="relative flex flex-col w-full overflow-hidden rounded-[28px] border border-white/10 shadow-2xl select-none">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url(${COVER_IMAGE})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(40px) brightness(0.35)',
                  transform: 'scale(1.1)',
                }}
              />

              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <img
                  src={COVER_IMAGE}
                  alt="Browser Mockups"
                  loading="lazy"
                  draggable={false}
                  className="block w-full h-full object-cover scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              </div>

              <div className="relative flex flex-col items-center text-center px-7 pb-7 pt-5 space-y-4">
                <div className="flex flex-col items-center space-y-3">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(168,85,247,0.9))',
                      color: 'white',
                    }}
                  >
                    New Drop
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">Browser Mockups</h2>
                  <p className="text-sm text-white/55 leading-relaxed max-w-[320px]">
                    Frame your screenshots with Safari, Chrome and their dark versions. Templates with shadows, blur and
                    3D objects.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={exploreTemplates}
                  className="w-full rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Explore templates
                </button>

                <div className="flex flex-col items-center gap-2 pt-1">
                  <span className="text-[11px] text-white/30">Available now</span>
                  <div className="flex items-center gap-2">
                    {['Safari', 'Chrome', 'Dark', 'Light'].map((label) => (
                      <span
                        key={label}
                        className="rounded-md bg-white/8 px-2 py-0.5 text-[10px] font-medium text-white/50"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
