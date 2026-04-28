'use client'

import type { ContentPiece, ContentStatus } from '@/types'

const OPTIONS: { label: string; value: ContentStatus | 'all' }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const dotColor: Record<ContentStatus | 'all', string> = {
  all:      'var(--text-muted)',
  pending:  '#fbbf24',
  approved: '#34d399',
  rejected: '#f87171',
}

interface Props {
  current: ContentStatus | 'all'
  onChange: (v: ContentStatus | 'all') => void
  items: ContentPiece[]
}

export default function Filters({ current, onChange, items }: Props) {
  const count = (v: ContentStatus | 'all') =>
    v === 'all' ? items.length : items.filter(i => i.status === v).length

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map(opt => {
        const active = current === opt.value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: active ? 'var(--accent)' : 'var(--bg-card)',
              color: active ? 'white' : 'var(--text-secondary)',
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
            }}
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-hover)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
              }
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: active ? 'rgba(255,255,255,0.8)' : dotColor[opt.value] }}
            />
            {opt.label}
            <span
              className="text-xs px-1.5 py-0.5 rounded-md tabular-nums"
              style={{
                background: active ? 'rgba(255,255,255,0.15)' : 'var(--bg-elevated)',
                color: active ? 'white' : 'var(--text-muted)',
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
