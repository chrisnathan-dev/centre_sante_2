export type AccountRole = 'PATIENT' | 'MEDECIN' | 'PERSONNEL'
export type AccountStatus = 'ACTIF' | 'INACTIF'
export type StaffType = 'GENERAL' | 'LABORANTIN'

export type AdminAccount = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  role: AccountRole
  staffType?: StaffType
  functionTitle?: string
  specialty?: string
  service?: string
  registrationNumber?: string
  status: AccountStatus
  createdAt: string
}

export type ExamType = {
  id: string
  label: string
  description: string
  status: AccountStatus
}

export type ConsultationRecord = {
  id: string
  doctorId: string
  period: string
  status: 'CLOTUREE' | 'EN_COURS'
}

export type AppointmentRecord = {
  id: string
  status: 'EN_ATTENTE' | 'CONFIRME' | 'ANNULE' | 'ABSENT' | 'TERMINE'
}

export type ExaminationRecord = {
  id: string
  status: 'EN_ATTENTE' | 'TERMINE'
}
