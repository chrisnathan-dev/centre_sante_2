import { useAuth } from '../hooks/useAuth'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <section>
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        Espace sécurisé
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-950">Tableau de bord</h1>
      <p className="mt-4 max-w-2xl text-slate-600">
        Bienvenue {user?.name}. Cet espace sera complété progressivement selon votre rôle.
      </p>
    </section>
  )
}
