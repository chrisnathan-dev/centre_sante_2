import { useMemo } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { AccountManagementSection } from '../components/AccountManagementSection'
import { ExamTypeSection } from '../components/ExamTypeSection'
import { StatisticsSection } from '../components/StatisticsSection'
import { mockAccounts, mockAppointments, mockConsultations, mockDoctors, mockExaminations, mockPatients, mockStaff } from '../mockData'

export function AdminDashboard() {
  const { user } = useAuth()
  const statistics = useMemo(() => {
    const closedConsultations = mockConsultations.filter((consultation) => consultation.status === 'CLOTUREE')
    const consultationsByDoctor = closedConsultations.reduce<Record<string, number>>((counts, consultation) => {
      counts[consultation.doctorId] = (counts[consultation.doctorId] ?? 0) + 1
      return counts
    }, {})
    const topDoctorEntry = Object.entries(consultationsByDoctor).sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0]
    const topDoctor = mockDoctors.find((doctor) => doctor.id === topDoctorEntry?.[0]) ?? mockDoctors[0]
    const consultationsByPeriod = closedConsultations.reduce<Record<string, number>>((counts, consultation) => {
      counts[consultation.period] = (counts[consultation.period] ?? 0) + 1
      return counts
    }, {})
    const periods = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin'].map((label) => ({ label, value: consultationsByPeriod[label] ?? 0 }))

    return {
      patients: mockPatients.length,
      doctors: mockDoctors.length,
      staff: mockStaff.length,
      consultations: closedConsultations.length,
      appointments: mockAppointments.length,
      examinations: mockExaminations.length,
      topDoctor: { name: `${topDoctor.firstName} ${topDoctor.lastName}`, specialty: topDoctor.specialty ?? '', consultations: topDoctorEntry?.[1] ?? 0 },
      periods,
      totalAccounts: mockAccounts.length,
    }
  }, [])

  return (
    <div className="space-y-12">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Bonjour {user?.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Pilotez l’activité du centre, le catalogue des examens et les comptes de la plateforme.</p>
        </div>
        <span className="badge badge-outline px-4 py-3">{statistics.totalAccounts} comptes suivis</span>
      </header>

      <StatisticsSection
        appointments={statistics.appointments}
        consultations={statistics.consultations}
        consultationPeriods={statistics.periods}
        doctors={statistics.doctors}
        examinations={statistics.examinations}
        patients={statistics.patients}
        staff={statistics.staff}
        topDoctor={statistics.topDoctor}
      />
      <ExamTypeSection />
      <AccountManagementSection />
    </div>
  )
}
