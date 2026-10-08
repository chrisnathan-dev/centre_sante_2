import type { Role } from '../types/auth'

export const roleDashboardPaths: Record<Role, string> = {
  PATIENT: '/tableau-de-bord/patient',
  MEDECIN: '/tableau-de-bord/medecin',
  PERSONNEL: '/tableau-de-bord/personnel',
  ADMINISTRATEUR: '/tableau-de-bord/administrateur',
}

export function getDashboardPath(role: Role): string {
  return roleDashboardPaths[role]
}
