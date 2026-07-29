import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import type { LoginPayload } from '../../types/auth'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [authError, setAuthError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginPayload>()

  const submit = async (data: LoginPayload) => {
    setAuthError(null)
    console.log('Login attempt started:', data.email)
    try {
      const user = await login(data)
      console.log('Login success:', user)
      toast.success(`Welcome back, ${user.name}`)
      navigate(
        (location.state as { from?: string })?.from ??
          `/${user.role}/dashboard`,
        { replace: true }
      )
    } catch (error: any) {
      console.error('Login error details:', error)
      console.error('Login error response data:', error?.response?.data)
      const detail = error?.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg ?? String(d)).join(', ')
        : (detail ?? 'Unable to sign in')
      setAuthError(msg)
      toast.error(msg)
    }
  }
  return <AuthShell title="Welcome back" subtitle="Sign in to access your ShikshaDost workspace"><form onSubmit={handleSubmit(submit)} className="space-y-4">{authError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">{authError}</div>}<Field label="University email" error={errors.email?.message}><input type="email" autoComplete="email" {...register('email', { required: 'Email is required' })} /></Field><Field label="Password" error={errors.password?.message}><input type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} /></Field><button disabled={isSubmitting} className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white disabled:opacity-60">{isSubmitting ? 'Signing in…' : 'Sign in'}</button></form><p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">New to ShikshaDost? <Link className="font-semibold text-brand-600" to="/register">Create an account</Link></p></AuthShell> }
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <main className="grid min-h-screen place-items-center p-5"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"><Link to="/" className="text-xl font-bold text-brand-600">ShikshaDost</Link><h1 className="mt-8 text-2xl font-bold">{title}</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p><div className="mt-7">{children}</div></section></main> }
export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="block text-sm font-medium">{label}<div className="mt-1 [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-slate-300 [&_input]:bg-transparent [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-sm [&_input]:focus:border-brand-500 dark:[&_input]:border-slate-700">{children}</div>{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label> }
