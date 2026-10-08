import { StatCard } from './StatCard'

type StatisticsSectionProps = {
  patients: number
  doctors: number
  staff: number
  consultations: number
  appointments: number
  examinations: number
  topDoctor: { name: string; specialty: string; consultations: number }
  consultationPeriods: { label: string; value: number }[]
}

export function StatisticsSection({ patients, doctors, staff, consultations, appointments, examinations, topDoctor, consultationPeriods }: StatisticsSectionProps) {
  const maxPeriodValue = Math.max(...consultationPeriods.map((period) => period.value))

  return (
    <section className="space-y-5" id="statistiques">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Vue d’ensemble</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Statistiques générales</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard detail="Comptes actifs et enregistrés" label="Patients" tone="teal" value={patients} />
        <StatCard detail="Médecins du centre" label="Médecins" tone="blue" value={doctors} />
        <StatCard detail="Personnel général et spécialisé" label="Personnel" tone="violet" value={staff} />
        <StatCard detail="Consultations clôturées" label="Consultations" tone="amber" value={consultations} />
        <StatCard detail="Toutes les demandes enregistrées" label="Rendez-vous" tone="teal" value={appointments} />
        <StatCard detail="Demandes d’examen enregistrées" label="Examens" tone="blue" value={examinations} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Performance médicale</p>
          <h3 className="mt-3 text-xl font-semibold text-slate-950">Médecin avec le plus de consultations</h3>
          <p className="mt-6 text-2xl font-semibold text-teal-800">{topDoctor.name}</p>
          <p className="mt-1 text-sm text-slate-500">{topDoctor.specialty}</p>
          <div className="mt-6 flex items-end gap-2">
            <span className="text-4xl font-semibold text-slate-950">{topDoctor.consultations}</span>
            <span className="mb-1 text-sm text-slate-500">consultations réalisées</span>
          </div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Activité</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">Consultations par période</h3>
            </div>
            <span className="badge badge-ghost">Données mockées</span>
          </div>
          <div className="mt-8 flex h-44 items-end justify-between gap-3 border-b border-slate-200 px-2">
            {consultationPeriods.map((period) => (
              <div className="flex h-full flex-1 flex-col items-center justify-end gap-2" key={period.label}>
                <span className="text-xs font-semibold text-slate-600">{period.value}</span>
                <div className="w-full max-w-10 rounded-t-md bg-teal-600 transition" style={{ height: `${Math.max((period.value / maxPeriodValue) * 100, 8)}%` }} />
                <span className="text-xs text-slate-500">{period.label}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}
