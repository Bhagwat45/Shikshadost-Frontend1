import api, { API_ORIGIN } from './api'
import type { Attachment, Complaint, ComplaintDraft, ComplaintFilters, ComplaintListResponse, ComplaintPriority, ComplaintStatus, DashboardStats } from '../types/complaint'

const cleanParams = (filters: ComplaintFilters = {}) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''))
export const attachmentUrl = (url: string) => url.startsWith('http') ? url : `${API_ORIGIN}${url}`

export const complaintService = {
  async uploadAttachment(file: File): Promise<Attachment> { const body = new FormData(); body.append('file', file); const { data } = await api.post<Attachment>('/uploads', body, { headers: { 'Content-Type': 'multipart/form-data' } }); return data },
  async createComplaint(payload: ComplaintDraft): Promise<Complaint> { const { data } = await api.post<Complaint>('/complaints', payload); return data },
  async getComplaint(id: string): Promise<Complaint> { const { data } = await api.get<Complaint>(`/complaints/${id}`); return data },
  async getMyComplaints(filters?: ComplaintFilters): Promise<ComplaintListResponse> { const { data } = await api.get<ComplaintListResponse>('/complaints/my', { params: cleanParams(filters) }); return data },
  async getStats(): Promise<DashboardStats> { const { data } = await api.get<DashboardStats>('/complaints/stats'); return data },
  async updateMyComplaint(id: string, payload: ComplaintDraft): Promise<Complaint> { const { data } = await api.put<Complaint>(`/complaints/${id}`, payload); return data },
  async deleteMyComplaint(id: string): Promise<void> { await api.delete(`/complaints/${id}`) },
  async getStaffComplaints(filters?: ComplaintFilters): Promise<ComplaintListResponse> { const { data } = await api.get<ComplaintListResponse>('/staff/complaints', { params: cleanParams(filters) }); return data },
  async updateStaffComplaint(id: string, payload: { status?: ComplaintStatus; priority?: ComplaintPriority; remark?: string }): Promise<Complaint> { const { data } = await api.put<Complaint>(`/staff/complaints/${id}`, payload); return data },
  async addStaffRemark(complaintId: string, message: string): Promise<Complaint> { const { data } = await api.post<Complaint>('/staff/remarks', { complaint_id: complaintId, message }); return data },
  async getAdminComplaints(filters?: ComplaintFilters): Promise<ComplaintListResponse> { const { data } = await api.get<ComplaintListResponse>('/admin/complaints', { params: cleanParams(filters) }); return data },
  async updateAdminComplaint(id: string, payload: { status?: ComplaintStatus; priority?: ComplaintPriority; department?: string; remark?: string }): Promise<Complaint> { const { data } = await api.put<Complaint>(`/admin/complaints/${id}`, payload); return data },
  async deleteAdminComplaint(id: string): Promise<void> { await api.delete(`/admin/complaints/${id}`) },
  async assignDepartment(complaintId: string, department: string): Promise<Complaint> { const { data } = await api.patch<Complaint>('/admin/assign-department', { complaint_id: complaintId, department }); return data },
  async reprocessWithAi(id: string): Promise<Complaint> { const { data } = await api.post<Complaint>(`/ai/reprocess/${id}`); return data },
}
