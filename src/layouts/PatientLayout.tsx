import { Outlet } from 'react-router-dom'
import { PatientHeader } from '../components/layout/PatientHeader'

export function PatientLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <PatientHeader />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  )
}
