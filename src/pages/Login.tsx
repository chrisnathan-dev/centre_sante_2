import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDashboardPath } from '../routes/routeConfig'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await login(email.trim(), password)
      const state = location.state as { from?: { pathname?: string } } | null
      const destination = state?.from?.pathname ?? getDashboardPath(authenticatedUser.role)
      navigate(destination, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Connexion impossible.')
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
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Connexion</h1>
        <p className="mt-2 text-sm text-slate-600">
          Connectez-vous avec l’adresse e-mail et le mot de passe de votre compte.
        </p>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
              autoComplete="current-password"
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-teal-600 focus:ring-2"
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
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Patient sans compte ?{' '}
          <Link className="font-medium text-teal-700 hover:text-teal-800" to="/inscription">
            S’inscrire
          </Link>
        </p>
      </section>
    </main>
  )
}
