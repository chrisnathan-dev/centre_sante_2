import type { AdminAccount, ExamType } from './types'
import { apiRequest } from '../../services/api'

type AccountResponse = { account: AdminAccount }
type AccountsResponse = { accounts: AdminAccount[] }
type ExamTypeResponse = { examType: ExamType }
type ExamTypesResponse = { examTypes: ExamType[] }

export type NewAdminAccount = Omit<AdminAccount, 'id' | 'createdAt' | 'status'> & {
  password: string
}

export async function getAdminAccounts(): Promise<AdminAccount[]> {
  const response = await apiRequest<AccountsResponse>('/admin/accounts')
  return response.accounts
}

export async function createAdminAccount(account: NewAdminAccount): Promise<AdminAccount> {
  const response = await apiRequest<AccountResponse>('/admin/accounts', {
    method: 'POST',
    body: JSON.stringify(account),
  })
  return response.account
}

export async function updateAdminAccount(account: AdminAccount): Promise<void> {
  await apiRequest<{ success: boolean }>(`/admin/accounts/${account.id}`, {
    method: 'PATCH',
    body: JSON.stringify(account),
  })
}

export async function setAdminAccountStatus(id: string, status: AdminAccount['status']): Promise<void> {
  await apiRequest<{ success: boolean }>(`/admin/accounts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function getExamTypes(): Promise<ExamType[]> {
  const response = await apiRequest<ExamTypesResponse>('/admin/exam-types')
  return response.examTypes
}

export async function createExamType(examType: Pick<ExamType, 'label' | 'description'>): Promise<ExamType> {
  const response = await apiRequest<ExamTypeResponse>('/admin/exam-types', {
    method: 'POST',
    body: JSON.stringify(examType),
  })
  return response.examType
}

export async function updateExamType(examType: ExamType): Promise<void> {
  await apiRequest<{ success: boolean }>(`/admin/exam-types/${examType.id}`, {
    method: 'PATCH',
    body: JSON.stringify(examType),
  })
}

export async function setExamTypeStatus(id: string, status: ExamType['status']): Promise<void> {
  await apiRequest<{ success: boolean }>(`/admin/exam-types/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function saveExamType(examType: ExamType, currentTypes: ExamType[]): ExamType[] {
  const existingType = currentTypes.some((item) => item.id === examType.id)

  return existingType
    ? currentTypes.map((item) => item.id === examType.id ? examType : item)
    : [...currentTypes, examType]
}

export function saveAccount(account: AdminAccount, currentAccounts: AdminAccount[]): AdminAccount[] {
  const existingAccount = currentAccounts.some((item) => item.id === account.id)

  return existingAccount
    ? currentAccounts.map((item) => item.id === account.id ? account : item)
    : [...currentAccounts, account]
}
