'use client';

import { useEffect } from 'react';

const DEFERRED_FONTS = [
  { family: 'Poppins', weights: '100..900', variable: '--font-poppins' },
  { family: 'Space+Grotesk', weights: '300..700', variable: '--font-space-grotesk' },
  { family: 'Outfit', weights: '100..900', variable: '--font-outfit' },
  { family: 'Plus+Jakarta+Sans', weights: '200..800', variable: '--font-plus-jakarta-sans' },
  { family: 'DM+Sans', weights: '100..900', variable: '--font-dm-sans' },
  { family: 'Sora', weights: '100..800', variable: '--font-sora' },
  { family: 'Manrope', weights: '200..800', variable: '--font-manrope' },
  { family: 'Raleway', weights: '100..900', variable: '--font-raleway' },
  { family: 'Montserrat', weights: '100..900', variable: '--font-montserrat' },
  { family: 'Lexend', weights: '100..900', variable: '--font-lexend' },
  { family: 'Work+Sans', weights: '100..900', variable: '--font-work-sans' },
  { family: 'Urbanist', weights: '100..900', variable: '--font-urbanist' },
  { family: 'Albert+Sans', weights: '100..900', variable: '--font-albert-sans' },
  { family: 'Oswald', weights: '200..700', variable: '--font-oswald' },
  { family: 'Bebas+Neue', weights: '400', variable: '--font-bebas-neue' },
  { family: 'Righteous', weights: '400', variable: '--font-righteous' },
  { family: 'Playfair+Display', weights: '400..900', variable: '--font-playfair-display' },
  { family: 'Lora', weights: '400..700', variable: '--font-lora' },
  { family: 'Libre+Baskerville', weights: '400;700', variable: '--font-libre-baskerville' },
  { family: 'Caveat', weights: '400..700', variable: '--font-caveat' },
  { family: 'Pacifico', weights: '400', variable: '--font-pacifico' },
  { family: 'Dancing+Script', weights: '400..700', variable: '--font-dancing-script' },
  { family: 'JetBrains+Mono', weights: '100..800', variable: '--font-jetbrains-mono' },
];

function buildGoogleFontsUrl(): string {
  const families = DEFERRED_FONTS.map(
    (f) => `family=${f.family}:wght@${f.weights}`
  ).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

function buildCssVariables(): string {
  const rules = DEFERRED_FONTS.map(
    (f) => `${f.variable}: '${f.family.replace('+', ' ')}', sans-serif;`
  ).join('\n');
  return `:root {\n${rules}\n}`;
}

export function DeferredFonts() {
  useEffect(() => {
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = 'anonymous';

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = buildGoogleFontsUrl();

    const styleEl = document.createElement('style');
    styleEl.textContent = buildCssVariables();

    document.head.append(preconnect, preconnectGstatic, fontLink, styleEl);
  }, []);

  return null;
}
