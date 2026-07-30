'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { signInWithEmail, signInWithGithub, sendPasswordReset } from '@/lib/supabase/auth-service';
import { EyeIcon, GithubIcon, ArrowRight01Icon, Loading03Icon, Mail01Icon, LockPasswordIcon } from 'hugeicons-react';
import Link from 'next/link';

const features = [
  { title: 'Pixel-perfect screenshots', desc: 'Beautiful mockups for your landing page, docs, or social media.' },
  { title: 'Smart templates', desc: 'Start fast with 100+ professionally designed templates.' },
  { title: 'Animation presets', desc: 'Add motion to your screenshots with keyframe-based animations.' },
  { title: 'Video export', desc: 'Export smooth walkthroughs with FFmpeg WASM — no server needed.' },
];

export default function LoginPage() {
  const [redirect, setRedirect] = useState('/');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get('redirect') || '/');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await signInWithEmail(email, password);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    window.location.href = redirect;
  };

  const handleGithub = async () => {
    setError('');
    setLoading(true);
    const result = await signInWithGithub(redirect);
    if (!result.ok && result.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setError('');
    setLoading(true);
    const result = await sendPasswordReset(email);
    if (!result.ok) {
      setError(result.error || 'Failed to send reset email');
    } else {
      setResetSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-rose-500/[0.04] pointer-events-none" />
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-rose-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <a href="/" className="inline-flex items-center gap-2.5 mb-10">
            <img src="/logo.svg" alt="" className="w-8 h-8" />
            <span className="text-lg font-bold text-white tracking-tight">Better Flow</span>
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            Beautiful screenshots,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-rose-200">styled in seconds</span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-md mb-12">
            Transform your screenshots into stunning mockups with customizable backgrounds, devices, and smooth animations.
          </p>
        </motion.div>

        <div className="space-y-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="flex items-start gap-3.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/50 mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium text-zinc-200">{f.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 text-xs text-zinc-600"
        >
          No credit card required · Free plan includes 3 projects
        </motion.p>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden text-center mb-8">
            <a href="/" className="inline-flex items-center gap-2 mb-6">
              <img src="/logo.svg" alt="" className="w-7 h-7" />
              <span className="text-lg font-bold text-white tracking-tight">Better Flow</span>
            </a>
            <h1 className="text-xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-zinc-400 text-sm">Sign in to your account</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2.5">
                <Mail01Icon className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
            {resetSent && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 text-sm text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center gap-2.5">
                <Mail01Icon className="w-4 h-4 shrink-0" />
                Password reset email sent. Check your inbox.
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail01Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all text-sm" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <div className="relative">
                  <LockPasswordIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={handleResetPassword}
                  className="text-xs text-zinc-500 hover:text-indigo-400 transition-colors cursor-pointer">Forgot password?</button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? (
                  <Loading03Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <><span>Sign In</span><ArrowRight01Icon className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-zinc-900/60 px-3 text-zinc-500">Or</span></div>
            </div>

            <button type="button" onClick={handleGithub} disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer">
              <GithubIcon className="w-4 h-4" />
              Continue with GitHub
            </button>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Don&apos;t have an account?{' '}
              <Link href={redirect !== '/' ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup'} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-600 lg:hidden">
            No credit card required · Free plan includes 3 projects
          </p>
        </motion.div>
      </div>
    </div>
  );
}
