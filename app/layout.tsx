import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { getSite } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
})

const site = getSite()

export const metadata: Metadata = {
  title: {
    default: `${site.productName} — ${site.name}`,
    template: `%s | ${site.productName}`,
  },
  description: site.tagline,
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
