/**
 * API route for server-side image compression with Sharp
 * Accepts FormData with raw image blob, returns optimized image blob.
 *
 * Sharp produces significantly smaller files than browser canvas.toBlob():
 * - JPEG: MozJPEG encoder (10-15% smaller than browser JPEG at same quality)
 * - WebP: libwebp encoder (better than browser WebP)
 * - PNG: zlib + adaptive filtering (optimal lossless compression)
 */

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { QUALITY_PRESETS, type ExportFormat, type QualityPreset } from '@/lib/export/types';

function isValidFormat(format: string): format is ExportFormat {
  return format === 'png' || format === 'jpeg' || format === 'webp';
}

function isValidQualityPreset(preset: string): preset is QualityPreset {
  return preset === 'high' || preset === 'medium' || preset === 'low';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const format = formData.get('format') as string | null;
    const qualityPreset = formData.get('qualityPreset') as string | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'Missing image file' },
        { status: 400 }
      );
    }

    if (!format || !isValidFormat(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be "png", "jpeg", or "webp"' },
        { status: 400 }
      );
    }

    if (!qualityPreset || !isValidQualityPreset(qualityPreset)) {
      return NextResponse.json(
        { error: 'Invalid qualityPreset. Must be "high", "medium", or "low"' },
        { status: 400 }
      );
    }

    const inputBuffer = Buffer.from(await imageFile.arrayBuffer());
    const qualitySettings = QUALITY_PRESETS[qualityPreset];

    const sharpInstance = sharp(inputBuffer);
    let outputBuffer: Buffer;
    let mimeType: string;

    if (format === 'jpeg') {
      outputBuffer = await sharpInstance
        .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten alpha to white (JPEG has no transparency)
        .jpeg({
          quality: qualitySettings.jpeg,
          mozjpeg: true, // MozJPEG produces ~10-15% smaller files than standard JPEG
        })
        .toBuffer();
      mimeType = 'image/jpeg';
    } else if (format === 'webp') {
      outputBuffer = await sharpInstance
        .webp({
          quality: qualitySettings.webp,
          effort: 4, // balanced speed vs compression (0=fastest, 6=slowest)
        })
        .toBuffer();
      mimeType = 'image/webp';
    } else {
      outputBuffer = await sharpInstance
        .png({
          compressionLevel: qualitySettings.pngCompression,
          adaptiveFiltering: true,
        })
        .toBuffer();
      mimeType = 'image/png';
    }

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
}
