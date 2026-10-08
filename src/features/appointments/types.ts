export type AppointmentService = {
  id: string
  name: string
  description: string
}

export type Doctor = {
  id: string
  name: string
  specialty: string
  serviceId: string
  photoUrl: string
  availabilityLabel: string
}

export type AppointmentSlot = {
  id: string
  date: string
  dateLabel: string
  time: string
  available: boolean
}

export type AppointmentRequest = {
  service: AppointmentService
  doctor: Doctor
  slot: AppointmentSlot
  reason: string
  details: string
}

export type Appointment = AppointmentRequest & {
  id: string
  status: 'EN_ATTENTE'
}

export type StoredAppointment = {
  id: string
  doctorId: string
  doctorName: string
  patientName: string
  serviceName: string
  date: string
  time: string
  reason: string
  details: string
  status: 'EN_ATTENTE' | 'CONFIRME' | 'REFUSE' | 'ANNULE'
  patientConfirmedAt: string
}

export type AppointmentMessage = {
  id: string
  message: string
  senderName: string
  senderRole: 'PATIENT' | 'MEDECIN'
  createdAt: string
}
