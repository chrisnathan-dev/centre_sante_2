import { Link } from 'react-router-dom'

export function Unauthorized() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
          Accès interdit
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Vous n’avez pas accès à cette page</h1>
        <p className="mt-4 text-slate-600">
          Votre rôle actuel ne permet pas d’ouvrir cette ressource.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white transition hover:bg-teal-800"
          to="/"
        >
          Retour à l’accueil
        </Link>
      </section>
    </main>
  )
}
