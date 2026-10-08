export const roles = [
  'PATIENT',
  'MEDECIN',
  'PERSONNEL',
  'ADMINISTRATEUR',
] as const

export type Role = (typeof roles)[number]

export type AuthUser = {
  id: string
  name: string
  role: Role
}
