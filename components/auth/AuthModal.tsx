'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, updateProfile, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signInWithGithub, signInWithEmail, signUpWithEmail, signOut, getUserProfile, saveUserProfile } from '@/lib/auth-service';
import type { UserProfile } from '@/lib/r2-storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });
    return unsub;
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260, mass: 1 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <motion.div layout transition={{ type: 'spring', damping: 24, stiffness: 220 }}>
              {user && profile ? (
                <ProfileCard user={user} profile={profile} onProfileUpdate={setProfile} onClose={onClose} />
              ) : user ? (
                <ProfileCard user={user} profile={null} onProfileUpdate={setProfile} onClose={onClose} />
              ) : (
                <AuthCard onClose={onClose} />
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ProfileCard({ user, profile, onProfileUpdate, onClose }: {
  user: User;
  profile: UserProfile | null;
  onProfileUpdate: (p: UserProfile) => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = React.useState(false);
  const [displayName, setDisplayName] = React.useState(user.displayName || '');
  const [username, setUsername] = React.useState(profile?.username || '');
  const [photoURL, setPhotoURL] = React.useState(user.photoURL || '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      await updateProfile(user, { displayName, photoURL: photoURL || undefined });
      if (profile && username !== profile.username) {
        const updated = { ...profile, username };
        await saveUserProfile(updated);
        onProfileUpdate(updated);
      }
      setEditing(false);
    } catch {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mx-4 rounded-2xl border border-border/40 bg-background shadow-2xl overflow-hidden"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-border/40">
            <button onClick={() => setEditing(false)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <p className="text-sm font-semibold text-foreground">Edit Profile</p>
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">{error}</div>
          )}

          <div className="flex flex-col items-center gap-3">
            {photoURL ? (
              <img src={photoURL} alt="" className="w-16 h-16 rounded-full ring-2 ring-primary/30 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 ring-2 ring-primary/30 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-xl border border-border/40 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-9 px-3 text-sm rounded-xl border border-border/40 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Photo URL</label>
              <input
                type="url"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full h-9 px-3 text-sm rounded-xl border border-border/40 bg-muted/30 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 h-9 text-sm font-medium rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-colors text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-9 text-sm font-semibold text-white rounded-lg transition-all bg-[linear-gradient(110deg,#c9d4ff_0%,#e0d4ff_45%,#f5d4e8_100%)] hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="mx-4 rounded-2xl border border-border/40 bg-background shadow-2xl overflow-hidden"
    >
      <div className="p-6 space-y-5">
        <div className="flex flex-col items-center gap-3">
          {user.photoURL ? (
            <img src={user.photoURL} alt="" className="w-16 h-16 rounded-full ring-2 ring-primary/30" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 ring-2 ring-primary/30 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 1 0-16 0" />
              </svg>
            </div>
          )}
          <div className="text-center">
            {profile && (
              <p className="text-xs text-muted-foreground/60">@{profile.username}</p>
            )}
            <p className="text-sm font-semibold text-foreground">{user.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setEditing(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-all text-sm text-left cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M17 12a5 5 0 0 1-5 5m-5-5a5 5 0 0 1 5-5" />
              <path d="M12 7V3m0 18v-4" />
              <path d="M7 12H3m18 0h-4" />
            </svg>
            <span className="text-foreground">Edit Profile</span>
          </button>
          <button
            onClick={async () => {
              await signOut();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/40 bg-muted/30 hover:bg-destructive/10 hover:border-destructive/30 transition-all text-sm text-left cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span className="text-foreground">Sign Out</span>
          </button>
        </div>

        <button onClick={onClose} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          Close
        </button>
      </div>
    </motion.div>
  );
}

function AuthCard({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    setError('');
  }, [tab]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = tab === 'login'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password, name);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGithub();
      if (!result.ok) {
        if (result.error) setError(result.error);
        return;
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-4 rounded-2xl border border-border/40 bg-background shadow-2xl overflow-hidden">
      <div className="flex border-b border-border/40">
        <button
          onClick={() => setTab('login')}
          className={cn(
            'flex-1 py-3.5 text-sm font-medium transition-colors relative cursor-pointer',
            tab === 'login' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Sign In
          {tab === 'login' && (
            <motion.div layoutId="auth-tab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          onClick={() => setTab('signup')}
          className={cn(
            'flex-1 py-3.5 text-sm font-medium transition-colors relative cursor-pointer',
            tab === 'signup' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Sign Up
          {tab === 'signup' && (
            <motion.div layoutId="auth-tab" className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      <motion.div className="p-6" layout transition={{ type: 'spring', damping: 24, stiffness: 220 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 1 }}
          >
            <div className="space-y-4">
              <button
                onClick={handleGitHubLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-[#1a1a2e] hover:bg-[#2a2a4e] border border-[#3c3c5e] transition-all text-sm font-medium text-white disabled:opacity-50 cursor-pointer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Continue with GitHub
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>

              <form onSubmit={handleEmailAuth} className="space-y-3">
                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">{error}</div>
                )}
                {tab === 'signup' && (
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-name" className="text-xs text-muted-foreground">Name</Label>
                    <Input id="auth-name" type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" required />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="auth-email" className="text-xs text-muted-foreground">Email</Label>
                  <Input id="auth-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-sm" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="auth-password" className="text-xs text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} className="h-9 text-sm pr-9" required minLength={8} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer" tabIndex={-1}>
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" x2="23" y1="1" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-9 text-sm font-semibold text-white rounded-lg transition-all bg-[linear-gradient(110deg,#c9d4ff_0%,#e0d4ff_45%,#f5d4e8_100%)] hover:opacity-90">
                  {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </form>

              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
