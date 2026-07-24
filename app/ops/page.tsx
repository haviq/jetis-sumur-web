import type { Metadata } from 'next'
import OpsDashboard from '@/components/OpsDashboard'

export const metadata: Metadata = {
  title: 'Internal',
  robots: { index: false, follow: false, nocache: true },
}

export default function OpsPage() {
  return <OpsDashboard />
}
