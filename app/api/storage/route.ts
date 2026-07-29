import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createR2Client } from '@/lib/r2-storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const r2 = createR2Client();

interface AuthUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  providerId?: string;
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;

    return {
      uid: data.user.id,
      email: data.user.email ?? undefined,
      displayName: data.user.user_metadata?.display_name as string ?? undefined,
      providerId: data.user.app_metadata?.provider ?? undefined,
    };
  } catch {
    return null;
  }
}

function isAuthorized(uid: string, key: string): boolean {
  return key.startsWith(`users/${uid}/`);
}

function isProfileKey(key: string): boolean {
  return key.endsWith('/profile.json');
}

function isProjectsIndexKey(key: string): boolean {
  return key.endsWith('/projects-index.json');
}

function createDefaultProfile(user: AuthUser): string {
  const provider = user.providerId === 'github' ? 'github' : 'email';
  const username = user.displayName || user.email?.split('@')[0] || `user_${user.uid.slice(0, 6)}`;
  const profile = {
    uid: user.uid,
    username,
    provider,
    createdAt: new Date().toISOString(),
    cloudStorageEnabled: true,
  };
  return JSON.stringify(profile, null, 2);
}

function createDefaultProjectsIndex(): string {
  return JSON.stringify({ projects: [] });
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const listPrefix = request.nextUrl.searchParams.get('list');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 400 });
  }

  const user = await verifyToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (listPrefix) {
    if (!listPrefix.startsWith(`users/${user.uid}/`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    try {
      const keys = await r2.listFiles(listPrefix);
      return NextResponse.json({ keys });
    } catch (err) {
      console.error('R2 list error:', err);
      return NextResponse.json({ error: 'Storage error' }, { status: 500 });
    }
  }

  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }

  if (!isAuthorized(user.uid, key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    let data = await r2.downloadFileAsText(key);
    if (data === null) {
      if (isProfileKey(key)) {
        data = createDefaultProfile(user);
        await r2.uploadFile(key, data, 'application/json');
        return NextResponse.json({ data, created: true });
      }
      if (isProjectsIndexKey(key)) {
        data = createDefaultProjectsIndex();
        return NextResponse.json({ data, created: true });
      }
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error('R2 read error:', err);
    return NextResponse.json({ error: 'Storage error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 400 });
  }

  let body: { key: string; data: string; contentType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { key, data, contentType } = body;
  if (!key || data === undefined) {
    return NextResponse.json({ error: 'Missing key or data' }, { status: 400 });
  }

  const user = await verifyToken(token);
  if (!user || !isAuthorized(user.uid, key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await r2.uploadFile(key, data, contentType);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('R2 write error:', err);
    return NextResponse.json({ error: 'Storage error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key');
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!key || !token) {
    return NextResponse.json({ error: 'Missing key or authorization' }, { status: 400 });
  }

  const user = await verifyToken(token);
  if (!user || !isAuthorized(user.uid, key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await r2.deleteFile(key);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('R2 delete error:', err);
    return NextResponse.json({ error: 'Storage error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
