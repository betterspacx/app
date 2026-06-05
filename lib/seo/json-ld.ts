/**
 * Root-level JSON-LD structured data for the entire site.
 * Added to the root layout so every page inherits Organization and WebSite schema.
 */

// Modified by konlyzx (2026) - Removed BETTER_AUTH_URL fallback and hardcoded site URL
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function getOrganizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Better Flow",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/icon`,
      width: 32,
      height: 32,
    },
    sameAs: [
      "https://github.com/KartikLabhshetwar/screenshot-studio",
      "https://x.com/konlyzx_",
    ],
    description:
      "Free, open-source screenshot editor with backgrounds, browser mockups, 3D effects, animations, and video export.",
  };
}

export function getWebSiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Better Flow",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/features?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getSoftwareApplicationSchema() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${BASE_URL}/#application`,
    name: "Better Flow",
    url: BASE_URL,
    applicationCategory: "DesignApplication",
    applicationSubCategory: "Screenshot Editor",
    operatingSystem: "Any (Web Browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
    },
    featureList: [
      "100+ gradient backgrounds",
      "Safari and Chrome browser mockups (light & dark)",
      "Device frames (Arc, Polaroid, glass, outline, border)",
      "3D perspective transforms",
      "20+ animation presets with keyframe editor",
      "Video export (MP4, WebM, GIF)",
      "Text and image overlays",
      "High-res export up to 5x scale",
      "No signup required",
      "No watermarks",
      "Open source (Apache 2.0)",
    ],
  };
}

export function getRootJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      getOrganizationSchema(),
      getWebSiteSchema(),
      getSoftwareApplicationSchema(),
    ],
  };
}
