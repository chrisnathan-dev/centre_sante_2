import { Link } from 'react-router-dom'
import { doctorNavigation } from '../components/layout/doctor-navigation'
import { useAuth } from '../hooks/useAuth'

const quickAccess = doctorNavigation.filter((item) => item.path !== '/tableau-de-bord/medecin')

export function DoctorDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-teal-900 px-6 py-8 text-white shadow-lg shadow-teal-950/10 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-200">
          Espace médecin
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Bonjour Dr {user?.name}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-teal-100 sm:text-base">
          Retrouvez les accès essentiels à votre planning, vos rendez-vous et votre suivi des patients.
        </p>
      </section>

      <section>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
            Accès rapide
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Votre activité médicale
          </h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickAccess.map((item) => (
            <Link
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              key={item.path}
              to={item.path}
            >
              <span className="grid size-10 place-items-center rounded-lg bg-teal-50 text-lg text-teal-700">
                {item.icon}
              </span>
              <h3 className="mt-4 font-semibold text-slate-950">{item.label}</h3>
              <p className="mt-1 text-sm text-slate-500">Ouvrir cet espace</p>
              <span className="mt-4 inline-flex text-sm font-semibold text-teal-700 transition group-hover:text-teal-900">
                Consulter <span aria-hidden="true" className="ml-2">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
          Prochaine étape
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">Votre espace est prêt</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Les modules seront complétés progressivement avec les données du centre et les règles de gestion définies dans le projet.
        </p>
      </section>
    </div>
  )
}
