import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="text-lg font-semibold text-slate-900" to="/">
          Centre de santé
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-600 sm:inline">{user.name}</span>
            <button
              className="rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
              onClick={logout}
              type="button"
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <Link
            className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
            to="/connexion"
          >
            Se connecter
          </Link>
        )}
      </div>
    </header>
  )
}
