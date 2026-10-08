import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '../components/layout/AdminSidebar'
import { Header } from '../components/layout/Header'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <Header />
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
