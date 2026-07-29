export type Role = 'student' | 'staff' | 'admin'
export interface User { id: string; name: string; email: string; role: Role; department?: string | null; phone?: string | null; createdAt: string; updatedAt: string; isActive: boolean }
export interface AuthResponse { access_token: string; token_type: string; user: User }
export interface LoginPayload { email: string; password: string }
export interface RegisterPayload extends LoginPayload { name: string; role: Role; department?: string; phone?: string }
