import { Link } from 'react-router-dom'

export function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-20 lg:px-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
          Plateforme de santé
        </p>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
          Bienvenue dans votre espace de santé en ligne
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
          Un accès centralisé aux services du centre de santé selon votre rôle.
        </p>
        <div className="mx-auto mt-8 grid w-full max-w-2xl gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2 sm:gap-8 sm:pt-8">
          <div className="flex min-w-0 flex-col items-center gap-3 px-2 sm:px-0">
            <p className="text-sm text-slate-600">J'ai déjà un compte.</p>
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-teal-700 px-5 py-3 font-medium text-white transition hover:bg-teal-800 sm:w-auto sm:px-8"
              to="/connexion"
            >
              Se connecter
            </Link>
          </div>
          <div className="flex min-w-0 flex-col items-center gap-3 px-2 sm:px-0">
            <p className="text-sm text-slate-600">Nouveau ici ? Créez un compte.</p>
            <Link
              className="inline-flex min-h-12 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-100 sm:w-auto sm:px-8"
              to="/inscription"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
