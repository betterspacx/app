// Modified by konlyzx (2026) - Removed hardcoded ACCOUNT_ID and CDN URL; using environment variables
// Created by konlyzx (2026) - API route for direct video upload from Chrome extension
// Receives video data and uploads to R2, avoiding CORS issues
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { NextRequest, NextResponse } from 'next/server';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const R2_API_TOKEN = process.env.R2_API_TOKEN || '';  // cfut_xxx format

export async function POST(request: NextRequest) {
  try {
    // Get video data as base64
    const { videoBase64, fileName } = await request.json();

    if (!videoBase64) {
      return NextResponse.json(
        { error: 'Missing video data' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Generate unique filename
    const finalFileName = fileName || `recording-${Date.now()}.webm`;
    const r2Key = `backgrounds/videos/${Date.now()}-${finalFileName}`;

    // Convert base64 to buffer
    const buffer = Buffer.from(videoBase64, 'base64');

    // Upload to R2 using Cloudflare API
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${encodeURIComponent(r2Key)}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${R2_API_TOKEN}`,
        'Content-Type': 'video/webm',
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`R2 upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    // Generate public URL
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000';
    const fileUrl = `${cdnUrl}/${r2Key}`;

    return NextResponse.json(
      { success: true, fileUrl },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Upload video error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: (error as Error).message },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
