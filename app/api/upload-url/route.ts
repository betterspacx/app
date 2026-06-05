// Modified by konlyzx (2026) - Removed hardcoded R2 endpoint and CDN URL; using environment variables
// Created by konlyzx (2026) - API route for generating R2 presigned upload URLs for Chrome extension
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize R2 client for presigned URL generation
// Using custom domain from environment variable to avoid CORS issues
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType } = await request.json();

    // Validate input
    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName and contentType' },
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

    // Define the path within the bucket using hierarchical structure
    const r2Key = `backgrounds/videos/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'betterflow-storage',
      Key: r2Key,
      ContentType: contentType,
    });

    // Generate presigned URL that expires in 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    // Public URL from CDN for the editor to load the video directly
    // Using custom domain from environment variable
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000';
    const fileUrl = `${cdnUrl}/${r2Key}`;

    return NextResponse.json(
      { uploadUrl, fileUrl },
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
    console.error('R2 Presign Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
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
