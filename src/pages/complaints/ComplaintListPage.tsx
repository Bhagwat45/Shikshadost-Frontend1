import { PlusIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import ComplaintFilters from '../../components/complaints/ComplaintFilters'
import ComplaintTable from '../../components/complaints/ComplaintTable'
import { complaintService } from '../../services/complaints'
import type { Role } from '../../types/auth'
import type { ComplaintFilters as Filters } from '../../types/complaint'

export default function ComplaintListPage({ role }: { role: Role }) {
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const fetcher = role === 'student' ? complaintService.getMyComplaints : role === 'staff' ? complaintService.getStaffComplaints : complaintService.getAdminComplaints
  const { data, isLoading } = useQuery({ queryKey: ['complaints', role, filters, page], queryFn: () => fetcher({ ...filters, page, pageSize: 10 }) })
  const title = role === 'student' ? 'My complaints' : role === 'staff' ? 'Department complaints' : 'All complaints'
  const apply = (next: Filters) => { setPage(1); setFilters(next) }
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1
  return <div><div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-slate-500 dark:text-slate-400">Search, filter, and follow every complaint from one place.</p></div>{role === 'student' && <Link to="/student/complaints/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"><PlusIcon className="h-4 w-4" />New complaint</Link>}</div><ComplaintFilters onChange={apply} includeDepartment={role === 'admin'} />{isLoading ? <div className="rounded-2xl bg-white p-12 text-center text-slate-500 dark:bg-slate-900">Loading complaints...</div> : <ComplaintTable complaints={data?.items ?? []} role={role} showStudent={role !== 'student'} />}{data && data.total > 0 && <div className="mt-5 flex items-center justify-between text-sm text-slate-500"><span>{data.total} complaint{data.total === 1 ? '' : 's'} total</span><div className="flex items-center gap-3"><button disabled={page === 1} onClick={() => setPage((old) => old - 1)} className="rounded-lg px-3 py-2 font-semibold hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">Previous</button><span>Page {page} of {pages}</span><button disabled={page === pages} onClick={() => setPage((old) => old + 1)} className="rounded-lg px-3 py-2 font-semibold hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800">Next</button></div></div>}</div>
}
