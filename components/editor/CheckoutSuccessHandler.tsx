'use client';

import * as React from 'react';
import { clearAuthCache } from '@/lib/supabase/auth-service';

export function CheckoutSuccessHandler() {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSuccess = params.get('checkout') === 'success';

    if (isSuccess) {
      // Clear subscription cache so next fetch gets fresh data
      clearAuthCache();

      // Notify useSubscription to refetch
      window.dispatchEvent(new Event('checkout-success'));

      // Clean the URL without triggering a reload
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      url.searchParams.delete('checkoutId');
      url.searchParams.delete('customer_session_token');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return null;
}
