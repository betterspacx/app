"use client";

import { useState, useEffect, useCallback } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("");

  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isDesktopFlow = params.get("desktop") === "1";
    const callback = params.get("callback") ?? "";
    setIsDesktop(isDesktopFlow);
    setCallbackUrl(callback);

    // Auto-trigger GitHub login for desktop flow
    if (isDesktopFlow && callback) {
      setAutoLoggingIn(true);
    }
  }, []);

  // Auto-trigger GitHub when autoLoggingIn becomes true
  useEffect(() => {
    if (autoLoggingIn && callbackUrl) {
      const timer = setTimeout(() => {
        handleGithub();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoLoggingIn, callbackUrl, handleGithub]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (callbackUrl) {
        const token = await result.user.getIdToken();
        window.location.href = `${callbackUrl}?token=${encodeURIComponent(token)}`;
      } else if (isDesktop) {
        const token = await result.user.getIdToken();
        window.location.href = `/auth/desktop-callback?idtoken=${encodeURIComponent(token)}`;
      } else {
        window.location.href = "/";
      }
    } catch {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  const handleGithub = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GithubAuthProvider();
      provider.addScope("read:user");
      provider.addScope("user:email");
      const result = await signInWithPopup(auth, provider);

      if (callbackUrl) {
        // Desktop deep-link flow: send GitHub access token so the desktop app
        // can sign in with signInWithCredential (avoids custom token backend).
        const credential = GithubAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;
        if (accessToken) {
          window.location.href = `${callbackUrl}?github_token=${encodeURIComponent(accessToken)}`;
        } else {
          // Fallback to Firebase ID token if GitHub token unavailable
          const token = await result.user.getIdToken();
          window.location.href = `${callbackUrl}?token=${encodeURIComponent(token)}`;
        }
      } else if (isDesktop) {
        const token = await result.user.getIdToken();
        window.location.href = `/auth/desktop-callback?idtoken=${encodeURIComponent(token)}`;
      } else {
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("popup-closed-by-user") && !msg.includes("cancelled-popup-request")) {
        setError("GitHub sign-in failed. Try again.");
      }
      setLoading(false);
      setAutoLoggingIn(false);
    }
  }, [callbackUrl, isDesktop]);

  // Desktop auto-login UI - minimal loading screen
  if (autoLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825-.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </div>
            <CardTitle>Connecting to Better Flow</CardTitle>
            <CardDescription>Opening GitHub authentication...</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md mb-4">
                {error}
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoLoggingIn(false)}
                    className="w-full"
                  >
                    Show manual login
                  </Button>
                </div>
              </div>
            )}
            {!error && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Waiting for authorization...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normal login UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={handleGithub}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225-.69.825-.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              Continue with GitHub
            </Button>

            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
