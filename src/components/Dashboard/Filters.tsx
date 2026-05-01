'use client'

import type { ContentPiece, ContentStatus } from '@/types'

const OPTIONS: { label: string; value: ContentStatus | 'all' }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const dotStyle: Record<ContentStatus | 'all', { color: string; glow?: string }> = {
  all:      { color: 'var(--text-muted)' },
  pending:  { color: '#fbbf24', glow: '0 0 6px rgba(251,191,36,0.6)' },
  approved: { color: '#34d399', glow: '0 0 6px rgba(52,211,153,0.6)' },
  rejected: { color: '#f87171', glow: '0 0 6px rgba(248,113,113,0.6)' },
}

interface Props {
  current:  ContentStatus | 'all'
  onChange: (v: ContentStatus | 'all') => void
  items:    ContentPiece[]
}

export default function Filters({ current, onChange, items }: Props) {
  const count = (v: ContentStatus | 'all') =>
    v === 'all' ? items.length : items.filter(i => i.status === v).length

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt, idx) => {
        const active = current === opt.value
        const dot    = dotStyle[opt.value]

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={{
              animationDelay:    `${idx * 40}ms`,
              background:        active ? 'var(--accent-dim)' : 'var(--bg-card)',
              color:             active ? 'var(--accent-hover)' : 'var(--text-secondary)',
              border:            `1px solid ${active ? 'var(--border-accent)' : 'var(--border)'}`,
              boxShadow:         active ? '0 0 20px rgba(99,102,241,0.12)' : 'none',
              transform:         active ? 'translateY(-1px)' : 'none',
            }}
            onMouseEnter={e => {
              if (!active) {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = 'var(--border-hover)'
                b.style.color       = 'var(--text-primary)'
                b.style.transform   = 'translateY(-1px)'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                const b = e.currentTarget as HTMLButtonElement
                b.style.borderColor = 'var(--border)'
                b.style.color       = 'var(--text-secondary)'
                b.style.transform   = 'none'
              }
            }}
          >
            {/* Status dot */}
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: active ? 'var(--accent-hover)' : dot.color,
                boxShadow:  active ? undefined : dot.glow,
              }}
            />

            {opt.label}

            {/* Count pill */}
            <span
              className="text-xs px-1.5 py-0.5 rounded-md tabular-nums"
              style={{
                background: active ? 'rgba(99,102,241,0.2)' : 'var(--bg-elevated)',
                color:      active ? 'var(--accent-hover)'  : 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {count(opt.value)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
