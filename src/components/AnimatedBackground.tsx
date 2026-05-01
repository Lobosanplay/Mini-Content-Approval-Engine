'use client'

/**
 * AnimatedBackground
 * ─────────────────────────────────────────────────────────
 * Premium GPU-friendly animated backgrounds.
 * variant="auth"      → aurora + blobs + dual orbital rings
 * variant="dashboard" → subtle dot-grid + slow glow spots
 *
 * All animation via CSS transforms + opacity — no JS timers.
 */

interface Props {
  variant?: 'auth' | 'dashboard'
}

export default function AnimatedBackground({ variant = 'dashboard' }: Props) {
  if (variant === 'auth') {
    return (
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">

        {/* ── Layer 1: Deep aurora gradient mesh ── */}
        <div
          className="animate-aurora absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #050509 0%, #0d0920 25%, #06081a 50%, #0a0618 75%, #050509 100%)',
            backgroundSize: '300% 300%',
          }}
        />

        {/* ── Layer 2: Accent blobs ── */}
        {/* Primary indigo blob — top-left */}
        <div
          className="animate-blob-1 absolute"
          style={{
            top: '-12%',
            left: '-5%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.08) 40%, transparent 70%)',
            filter: 'blur(2px)',
            willChange: 'transform',
          }}
        />

        {/* Violet blob — bottom-right */}
        <div
          className="animate-blob-2 absolute"
          style={{
            bottom: '-15%',
            right: '-3%',
            width: '580px',
            height: '580px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 60% 60%, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.06) 45%, transparent 70%)',
            filter: 'blur(1px)',
            willChange: 'transform',
          }}
        />

        {/* Teal accent — centre */}
        <div
          className="animate-blob-3 absolute"
          style={{
            top: '38%',
            right: '20%',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 65%)',
            willChange: 'transform',
          }}
        />

        {/* Small hot blob — top-right */}
        <div
          className="animate-blob-4 absolute"
          style={{
            top: '8%',
            right: '12%',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)',
            willChange: 'transform',
          }}
        />

        {/* ── Layer 3: Dual orbital rings ── */}
        {/* Outer orbit */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '560px',
            height: '560px',
          }}
        >
          {/* Orbit track (faint ring) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '1px solid rgba(99,102,241,0.06)',
            }}
          />
          {/* Orbiting dot */}
          <div
            className="animate-orbit absolute"
            style={{
              top: '50%',
              left: '50%',
              marginTop: '-5px',
              marginLeft: '-5px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'rgba(99,102,241,0.55)',
              boxShadow: '0 0 14px rgba(99,102,241,0.9), 0 0 28px rgba(99,102,241,0.4)',
              willChange: 'transform',
            }}
          />
        </div>

        {/* Inner orbit (smaller, reverse) */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            height: '360px',
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(139,92,246,0.05)' }}
          />
          <div
            className="animate-orbit-rev absolute"
            style={{
              top: '50%',
              left: '50%',
              marginTop: '-3px',
              marginLeft: '-3px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'rgba(167,139,250,0.6)',
              boxShadow: '0 0 10px rgba(167,139,250,0.8)',
              willChange: 'transform',
            }}
          />
        </div>

        {/* ── Layer 4: Vignette ── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 110% at 50% 50%, transparent 45%, rgba(5,5,9,0.75) 100%)',
          }}
        />

        {/* ── Layer 5: Top edge fade ── */}
        <div
          className="absolute inset-x-0 top-0 h-32"
          style={{
            background: 'linear-gradient(to bottom, rgba(5,5,9,0.8) 0%, transparent 100%)',
          }}
        />
        {/* Bottom edge fade */}
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          style={{
            background: 'linear-gradient(to top, rgba(5,5,9,0.8) 0%, transparent 100%)',
          }}
        />

      </div>
    )
  }

  /* ── Dashboard variant ──────────────────────────── */
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">

      {/* Subtle dot grid */}
      <div
        className="animate-grid-pulse absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.1) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          willChange: 'opacity',
        }}
      />

      {/* Top-right glow */}
      <div
        className="animate-blob-1 absolute"
        style={{
          top: '-25%',
          right: '10%',
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)',
          willChange: 'transform',
        }}
      />

      {/* Bottom-left violet */}
      <div
        className="animate-blob-2 absolute"
        style={{
          bottom: '-20%',
          left: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)',
          willChange: 'transform',
        }}
      />

      {/* Centre accent (very faint) */}
      <div
        className="animate-blob-3 absolute"
        style={{
          top: '30%',
          left: '40%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 65%)',
          willChange: 'transform',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 130% 90% at 50% 50%, transparent 40%, rgba(5,5,9,0.6) 100%)',
        }}
      />
    </div>
  )
}
