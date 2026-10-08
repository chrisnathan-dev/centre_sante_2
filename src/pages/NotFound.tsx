import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="text-center">
        <p className="text-6xl font-semibold text-teal-700">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Page introuvable</h1>
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
