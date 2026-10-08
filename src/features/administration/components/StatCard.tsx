type StatCardProps = {
  label: string
  value: number
  detail: string
  tone: 'teal' | 'blue' | 'amber' | 'violet'
}

const toneClasses = {
  teal: 'bg-teal-50 text-teal-700',
  blue: 'bg-blue-50 text-blue-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
}

export function StatCard({ label, value, detail, tone }: StatCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`grid size-10 place-items-center rounded-lg text-lg font-bold ${toneClasses[tone]}`}>+</div>
      <p className="mt-5 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">{value.toLocaleString('fr-FR')}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  )
}
