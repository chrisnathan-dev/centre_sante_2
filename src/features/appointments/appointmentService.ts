import { apiRequest } from '../../services/api'
import { appointmentSlots } from './mockData'
import type { Appointment, AppointmentMessage, AppointmentRequest, Doctor, StoredAppointment } from './types'

export function getAppointmentSlots() {
  return appointmentSlots
}

export async function getAvailableDoctors(): Promise<Doctor[]> {
  const response = await apiRequest<{ doctors: Doctor[] }>('/appointments/doctors')
  return response.doctors
}

export async function getReservedSlots(doctorId: string): Promise<Array<Pick<AppointmentRequest['slot'], 'date' | 'time'>>> {
  const response = await apiRequest<{ reservedSlots: Array<Pick<AppointmentRequest['slot'], 'date' | 'time'>> }>(
    `/appointments/reserved-slots?doctorId=${encodeURIComponent(doctorId)}`,
  )
  return response.reservedSlots
}

export async function createAppointment(request: AppointmentRequest): Promise<Appointment> {
  const response = await apiRequest<{ appointment: { id: string } }>('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      doctorId: request.doctor.id,
      serviceName: request.service.name,
      date: request.slot.date,
      time: request.slot.time,
      reason: request.reason,
      details: request.details,
    }),
  })

  return { ...request, id: response.appointment.id, status: 'EN_ATTENTE' }
}

export async function getMyAppointments(): Promise<StoredAppointment[]> {
  const response = await apiRequest<{ appointments: StoredAppointment[] }>('/appointments')
  return response.appointments
}

export async function getAppointmentMessages(appointmentId: string): Promise<AppointmentMessage[]> {
  const response = await apiRequest<{ messages: AppointmentMessage[] }>(`/appointments/${appointmentId}/messages`)
  return response.messages
}

export async function sendAppointmentMessage(appointmentId: string, message: string): Promise<void> {
  await apiRequest<{ success: boolean }>(`/appointments/${appointmentId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}
