import api from './api'
import type { ActivityLog, Analytics, Department, DepartmentPayload, Notification, NotificationPage, Page, Report, StaffMember, StaffPayload } from '../types/administration'

const params = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== '').map(([key, item]) => [key === 'pageSize' ? 'page_size' : key, item]))

export const administrationService = {
  async departments(query: { page?: number; pageSize?: number; search?: string } = {}): Promise<Page<Department>> { const { data } = await api.get('/admin/departments', { params: params(query) }); return data },
  async department(id: string): Promise<Department> { const { data } = await api.get(`/admin/departments/${id}`); return data },
  async createDepartment(payload: DepartmentPayload): Promise<Department> { const { data } = await api.post('/admin/departments', payload); return data },
  async updateDepartment(id: string, payload: Partial<DepartmentPayload>): Promise<Department> { const { data } = await api.put(`/admin/departments/${id}`, payload); return data },
  async deleteDepartment(id: string): Promise<void> { await api.delete(`/admin/departments/${id}`) },
  async staff(query: { page?: number; pageSize?: number; search?: string; department?: string; active?: boolean } = {}): Promise<Page<StaffMember>> { const { data } = await api.get('/admin/staff', { params: params(query) }); return data },
  async students(query: { page?: number; pageSize?: number; search?: string } = {}): Promise<Page<StaffMember>> { const { data } = await api.get('/admin/students', { params: params(query) }); return data },
  async staffMember(id: string): Promise<StaffMember> { const { data } = await api.get(`/admin/staff/${id}`); return data },
  async createStaff(payload: StaffPayload): Promise<StaffMember> { const { data } = await api.post('/admin/staff', payload); return data },
  async updateStaff(id: string, payload: Partial<Omit<StaffPayload, 'email' | 'password'>>): Promise<StaffMember> { const { data } = await api.put(`/admin/staff/${id}`, payload); return data },
  async deleteStaff(id: string): Promise<void> { await api.delete(`/admin/staff/${id}`) },
  async analytics(): Promise<Analytics> { const { data } = await api.get('/admin/analytics'); return data },
  async logs(query: { page?: number; pageSize?: number; search?: string; module?: string } = {}): Promise<Page<ActivityLog>> { const { data } = await api.get('/admin/logs', { params: params(query) }); return data },
  async notifications(page = 1): Promise<NotificationPage> { const { data } = await api.get('/notifications', { params: { page, page_size: 20 } }); return data },
  async readNotification(id: string): Promise<Notification> { const { data } = await api.put(`/notifications/read/${id}`); return data },
  async readAllNotifications(): Promise<void> { await api.put('/notifications/read-all') },
  async report(period: 'daily' | 'weekly' | 'monthly'): Promise<Report> { const { data } = await api.get(`/reports/${period}`); return data },
}
