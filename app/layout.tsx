import type { Metadata } from 'next'
import { Source_Sans_3, Source_Serif_4 } from 'next/font/google'
import './globals.css'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { getSite } from '@/lib/utils'

const body = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600', '700'],
})

const display = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700'],
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
    <html lang="id" className={`${body.variable} ${display.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <SiteHeader />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
