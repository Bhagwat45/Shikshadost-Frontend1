import api from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth'
export const authService = { login: (data: LoginPayload) => api.post<AuthResponse>('/auth/login', data).then(r => r.data), register: (data: RegisterPayload) => api.post<AuthResponse>('/auth/register', data).then(r => r.data), me: () => api.get<User>('/auth/me').then(r => r.data), updateProfile: (data: Partial<User>) => api.put<User>('/auth/profile', data).then(r => r.data) }
