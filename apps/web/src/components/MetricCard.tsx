import type { ReactNode } from 'react'

type Props = { label: string; value: string | number; helper: string; icon: ReactNode; tone?: 'purple' | 'green' | 'blue' | 'amber' }

export default function MetricCard({ label, value, helper, icon, tone = 'purple' }: Props) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-${tone}`}>{icon}</div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>
    </article>
  )
}
