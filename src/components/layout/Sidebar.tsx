import { NavLink } from 'react-router-dom'
import type { Role } from '../../types/auth'

type SidebarProps = {
  role: Role
}

const roleLabels: Record<Role, string> = {
  PATIENT: 'Espace patient',
  MEDECIN: 'Espace médecin',
  PERSONNEL: 'Espace personnel',
  ADMINISTRATEUR: 'Administration',
}

export function Sidebar({ role }: SidebarProps) {
  const dashboardPath = `/tableau-de-bord/${role.toLowerCase()}`

  return (
    <aside className="w-full border-b border-slate-200 bg-slate-50 p-4 lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-r">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {roleLabels[role]}
      </p>
      <nav aria-label="Navigation principale">
        <NavLink
          className={({ isActive }) =>
            `block rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-teal-100 text-teal-900'
                : 'text-slate-700 hover:bg-white'
            }`
          }
          to={dashboardPath}
        >
          Tableau de bord
        </NavLink>
      </nav>
    </aside>
  )
}
