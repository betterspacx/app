'use client';

import { useEffect } from 'react';

export default function DesktopCallbackPage() {
  useEffect(() => {
    // Notify the Tauri main window that GitHub OAuth completed
    type TauriWindow = Window & {
      __TAURI__?: { event: { emit: (event: string) => Promise<void> } };
    };
    const tauri = (window as TauriWindow).__TAURI__;
    if (tauri?.event) {
      tauri.event.emit('desktop-auth-complete').catch(() => {});
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-3 max-w-sm">
        <div className="flex justify-center">
          <svg
            className="h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold">Signed in successfully</h1>
        <p className="text-sm text-muted-foreground">
          You can close this window and return to the Better Flow desktop app.
        </p>
      </div>
    </div>
  );
}
