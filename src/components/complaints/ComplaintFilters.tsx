import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import type { ComplaintFilters as Filters } from '../../types/complaint'

const statuses = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected']
const priorities = ['Low', 'Medium', 'High', 'Urgent', 'Critical']
export const departments = ['Academic', 'Accounts', 'Administration', 'Examination', 'Hostel', 'IT Support', 'Library', 'Transport', 'Other']

export default function ComplaintFilters({ onChange, includeDepartment = false }: { onChange: (filters: Filters) => void; includeDepartment?: boolean }) {
  const [filters, setFilters] = useState<Filters>({})
  const set = (key: keyof Filters, value: string) => setFilters((old) => ({ ...old, [key]: value }))
  const submit = (event: React.FormEvent) => { event.preventDefault(); onChange(filters) }
  const reset = () => { setFilters({}); onChange({}) }
  return <form onSubmit={submit} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5 dark:border-slate-800 dark:bg-slate-900"><label className="relative md:col-span-2"><MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={filters.search ?? ''} onChange={(e) => set('search', e.target.value)} placeholder="Search ticket or title" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950" /></label><select value={filters.status ?? ''} onChange={(e) => set('status', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All statuses</option>{statuses.map((value) => <option key={value}>{value}</option>)}</select><select value={filters.priority ?? ''} onChange={(e) => set('priority', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All priorities</option>{priorities.map((value) => <option key={value}>{value}</option>)}</select>{includeDepartment && <select value={filters.department ?? ''} onChange={(e) => set('department', e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">All departments</option>{departments.map((value) => <option key={value}>{value}</option>)}</select>}<div className="flex gap-2"><button className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Apply</button><button type="button" onClick={reset} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Reset</button></div></form>
}
