import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import ComplaintForm from './ComplaintForm'
import { complaintService } from '../../services/complaints'
import type { ComplaintDraft } from '../../types/complaint'

export default function NewComplaintPage() { const navigate = useNavigate(); const mutation = useMutation({ mutationFn: complaintService.createComplaint, onSuccess: (complaint) => { toast.success('Complaint submitted successfully'); navigate(`/student/complaints/${complaint.id}`) }, onError: () => toast.error('Unable to submit your complaint.') }); const submit = async (draft: ComplaintDraft) => { await mutation.mutateAsync(draft) }; return <div className="mx-auto max-w-3xl"><Link to="/student/complaints" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600"><ArrowLeftIcon className="h-4 w-4" />My complaints</Link><h1 className="text-3xl font-bold tracking-tight">Submit a complaint</h1><p className="mt-2 mb-7 text-slate-500 dark:text-slate-400">Share the details clearly. You can edit it while its status is pending.</p><ComplaintForm onSubmit={submit} /></div> }
