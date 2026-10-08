import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../routes/routeConfig'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await register(name.trim(), email.trim(), password)
      navigate(getDashboardPath(authenticatedUser.role), { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Inscription impossible.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Centre de santé
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Inscription patient</h1>
        <p className="mt-2 text-sm text-slate-600">
          L’inscription publique est réservée aux patients.
        </p>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Nom affiché
            <input
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Adresse e-mail
            <input
              autoComplete="email"
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Mot de passe
            <input
              autoComplete="new-password"
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
          <button
            className="w-full rounded-md bg-teal-700 px-4 py-2.5 font-medium text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Création…' : 'Créer mon compte'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Déjà un compte ?{' '}
          <Link className="font-medium text-teal-700 hover:text-teal-800" to="/connexion">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  )
}
