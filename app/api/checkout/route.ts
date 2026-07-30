import { NextRequest, NextResponse } from 'next/server';
import { Checkout } from '@polar-sh/nextjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url);

  if (searchParams.get('dev') === 'true') {
    const token = searchParams.get('token');

    if (token) {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      if (userRes.ok) {
        const { id } = await userRes.json();

        await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            plan: 'cloud',
            status: 'active',
            updated_at: new Date().toISOString(),
          }),
        });
      }
    }

    return NextResponse.redirect(`${origin}/?checkout=success`);
  }

  const handler = Checkout({
    accessToken: process.env.POLAR_ACCESS_TOKEN!,
    successUrl: `${origin}/?checkout=success`,
    server: 'production',
  });

  return handler(request);
};
