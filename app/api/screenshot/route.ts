// Modified by konlyzx (2026) - Replaced external screen-shot.xyz API with Playwright + Chromium (local/serverless)
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { NextRequest, NextResponse } from 'next/server'
import { getCachedScreenshot, cacheScreenshot, normalizeUrl, invalidateCache } from '@/lib/screenshot-cache'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 60

async function getBrowser() {
  // Try local Playwright/Chromium first (installed via `npx playwright install chromium`)
  try {
    const { chromium: playwright } = await import('playwright-core')
    const browser = await playwright.launch({ headless: true })
    return browser
  } catch {
    // Fallback: @sparticuz/chromium for serverless (Vercel/AWS Lambda)
    try {
      const mod = await import('@sparticuz/chromium')
      const chromium = (mod.default || mod) as { args: string[]; executablePath: (input?: string) => Promise<string> }
      const { chromium: playwright } = await import('playwright-core')
      const browser = await playwright.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
      return browser
    } catch {
      return null
    }
  }
}

async function captureViaPlaywright(
  url: string,
  deviceType: 'desktop' | 'mobile' = 'desktop'
): Promise<{ screenshot: string; strategy: string }> {
  const browser = await getBrowser()
  if (!browser) {
    throw new Error('playwright_unavailable')
  }

  try {
    const page = await browser.newPage()

    if (deviceType === 'mobile') {
      await page.setViewportSize({ width: 375, height: 667 })
    } else {
      await page.setViewportSize({ width: 1920, height: 1080 })
    }

    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 55000,
    })

    // Extra settle time for JS-rendered content
    await page.waitForTimeout(2000)

    const buffer = await page.screenshot({
      type: 'png',
      fullPage: false,
    })

    return {
      screenshot: Buffer.from(buffer).toString('base64'),
      strategy: 'playwright-chromium',
    }
  } finally {
    await browser.close()
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString()
          }
        }
      )
    }

    const body = await request.json()
    const { url, forceRefresh, deviceType = 'desktop' } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    if (deviceType && !['desktop', 'mobile'].includes(deviceType)) {
      return NextResponse.json(
        { error: 'deviceType must be either "desktop" or "mobile"' },
        { status: 400 }
      )
    }

    let validUrl: URL
    try {
      validUrl = new URL(url)
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        return NextResponse.json(
          { error: 'URL must use http or https protocol' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    const normalizedUrl = normalizeUrl(validUrl.toString())
    const cacheKey = `${normalizedUrl}:${deviceType}`

    if (forceRefresh) {
      try {
        await invalidateCache(normalizedUrl)
      } catch {
        // ignore cache invalidation errors
      }
    }

    if (!forceRefresh) {
      try {
        const cachedScreenshot = await getCachedScreenshot(cacheKey)
        if (cachedScreenshot) {
          return NextResponse.json({
            screenshot: cachedScreenshot,
            url: normalizedUrl,
            cached: true,
            deviceType,
          })
        }
      } catch {
        // ignore cache errors
      }
    }

    const { screenshot, strategy } = await captureViaPlaywright(normalizedUrl, deviceType)

    try {
      await cacheScreenshot(cacheKey, screenshot)
    } catch {
      // ignore cache errors
    }

    return NextResponse.json({
      screenshot,
      url: normalizedUrl,
      cached: false,
      strategy,
      deviceType,
    })
  } catch (error) {
    console.error('Screenshot error:', error)

    if (error instanceof Error) {
      const msg = error.message

      if (msg === 'playwright_unavailable' || msg.includes('playwright')) {
        return NextResponse.json(
          { error: 'Playwright/Chromium is not available. Install browser binaries: npx playwright install chromium' },
          { status: 503 }
        )
      }

      if (msg.includes('timeout') || msg.includes('Timeout') || msg.includes('Navigation timeout')) {
        return NextResponse.json(
          { error: 'Website took too long to load. Please try again or try a different URL.' },
          { status: 408 }
        )
      }

      if (msg.includes('ERR_NAME_NOT_RESOLVED') ||
          msg.includes('ERR_CONNECTION_REFUSED') ||
          msg.includes('ERR_CONNECTION_TIMED_OUT') ||
          msg.includes('NS_ERROR_UNKNOWN_HOST') ||
          msg.includes('net::ERR')) {
        return NextResponse.json(
          { error: 'Could not connect to the website. Please check the URL and try again.' },
          { status: 400 }
        )
      }

      if (msg.includes('certificate') || msg.includes('SSL') || msg.includes('ERR_CERT')) {
        return NextResponse.json(
          { error: 'Website has SSL certificate issues. The screenshot may be incomplete.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to capture screenshot. Please try again or contact support if the issue persists.' },
      { status: 500 }
    )
  }
}
