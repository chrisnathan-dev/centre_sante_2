import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { Role } from '../types/auth'

type ProtectedRouteProps = {
  allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <p className="p-6 text-center text-sm text-slate-600">Chargement de votre session…</p>
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/connexion" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/non-autorise" />
  }

  return <Outlet />
}
