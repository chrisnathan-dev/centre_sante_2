import { AppointmentInbox } from '../features/appointments/components/AppointmentInbox'

type DoctorFeaturePageProps = {
  title: string
  description: string
}

export function DoctorFeaturePage({ title, description }: DoctorFeaturePageProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        Espace médecin
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
      {title === 'Rendez-vous' ? (
        <div className="mt-8">
          <AppointmentInbox audience="doctor" />
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
          Ce module sera développé progressivement avec les données du centre et l’API prévue.
        </div>
      )}
    </section>
  )
}
