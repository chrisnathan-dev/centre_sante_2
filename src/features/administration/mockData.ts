import type {
  AdminAccount,
  AppointmentRecord,
  ConsultationRecord,
  ExaminationRecord,
  ExamType,
} from './types'

export const mockPatients: AdminAccount[] = [
  { id: 'patient-001', firstName: 'Amina', lastName: 'Ndiaye', email: 'amina.ndiaye@example.com', phone: '+237 690 12 34 56', role: 'PATIENT', status: 'ACTIF', createdAt: '2026-01-12' },
  { id: 'patient-002', firstName: 'Paul', lastName: 'Mekongo', email: 'paul.mekongo@example.com', phone: '+237 677 45 67 89', role: 'PATIENT', status: 'ACTIF', createdAt: '2026-01-16' },
  { id: 'patient-003', firstName: 'Chantal', lastName: 'Tchoumi', email: 'chantal.tchoumi@example.com', phone: '+237 699 22 11 00', role: 'PATIENT', status: 'ACTIF', createdAt: '2026-02-03' },
  { id: 'patient-004', firstName: 'Moussa', lastName: 'Oumarou', email: 'moussa.oumarou@example.com', phone: '+237 655 31 42 20', role: 'PATIENT', status: 'ACTIF', createdAt: '2026-02-18' },
  { id: 'patient-005', firstName: 'Estelle', lastName: 'Fouda', email: 'estelle.fouda@example.com', phone: '+237 688 17 20 44', role: 'PATIENT', status: 'ACTIF', createdAt: '2026-03-01' },
]

export const mockDoctors: AdminAccount[] = [
  { id: 'doctor-001', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@centre-sante.cm', phone: '+237 677 10 20 30', role: 'MEDECIN', specialty: 'Cardiologie', service: 'Cardiologie', registrationNumber: 'MED-2026-001', status: 'ACTIF', createdAt: '2025-12-10' },
  { id: 'doctor-002', firstName: 'Claire', lastName: 'Mvondo', email: 'claire.mvondo@centre-sante.cm', phone: '+237 699 30 40 50', role: 'MEDECIN', specialty: 'Pédiatrie', service: 'Pédiatrie', registrationNumber: 'MED-2026-002', status: 'ACTIF', createdAt: '2025-12-15' },
  { id: 'doctor-003', firstName: 'Aminata', lastName: 'Ndoye', email: 'aminata.ndoye@centre-sante.cm', phone: '+237 690 40 50 60', role: 'MEDECIN', specialty: 'Médecine générale', service: 'Médecine générale', registrationNumber: 'MED-2026-003', status: 'ACTIF', createdAt: '2026-01-05' },
]

export const mockStaff: AdminAccount[] = [
  { id: 'staff-001', firstName: 'Sophie', lastName: 'Ekotto', email: 'sophie.ekotto@centre-sante.cm', phone: '+237 677 55 66 77', role: 'PERSONNEL', staffType: 'GENERAL', status: 'ACTIF', createdAt: '2025-12-20' },
  { id: 'staff-002', firstName: 'Marc', lastName: 'Abanda', email: 'marc.abanda@centre-sante.cm', phone: '+237 699 70 80 90', role: 'PERSONNEL', staffType: 'LABORANTIN', status: 'ACTIF', createdAt: '2026-01-08' },
]

export const mockConsultations: ConsultationRecord[] = [
  ...Array.from({ length: 126 }, (_, index) => ({ id: `consultation-jean-${index}`, doctorId: 'doctor-001', period: ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin'][index % 6], status: 'CLOTUREE' as const })),
  ...Array.from({ length: 94 }, (_, index) => ({ id: `consultation-claire-${index}`, doctorId: 'doctor-002', period: ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin'][index % 6], status: 'CLOTUREE' as const })),
  ...Array.from({ length: 72 }, (_, index) => ({ id: `consultation-aminata-${index}`, doctorId: 'doctor-003', period: ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin'][index % 6], status: 'CLOTUREE' as const })),
  { id: 'consultation-open-001', doctorId: 'doctor-001', period: 'Juin', status: 'EN_COURS' },
]

export const mockAppointments: AppointmentRecord[] = Array.from({ length: 1420 }, (_, index) => ({
  id: `appointment-${index + 1}`,
  status: index % 11 === 0 ? 'ANNULE' : index % 7 === 0 ? 'EN_ATTENTE' : 'TERMINE',
}))

export const mockExaminations: ExaminationRecord[] = Array.from({ length: 537 }, (_, index) => ({
  id: `examination-${index + 1}`,
  status: index % 5 === 0 ? 'EN_ATTENTE' : 'TERMINE',
}))

export const mockExamTypes: ExamType[] = [
  { id: 'exam-type-001', label: 'Numération formule sanguine', description: 'Analyse des principales cellules sanguines.', status: 'ACTIF' },
  { id: 'exam-type-002', label: 'Glycémie', description: 'Mesure du taux de sucre dans le sang.', status: 'ACTIF' },
  { id: 'exam-type-003', label: 'Radiographie thoracique', description: 'Examen radiologique de la région thoracique.', status: 'ACTIF' },
  { id: 'exam-type-004', label: 'Bilan lipidique', description: 'Évaluation des principales graisses présentes dans le sang.', status: 'INACTIF' },
]

export const mockAccounts: AdminAccount[] = [...mockPatients, ...mockDoctors, ...mockStaff]
