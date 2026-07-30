import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'GradConnect | Joseph Mugambi',
  description: "Celebrate Joseph Mugambi's Master's in Data Science and Analytics graduation.",
  openGraph: {
    title: "Joseph Mugambi's Graduation Celebration",
    description: 'Beyond Data. Beyond Limits. Towards Impact.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#071a3d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#071a3d', color: '#fff', borderRadius: '12px', fontWeight: 600 },
            success: { iconTheme: { primary: '#c59a42', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
