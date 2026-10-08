import { NavLink } from 'react-router-dom'

const adminNavigation = [
  { label: 'Tableau de bord', path: '/tableau-de-bord/administrateur', icon: '⌂' },
  { label: 'Types d’examen', path: '/tableau-de-bord/administrateur#types-examen', icon: '◇' },
  { label: 'Comptes utilisateurs', path: '/tableau-de-bord/administrateur#comptes', icon: '◎' },
]

export function AdminSidebar() {
  return (
    <aside className="w-full border-b border-slate-200 bg-white p-4 lg:min-h-[calc(100vh-4rem)] lg:w-72 lg:border-b-0 lg:border-r lg:p-5">
      <div className="mb-5 rounded-xl bg-slate-900 p-4 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Administration</p>
        <p className="mt-1 text-sm leading-5 text-slate-300">Pilotage de la plateforme et des accès.</p>
      </div>
      <nav aria-label="Navigation administrateur" className="grid gap-1 sm:grid-cols-3 lg:grid-cols-1">
        {adminNavigation.map((item) => (
          <NavLink
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-teal-100 text-teal-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
            end={item.path === '/tableau-de-bord/administrateur'}
            key={item.path}
            to={item.path}
          >
            <span aria-hidden="true" className="grid size-7 place-items-center rounded-md bg-white text-sm text-teal-700 shadow-sm">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
