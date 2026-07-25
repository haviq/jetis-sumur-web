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
  index,
}: {
  title: string
  desc: string
  icon?: ReactNode
  index?: number
}) {
  return (
    <article className="card p-4 md:p-5 space-y-2 h-full">
      <div className="flex items-center gap-2.5">
        {typeof index === 'number' ? (
          <span
            className="w-7 h-7 rounded-md grid place-items-center text-xs font-bold shrink-0"
            style={{ background: 'var(--surface-soft)', border: '1px solid var(--border)', color: 'var(--accent)' }}
          >
            {index}
          </span>
        ) : icon ? (
          <div className="feature-icon" aria-hidden>
            {icon}
          </div>
        ) : null}
        <h3 className="font-bold text-[0.98rem] leading-snug">{title}</h3>
      </div>
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
    <div className="space-y-1.5 max-w-2xl">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title text-xl md:text-2xl">{title}</h2>
      {desc ? (
        <p className="text-sm md:text-[0.95rem]" style={{ color: 'var(--muted)' }}>
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
      {desc ? <p className="text-sm">{desc}</p> : null}
    </div>
  )
}

export function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </svg>
  )
}

export function IconSheet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  )
}

export function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    </svg>
  )
}

export function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  )
}
