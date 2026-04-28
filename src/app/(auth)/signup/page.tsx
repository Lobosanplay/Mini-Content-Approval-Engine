'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { upsertProfile } from '@/lib/api/content'
import toast from 'react-hot-toast'
import { Loader2, Mail, Lock, Zap } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        // Auto-create creator profile
        await upsertProfile(data.user.id, email)
        // Also set full_name if provided
        if (fullName.trim()) {
          await supabase
            .from('user_profiles')
            .update({ full_name: fullName.trim() })
            .eq('user_id', data.user.id)
        }
      }
      toast.success('Account created! Welcome to Frameloop.')
      router.push('/dashboard')
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="glass rounded-2xl p-8 animate-scale-in">
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
        Create account
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
        Already have one?{' '}
        <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            FULL NAME
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            style={inputStyle}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            EMAIL <span className="text-rose-400">*</span>
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
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            PASSWORD <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        <p className="text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
          You'll be signed up as a <strong style={{ color: 'var(--text-secondary)' }}>Creator</strong>. Admins can be promoted via the SQL script.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
          style={{
            background: loading ? 'rgba(99,102,241,0.5)' : 'var(--accent)',
            color: 'white',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)' }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          Create account
        </button>
      </form>
    </div>
  )
}
