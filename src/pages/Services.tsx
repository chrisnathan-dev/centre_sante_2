import { Link } from 'react-router-dom'

const appointmentSteps = [
  { number: '01', label: 'Choisir un service' },
  { number: '02', label: 'Choisir un médecin' },
  { number: '03', label: 'Choisir un créneau' },
]

const exams = [
  {
    name: 'Glycémie',
    description: 'Mesure du taux de sucre dans le sang.',
    price: '1 500 FCFA',
  },
  {
    name: 'Numération formule sanguine',
    description: 'Analyse des principales cellules sanguines.',
    price: '3 500 FCFA',
  },
  {
    name: 'Test de dépistage VIH',
    description: 'Dépistage réalisé dans le respect de la confidentialité.',
    price: '2 000 FCFA',
  },
  {
    name: 'Radiographie thoracique',
    description: 'Examen radiologique de la région thoracique.',
    price: '10 000 FCFA',
  },
]

export function Services() {
  return (
    <div className="space-y-10">
      <section className="max-w-3xl">
        <Link className="btn btn-dash btn-accent text-sm" to="/tableau-de-bord/patient">
          ← Retour à mon espace
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          Services du centre
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Des soins plus simples à organiser.
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          Consultez les services disponibles et préparez votre prochaine demande depuis votre espace patient.
        </p>
      </section>

      <section className="card border border-teal-100 bg-teal-50 shadow-sm" id="demande-rendez-vous">
        <div className="card-body gap-6 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="badge badge-info badge-outline">Rendez-vous</div>
              <h2 className="card-title mt-3 text-2xl text-slate-950">Prendre un rendez-vous</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Suivez les trois étapes du parcours pour demander un créneau auprès du centre de santé.
              </p>
            </div>
            <Link className="btn btn-primary bg-teal-700 text-white hover:bg-teal-800" to="/services/rendez-vous">
              Commencer
            </Link>
          </div>

          <div className="grid gap-3 border-t border-teal-200 pt-6 sm:grid-cols-3">
            {appointmentSteps.map((step) => (
              <div className="flex items-center gap-3" key={step.number}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-teal-700 shadow-sm">
                  {step.number}
                </span>
                <span className="text-sm font-medium text-slate-700">{step.label}</span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-teal-300 bg-white/70 p-5" id="parcours-rendez-vous">
            <p className="text-sm font-semibold text-slate-900">Votre demande commence ici</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              La sélection des services, des médecins et des créneaux sera connectée aux disponibilités réelles du centre.
            </p>
            <Link className="btn btn-outline btn-sm mt-4 border-teal-700 text-teal-800 hover:bg-teal-700 hover:text-white" to="/services/rendez-vous">
              Sélectionner un service
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-5" id="examens">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
              Catalogue indicatif
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Examens disponibles
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-500">
            Les tarifs sont indicatifs et doivent être confirmés auprès du centre.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {exams.map((exam) => (
            <article className="card border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={exam.name}>
              <div className="card-body gap-3 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="card-title text-lg text-slate-950">{exam.name}</h3>
                  <span className="badge badge-success badge-outline shrink-0">{exam.price}</span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{exam.description}</p>
                <div className="card-actions mt-2 justify-end">
                  <button className="btn btn-ghost btn-sm text-teal-700 hover:bg-teal-50" type="button">
                    Demander cet examen
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="rounded-lg border border-slate-200 bg-white p-4 text-center text-xs leading-5 text-slate-500">
        Les informations et les prix présentés ici servent de catalogue de démonstration en attendant la connexion à l’API du centre.
      </p>
    </div>
  )
}
