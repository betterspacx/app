import type { Metadata, Viewport } from 'next';
import { Inter, Fira_Code } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/lib/query-client';
import { GlobalDropZone } from '@/components/GlobalDropZone';
import { getRootJsonLd } from '@/lib/seo/json-ld';
import { DeferredFonts } from '@/components/ui/DeferredFonts';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const firaCode = Fira_Code({
  variable: '--font-fira-code',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const fontVariables = [inter.variable, firaCode.variable].join(' ');

export const metadata: Metadata = {
  title: {
    default: 'Better Flow - Free Screenshot Editor & Mockup Maker Online',
    template: '%s | Better Flow',
  },
  // Add your Google Search Console verification code here
  // Get it from: https://search.google.com/search-console
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    // yandex: "your-yandex-verification",
    // bing: "your-bing-verification",
  },
  description:
    'Better Flow is a free screenshot editor and mockup maker online. Add gradient backgrounds, Safari/Chrome browser frames, shadows, 3D effects, and animations to your screenshots. Export as PNG, JPG, WebP, MP4, or GIF. No signup, no watermarks, unlimited exports. Free alternative to Pika Style and Shots.so.',
  keywords: [
    'screenshot editor online free',
    'free screenshot editor',
    'screenshot beautifier',
    'screenshot mockup maker',
    'better flow',
    'betterflow',
    'pika style alternative',
    'shots.so alternative',
    'screely alternative',
    'browser mockup generator',
    'safari browser mockup',
    'chrome browser mockup',
    'browser frame screenshot',
    'screenshot wrapper tool',
    'add background to screenshot free',
    'screenshot with gradient background',
    'mac window screenshot mockup',
    'social media graphics maker',
    'image background editor',
    'screenshot animation maker',
    'product screenshot tool',
    'SaaS screenshot maker',
    'app screenshot maker',
    'developer portfolio images',
    'screenshot to video converter',
    'free design tool no signup',
    'beautify screenshots online',
    'free online screenshot beautifier',
    'screenshot border radius editor',
  ],
  authors: [{ name: 'Better Flow', url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000' }],
  creator: 'Better Flow',
  publisher: 'Better Flow',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Better Flow',
    title: 'Better Flow - Free Screenshot Editor & Mockup Maker Online',
    description:
      'Transform screenshots into professional graphics instantly. 100+ backgrounds, browser mockups, animations, 3D effects, video export. Free, no signup, no watermarks.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og.jpg`,
        width: 1200,
        height: 630,
        alt: 'Better Flow - Transform Screenshots into Professional Graphics',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Better Flow - Free Screenshot Editor & Mockup Maker',
    description:
      'Transform screenshots into professional graphics instantly. Browser mockups, backgrounds, animations, 3D effects, video export. Free, no signup.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/og.jpg`],
    creator: '@konlyzx_',
    site: '@konlyzx_',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon',
    apple: '/apple-icon',
  },
  manifest: '/manifest.json',
  category: 'Design Tools',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootJsonLd = getRootJsonLd();

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="msvalidate.01" content="A3B8CB50BBD78710971A13FA3EE1E544" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(rootJsonLd) }} />
      </head>
      <body className={`${fontVariables} antialiased`}>
        <DeferredFonts />
        <QueryProvider>
          <GlobalDropZone>{children}</GlobalDropZone>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
