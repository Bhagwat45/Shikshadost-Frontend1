export type ComplaintStatus = 'Pending' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected'
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical'

export interface Attachment { name: string; url: string; contentType: string; size: number }
export interface Remark { id: string; message: string; authorId: string; authorName: string; authorRole: string; createdAt: string }

export interface Complaint {
  id: string
  ticketId: string
  studentId: string
  studentName: string
  title: string
  description: string
  status: ComplaintStatus
  department: string
  priority: ComplaintPriority
  originalLanguage: string
  translatedText: string
  summary: string
  category: string
  aiDepartment: string
  predictedDepartment: string
  predictedPriority: ComplaintPriority
  sentiment: string
  confidence: number
  duplicate: boolean
  duplicateComplaintId?: string | null
  similarityScore: number
  suggestedAction: string
  aiExplanation: string
  processedAt?: string | null
  aiVersion: string
  aiStatus: string
  attachments: Attachment[]
  remarks: Remark[]
  createdAt: string
  updatedAt: string
}

export interface ComplaintListResponse { items: Complaint[]; total: number; page: number; pageSize: number }
export interface DashboardStats { total: number; pending: number; assigned: number; inProgress: number; resolved: number; rejected: number; today: number; departments: Record<string, number> }
export interface ComplaintFilters { status?: ComplaintStatus | ''; department?: string; priority?: ComplaintPriority | ''; search?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number; sort?: 'newest' | 'oldest' }
export interface ComplaintDraft { title: string; description: string; priority?: ComplaintPriority; attachments?: Attachment[] }
