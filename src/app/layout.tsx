import type { Metadata, Viewport } from 'next'
import { ToasterProvider } from '@/components/ui/ToasterProvider'
import './globals.css'

export const dynamic = 'force-dynamic'

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
        <ToasterProvider />
      </body>
    </html>
  )
}
