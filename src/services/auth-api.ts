import { apiRequest } from './api'
import type { AuthUser } from '../types/auth'

type AuthResponse = {
  user: AuthUser
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/auth/me')
  return response.user
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return response.user
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  return response.user
}

export async function logoutUser(): Promise<void> {
  await apiRequest<{ success: boolean }>('/auth/logout', { method: 'POST' })
}