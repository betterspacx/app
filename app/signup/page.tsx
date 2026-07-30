'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { signUpWithEmail } from '@/lib/supabase/auth-service';
import {
  Mail01Icon, LockPasswordIcon, EyeIcon, UserIcon,
  ArrowRight01Icon, Loading03Icon, CheckmarkCircle02Icon, LockIcon
} from 'hugeicons-react';
import Link from 'next/link';

export default function SignupPage() {
  const [redirect, setRedirect] = useState('/');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirect(params.get('redirect') || '/');
  }, []);

  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    const checks = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/, pwd.length >= 8];
    const score = checks.filter((c) => (typeof c === 'boolean' ? c : c.test(pwd))).length;
    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (score <= 3) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    if (score <= 4) return { label: 'Good', color: 'bg-blue-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await signUpWithEmail(email, password, name);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    window.location.href = redirect;
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
            Start creating in<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-rose-200">seconds, not hours</span>
          </h1>
          <p className="text-zinc-400 text-base leading-relaxed max-w-md mb-12">
            Join thousands of designers and developers who use Better Flow to create stunning screenshot mockups.
          </p>
        </motion.div>

        <div className="space-y-6">
          {[
            { title: 'No design skills needed', desc: 'Professional-quality mockups in just a few clicks.' },
            { title: 'Works in your browser', desc: 'Nothing to install. Everything runs locally.' },
            { title: 'Export anything', desc: 'PNG, WebP, MP4, GIF — for social, docs, or portfolios.' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="flex items-start gap-3.5"
            >
              <CheckmarkCircle02Icon className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-zinc-200">{f.title}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-14 flex items-center gap-2 text-xs text-zinc-600"
        >
          <LockIcon className="w-3.5 h-3.5" />
          Your data never leaves your browser
        </motion.div>
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
            <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-zinc-400 text-sm">Start creating beautiful screenshots</p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2.5">
                <Mail01Icon className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input id="name" type="text" autoComplete="name" placeholder="Your name" value={name}
                    onChange={(e) => setName(e.target.value)} required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all text-sm" />
                </div>
              </div>
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
                  <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password}
                    onChange={(e) => setPassword(e.target.value)} required minLength={8}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: strength.width }}
                        transition={{ duration: 0.3 }}
                        className={`h-full rounded-full ${strength.color}`}
                      />
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{strength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <LockPasswordIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input id="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8}
                    className="w-full pl-10 pr-10 py-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all text-sm" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                    {showConfirm ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? (
                  <Loading03Icon className="w-4 h-4 animate-spin" />
                ) : (
                  <><span>Create Account</span><ArrowRight01Icon className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Link href={redirect !== '/' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-zinc-600 lg:hidden">
            Your data never leaves your browser
          </p>
        </motion.div>
      </div>
    </div>
  );
}
