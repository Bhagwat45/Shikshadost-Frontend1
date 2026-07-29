import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ChartItem } from '../../types/administration'

const colorMap: Record<string, string> = { 'bg-brand-500': '#4f46e5', 'bg-violet-500': '#8b5cf6', 'bg-emerald-500': '#10b981', 'bg-orange-500': '#f97316', 'bg-rose-500': '#f43f5e', 'bg-sky-500': '#0ea5e9' }

export default function SimpleBarChart({ title, data, color = 'bg-brand-500' }: { title: string; data: ChartItem[]; color?: string }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold">{title}</h2>{data.length ? <div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} /><XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.12)' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} /><Bar dataKey="value" fill={colorMap[color] ?? colorMap['bg-brand-500']} radius={[6, 6, 0, 0]} maxBarSize={44} /></BarChart></ResponsiveContainer></div> : <p className="mt-5 text-sm text-slate-500">No data available yet.</p>}</section>
}
