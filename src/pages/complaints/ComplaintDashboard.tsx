import { CheckCircleIcon, ClipboardDocumentListIcon, ClockIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import ComplaintTable from '../../components/complaints/ComplaintTable'
import StatCard from '../../components/complaints/StatCard'
import { complaintService } from '../../services/complaints'
import type { Role } from '../../types/auth'

export default function ComplaintDashboard({ role }: { role: Role }) {
  const fetcher = role === 'student' ? complaintService.getMyComplaints : role === 'staff' ? complaintService.getStaffComplaints : complaintService.getAdminComplaints
  const { data: stats } = useQuery({ queryKey: ['complaint-stats', role], queryFn: complaintService.getStats })
  const { data: recent, isLoading } = useQuery({ queryKey: ['recent-complaints', role], queryFn: () => fetcher({ pageSize: 5 }) })
  const heading = role === 'student' ? 'Welcome back' : role === 'staff' ? 'Department workspace' : 'Operations overview'
  return <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-brand-600">ShikshaDost</p><h1 className="mt-1 text-3xl font-bold tracking-tight">{heading}</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Keep every concern visible and moving forward.</p></div>{role === 'student' && <Link to="/student/complaints/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"><PlusIcon className="h-4 w-4" />New complaint</Link>}</div><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Total complaints" value={stats?.total ?? 0} icon={<ClipboardDocumentListIcon className="h-6 w-6" />} /><StatCard label="Pending" value={stats?.pending ?? 0} icon={<ClockIcon className="h-6 w-6" />} accent="text-amber-600 bg-amber-50 dark:bg-amber-500/10" /><StatCard label="In progress" value={stats?.inProgress ?? 0} icon={<ClockIcon className="h-6 w-6" />} accent="text-violet-600 bg-violet-50 dark:bg-violet-500/10" /><StatCard label="Resolved" value={stats?.resolved ?? 0} icon={<CheckCircleIcon className="h-6 w-6" />} accent="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" /></div><div className="mt-8"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-bold">Recent complaints</h2><p className="text-sm text-slate-500">Latest activity in your workspace.</p></div><Link to={`/${role}/complaints`} className="text-sm font-semibold text-brand-600 hover:text-brand-700">View all</Link></div>{isLoading ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500 dark:bg-slate-900">Loading complaints...</div> : <ComplaintTable complaints={recent?.items ?? []} role={role} showStudent={role !== 'student'} />}</div></div>
}
