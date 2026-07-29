import type { ComplaintPriority, ComplaintStatus } from '../../types/complaint'

const statusClass: Record<ComplaintStatus, string> = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  Assigned: 'bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300',
  'In Progress': 'bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300',
  Resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
}
const priorityClass: Record<ComplaintPriority, string> = {
  Low: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  Urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  Critical: 'bg-red-200 text-red-900 dark:bg-red-500/25 dark:text-red-200',
}
export function StatusBadge({ status }: { status: ComplaintStatus }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[status]}`}>{status}</span> }
export function PriorityBadge({ priority }: { priority: ComplaintPriority }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass[priority]}`}>{priority}</span> }
