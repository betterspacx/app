'use client';

import { useEffect, useState } from 'react';
import { createCheckout } from '@/lib/supabase/auth-service';
import { supabase } from '@/lib/supabase/client';

export default function CheckoutPage() {
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'unauthenticated'>('loading');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setStatus('unauthenticated');
        return;
      }
      setStatus('redirecting');
      const isDev = window.location.hostname === 'localhost';
      createCheckout('cloud', isDev).then((result) => {
        if (result?.url) {
          window.location.href = result.url;
        }
      });
    });
  }, []);

  if (status === 'unauthenticated') {
    window.location.href = '/login?redirect=/checkout';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b]">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">
          {status === 'redirecting'
            ? window.location.hostname === 'localhost'
              ? 'Dev mode — simulating checkout...'
              : 'Redirecting to checkout...'
            : 'Checking session...'}
        </p>
      </div>
    </div>
  );
}
