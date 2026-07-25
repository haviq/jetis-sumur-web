import type { ReactNode } from 'react'

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  let cls = 'badge badge-muted'
  if (s === 'aktif' || s === 'approved') cls = 'badge badge-ok'
  else if (s === 'pending' || s === 'pindah') cls = 'badge badge-warn'
  else if (s === 'rejected' || s === 'meninggal' || s === 'nonaktif') cls = 'badge badge-danger'
  else if (s === 'baru' || s === 'update') cls = 'badge badge-sky'
  return <span className={cls}>{status}</span>
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="stat-card">
      <div className="value">{value}</div>
      <p className="label">{label}</p>
      {hint ? (
        <p className="text-[11px] mt-1" style={{ color: 'var(--muted2)' }}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string
  desc: string
  icon: ReactNode
}) {
  return (
    <article className="card p-5 space-y-3 h-full">
      <div className="feature-icon" aria-hidden>
        {icon}
      </div>
      <h3 className="font-bold text-[1.02rem]">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
        {desc}
      </p>
    </article>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string
  title: string
  desc?: string
}) {
  return (
    <div className="space-y-2 max-w-2xl">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title text-2xl md:text-3xl">{title}</h2>
      {desc ? (
        <p className="text-sm md:text-base" style={{ color: 'var(--muted)' }}>
          {desc}
        </p>
      ) : null}
    </div>
  )
}

export function EmptyState({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="empty-state card">
      <strong>{title}</strong>
      {desc ? <p className="text-sm max-w-sm mx-auto">{desc}</p> : null}
    </div>
  )
}

export function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function IconSheet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
      <path d="M8 9h2" />
    </svg>
  )
}

export function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}
