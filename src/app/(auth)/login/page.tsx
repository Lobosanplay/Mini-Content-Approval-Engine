'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
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
    <div className="glass rounded-2xl p-8 animate-scale-in">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
          <Zap size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Frameloop
        </span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
        Sign in
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        New here?{' '}
        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            EMAIL
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@agency.com"
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            PASSWORD
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all mt-2"
          style={{
            background: loading ? 'rgba(99,102,241,0.5)' : 'var(--accent)',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  )
}
