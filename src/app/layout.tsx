import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Frameloop — Video Approval',
  description: 'The slick content approval engine for modern agencies.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1c1c28',
              color: '#f1f0ff',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              borderRadius: '10px',
            },
            success: { iconTheme: { primary: '#34d399', secondary: '#1c1c28' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1c1c28' } },
          }}
        />
      </body>
    </html>
  )
}
