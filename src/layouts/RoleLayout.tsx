import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'
import type { Role } from '../types/auth'

type RoleLayoutProps = {
  role: Role
}

export function RoleLayout({ role }: RoleLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <Sidebar role={role} />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
