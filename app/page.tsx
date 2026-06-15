import type { Metadata } from "next";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata: Metadata = {
  title: "Better Flow - Free Screenshot Editor & Mockup Maker Online",
  description:
    "Better Flow is a free screenshot editor online. Add gradient backgrounds, Safari & Chrome browser mockups, shadows, 3D effects, and animations to any screenshot. Export as PNG, JPG, WebP, MP4, WebM, or GIF. No signup, no watermarks. Best free alternative to Pika Style and Shots.so.",
  keywords: [
    "screenshot editor online free",
    "free screenshot editor",
    "screenshot beautifier online",
    "screenshot mockup maker",
    "better flow",
    "pika style alternative",
    "shots.so alternative",
    "screely alternative",
    "browser mockup generator",
    "safari browser mockup",
    "chrome browser mockup",
    "browser frame screenshot",
    "add background to screenshot free",
    "screenshot with gradient background",
    "screenshot animation maker",
    "screenshot to video converter",
    "mac window screenshot mockup",
    "product screenshot tool",
    "SaaS screenshot maker",
    "free design tool no signup",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Better Flow - Free Screenshot Editor & Mockup Maker Online",
    description:
      "Transform screenshots into professional graphics. 100+ backgrounds, browser mockups, 3D effects, animations, video export. Free, no signup, no watermarks.",
    url: "/",
  },
};

export default async function EditorPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <EditorLayout />
      </Suspense>
    </ErrorBoundary>
  );
}
