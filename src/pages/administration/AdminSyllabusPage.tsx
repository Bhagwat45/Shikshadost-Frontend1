import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookMarked, Plus, Search, Trash2, Edit3, UploadCloud,
  FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCcw, Layers, Download
} from 'lucide-react'
import { syllabusService, type SyllabusItem } from '../../services/syllabus'
import { Card, PageHeader, Badge, Button, Modal, Skeleton } from '../../components/ui'
import toast from 'react-hot-toast'

export default function AdminSyllabusPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [semester, setSemester] = useState<number | ''>('')
  const [branch, setBranch] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SyllabusItem | null>(null)

  const [form, setForm] = useState({
    semester: 1,
    branch: 'Computer Science',
    subject: '',
    unit: '',
    topic: '',
    description: '',
    tags: '',
    version: '1.0',
  })

  const [bulkJson, setBulkJson] = useState('')

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin-syllabus', semester, branch, search],
    queryFn: () => syllabusService.list({
      semester: semester || undefined,
      branch: branch || undefined,
      search: search || undefined,
      page_size: 100,
    }),
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => syllabusService.create(data),
    onSuccess: () => {
      toast.success('Syllabus item created')
      queryClient.invalidateQueries({ queryKey: ['admin-syllabus'] })
      setModalOpen(false)
      resetForm()
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to create'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => syllabusService.update(id, data),
    onSuccess: () => {
      toast.success('Syllabus item updated')
      queryClient.invalidateQueries({ queryKey: ['admin-syllabus'] })
      setModalOpen(false)
      setEditingItem(null)
      resetForm()
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => syllabusService.delete(id),
    onSuccess: () => {
      toast.success('Syllabus item deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-syllabus'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to delete'),
  })

  const bulkMutation = useMutation({
    mutationFn: (items: any[]) => syllabusService.bulkUpsert(items),
    onSuccess: (res: any) => {
      toast.success(`Bulk upload complete: ${res.inserted} inserted, ${res.updated} updated`)
      queryClient.invalidateQueries({ queryKey: ['admin-syllabus'] })
      setBulkOpen(false)
      setBulkJson('')
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Bulk import failed'),
  })

  const resetForm = () => {
    setForm({
      semester: 1,
      branch: 'Computer Science',
      subject: '',
      unit: '',
      topic: '',
      description: '',
      tags: '',
      version: '1.0',
    })
  }

  const handleOpenEdit = (item: SyllabusItem) => {
    setEditingItem(item)
    setForm({
      semester: item.semester,
      branch: item.branch,
      subject: item.subject,
      unit: item.unit,
      topic: item.topic,
      description: item.description || '',
      tags: item.tags ? item.tags.join(', ') : '',
      version: item.version || '1.0',
    })
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      semester: Number(form.semester),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleBulkSubmit = () => {
    try {
      const parsed = JSON.parse(bulkJson)
      if (!Array.isArray(parsed)) {
        toast.error('JSON must be an array of syllabus objects')
        return
      }
      bulkMutation.mutate(parsed)
    } catch {
      toast.error('Invalid JSON format')
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Admin Syllabus Manager"
        description="Upload, update, delete, and control syllabus versions across all semesters and branches."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setBulkOpen(true)}>
              <UploadCloud size={16} className="mr-1.5" /> Bulk JSON Upload
            </Button>
            <Button onClick={() => { setEditingItem(null); resetForm(); setModalOpen(true) }}>
              <Plus size={16} className="mr-1.5" /> Add Topic
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics, subjects, units..."
              className="input pl-9"
            />
          </div>
          <select value={semester} onChange={e => setSemester(e.target.value ? Number(e.target.value) : '')} className="input w-auto min-w-[140px]">
            <option value="">All Semesters</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
          </select>
          <input
            value={branch}
            onChange={e => setBranch(e.target.value)}
            placeholder="Filter branch..."
            className="input w-auto min-w-[160px]"
          />
        </div>
      </Card>

      {/* Syllabus Table */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : listData?.items.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No syllabus items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Sem</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Subject & Unit</th>
                  <th className="px-4 py-3">Topic</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {listData?.items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-brand-600">Sem {item.semester}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{item.branch}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.subject}</p>
                      <p className="text-xs text-slate-400">{item.unit}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{item.topic}</p>
                      {item.description && <p className="truncate max-w-xs text-xs text-slate-400">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="purple">{item.version || '1.0'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(item)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                          <Edit3 size={15} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(item.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Single Topic */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Syllabus Topic' : 'Add New Syllabus Topic'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Semester</label>
              <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: Number(e.target.value) }))} className="input mt-1">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Branch</label>
              <input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} required className="input mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Subject Name</label>
              <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required placeholder="e.g. Operating Systems" className="input mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Unit Name</label>
              <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} required placeholder="e.g. Unit 1: Process Management" className="input mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Topic Title</label>
            <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} required placeholder="e.g. CPU Scheduling Algorithms" className="input mt-1" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Description / Overview</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Tags (comma separated)</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="os, cpu, scheduling" className="input mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Version Tag</label>
              <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="1.0" className="input mt-1" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>Save Item</Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal open={bulkOpen} onClose={() => setBulkOpen(false)} title="Bulk JSON Syllabus Upload">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Paste a JSON array containing syllabus items matching schema: <br />
            <code className="text-brand-600">[{"{"}"semester":1, "branch":"CSE", "subject":"Data Structures", "unit":"Unit 1", "topic":"Arrays", "description":""{"}"}]</code>
          </p>
          <textarea
            value={bulkJson}
            onChange={e => setBulkJson(e.target.value)}
            rows={10}
            placeholder="[ ... ]"
            className="input font-mono text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={handleBulkSubmit} loading={bulkMutation.isPending}>Upload Syllabus</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
