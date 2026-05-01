'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, Zap, ArrowRight, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState<string | null>(null)
  const router   = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-scale-in">

      {/* ── Auth card ─────────────────────────────── */}
      <div className="auth-card rounded-2xl p-8 relative overflow-hidden">

        {/* Subtle inner glow at the top edge */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.5) 50%, transparent 100%)' }}
        />
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 100% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)',
          }}
        />

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 mb-9">
          <div
            className="animate-pulse-glow w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #5d60ee 0%, #7577f5 60%, #a5b4fc 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}
          >
            <Zap size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span
            className="text-xl font-bold tracking-tight text-gradient"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Frameloop
          </span>
        </div>

        {/* ── Heading ── */}
        <div className="mb-8">
          <h1
            className="text-[2rem] font-bold mb-1.5 leading-[1.1]"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
          >
            Welcome back
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold transition-all duration-150 hover:underline"
              style={{ color: 'var(--accent-hover)' }}
            >
              Sign up free →
            </Link>
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label
              className="block text-[11px] font-semibold mb-2 tracking-[0.12em] uppercase"
              style={{ color: focused === 'email' ? 'var(--accent-hover)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', transition: 'color 0.18s ease' }}
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: focused === 'email' ? 'var(--accent-hover)' : 'var(--text-muted)' }}
              />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                placeholder="you@agency.com"
                className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              className="block text-[11px] font-semibold mb-2 tracking-[0.12em] uppercase"
              style={{ color: focused === 'password' ? 'var(--accent-hover)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)', transition: 'color 0.18s ease' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-150"
                style={{ color: focused === 'password' ? 'var(--accent-hover)' : 'var(--text-muted)' }}
              />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                required
                placeholder="••••••••"
                className="input-field w-full rounded-xl pl-10 pr-4 py-3 text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-semibold text-white mt-1"
          >
            {loading
              ? <Loader2 size={15} className="animate-spin" />
              : <ArrowRight size={15} strokeWidth={2.5} />
            }
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SECURED BY</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* ── Security badges ── */}
        <div className="flex items-center justify-center gap-5">
          {[
            { label: 'SOC 2', icon: '🔒' },
            { label: 'GDPR',  icon: '🛡️' },
            { label: 'SSL',   icon: '🔐' },
          ].map(({ label, icon }, i) => (
            <div
              key={label}
              className="animate-slide-up flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{
                animationDelay: `${i * 60 + 200}ms`,
                animationFillMode: 'both',
                opacity: 0,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}
            >
              <span className="text-xs">{icon}</span>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom edge glow */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.25) 50%, transparent 100%)' }}
        />
      </div>

      {/* ── Footer note ── */}
      <p
        className="text-center text-[11px] mt-5 animate-fade-in"
        style={{ color: 'var(--text-muted)', animationDelay: '400ms', animationFillMode: 'both', opacity: 0 }}
      >
        By signing in you agree to our{' '}
        <span style={{ color: 'var(--text-secondary)' }}>Terms of Service</span>
        {' '}and{' '}
        <span style={{ color: 'var(--text-secondary)' }}>Privacy Policy</span>
      </p>
    </div>
  )
}
