import type { Complaint } from './complaint'

export interface Department { id: string; departmentName: string; description: string; email: string; headOfDepartment?: string | null; staffMembers: string[]; createdAt: string; updatedAt: string; complaintCount: number; resolvedCount: number }
export interface StaffMember { id: string; name: string; email: string; department?: string | null; role: 'staff' | 'student' | 'admin'; phone?: string | null; isActive: boolean; createdAt: string; updatedAt: string }
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number }
export interface Notification { id: string; userId: string; title: string; message: string; type: string; isRead: boolean; createdAt: string }
export interface NotificationPage extends Page<Notification> { unread: number }
export interface ActivityLog { id: string; userId: string; userName?: string; action: string; module: string; description: string; createdAt: string }
export interface ChartItem { label: string; value: number }
export interface Analytics { totals: { totalComplaints: number; pending: number; resolved: number; rejected: number; departments: number; students: number; staff: number }; monthly: ChartItem[]; byDepartment: ChartItem[]; byStatus: ChartItem[]; byPriority: ChartItem[]; byCategory: ChartItem[]; bySentiment: ChartItem[]; confidenceDistribution: ChartItem[]; topDepartments: ChartItem[]; averageResolutionHours: number; languageDistribution: ChartItem[]; recentComplaints: Complaint[] }
export interface Report { period: string; generatedAt: string; totals: Record<string, number>; complaints: Complaint[] }
export interface DepartmentPayload { departmentName: string; description: string; email: string; headOfDepartment?: string; staffMembers?: string[] }
export interface StaffPayload { name: string; email: string; password: string; department?: string; phone?: string; isActive?: boolean }
