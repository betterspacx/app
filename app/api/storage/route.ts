import { NextRequest, NextResponse } from 'next/server';
import { createR2Client } from '@/lib/r2-storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const r2 = createR2Client();

interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  providerId?: string;
}

async function verifyToken(idToken: string): Promise<FirebaseUser | null> {
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.users?.length) return null;
    const u = data.users[0];
    const providerInfo = u.providerUserInfo?.[0];
    return {
      uid: u.localId as string,
      email: u.email,
      displayName: u.displayName || providerInfo?.displayName,
      photoUrl: u.photoUrl || providerInfo?.photoUrl,
      providerId: providerInfo?.providerId,
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

function createDefaultProfile(user: FirebaseUser): string {
  const provider = user.providerId === 'github.com' ? 'github' : 'email';
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
