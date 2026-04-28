import type { ContentStatus } from '@/types'

export function getClientUrl(clientToken: string): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return `${base}/client/${clientToken}`
}

export function statusLabel(status: ContentStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function statusColor(status: ContentStatus): string {
  switch (status) {
    case 'approved': return 'text-emerald-400'
    case 'rejected': return 'text-rose-400'
    default:         return 'text-amber-400'
  }
}

export function statusBg(status: ContentStatus): string {
  switch (status) {
    case 'approved': return 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30'
    case 'rejected': return 'bg-rose-500/15 text-rose-400 ring-rose-500/30'
    default:         return 'bg-amber-500/15 text-amber-400 ring-amber-500/30'
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
