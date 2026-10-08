import type { AppointmentService, AppointmentSlot, Doctor } from './types'

export const appointmentServices: AppointmentService[] = [
  {
    id: 'medecine-generale',
    name: 'Médecine générale',
    description: 'Consultations de première intention et suivi général.',
  },
  {
    id: 'pediatrie',
    name: 'Pédiatrie',
    description: 'Suivi médical et consultations dédiées aux enfants.',
  },
  {
    id: 'gynecologie',
    name: 'Gynécologie',
    description: 'Consultations de santé reproductive et suivi gynécologique.',
  },
  {
    id: 'cardiologie',
    name: 'Cardiologie',
    description: 'Évaluation et suivi de la santé cardiovasculaire.',
  },
]

export const doctors: Doctor[] = [
  {
    id: 'doctor-aminata-ndoye',
    name: 'Dr Aminata Ndoye',
    specialty: 'Médecine générale',
    serviceId: 'medecine-generale',
    photoUrl: 'https://i.pravatar.cc/160?img=47',
    availabilityLabel: "Disponible aujourd'hui",
  },
  {
    id: 'doctor-jean-mbarga',
    name: 'Dr Jean Mbarga',
    specialty: 'Médecine générale',
    serviceId: 'medecine-generale',
    photoUrl: 'https://i.pravatar.cc/160?img=12',
    availabilityLabel: 'Disponible demain',
  },
  {
    id: 'doctor-claire-mvondo',
    name: 'Dr Claire Mvondo',
    specialty: 'Pédiatre',
    serviceId: 'pediatrie',
    photoUrl: 'https://i.pravatar.cc/160?img=44',
    availabilityLabel: "Disponible aujourd'hui",
  },
  {
    id: 'doctor-sophie-ekotto',
    name: 'Dr Sophie Ekotto',
    specialty: 'Gynécologue',
    serviceId: 'gynecologie',
    photoUrl: 'https://i.pravatar.cc/160?img=32',
    availabilityLabel: 'Disponible demain',
  },
  {
    id: 'doctor-jean-dupont',
    name: 'Dr Jean Dupont',
    specialty: 'Cardiologue',
    serviceId: 'cardiologie',
    photoUrl: 'https://i.pravatar.cc/160?img=11',
    availabilityLabel: "Disponible aujourd'hui",
  },
]

export const appointmentSlots: AppointmentSlot[] = [
  { id: '2026-10-06-09:00', date: '2026-10-06', dateLabel: 'Mardi 6 octobre', time: '09:00', available: true },
  { id: '2026-10-06-09:30', date: '2026-10-06', dateLabel: 'Mardi 6 octobre', time: '09:30', available: false },
  { id: '2026-10-06-10:00', date: '2026-10-06', dateLabel: 'Mardi 6 octobre', time: '10:00', available: true },
  { id: '2026-10-06-11:00', date: '2026-10-06', dateLabel: 'Mardi 6 octobre', time: '11:00', available: true },
  { id: '2026-10-07-09:00', date: '2026-10-07', dateLabel: 'Mercredi 7 octobre', time: '09:00', available: true },
  { id: '2026-10-07-10:30', date: '2026-10-07', dateLabel: 'Mercredi 7 octobre', time: '10:30', available: true },
  { id: '2026-10-07-14:00', date: '2026-10-07', dateLabel: 'Mercredi 7 octobre', time: '14:00', available: false },
  { id: '2026-10-07-15:30', date: '2026-10-07', dateLabel: 'Mercredi 7 octobre', time: '15:30', available: true },
]
