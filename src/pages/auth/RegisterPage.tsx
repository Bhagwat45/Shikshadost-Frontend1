import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import type { RegisterPayload } from '../../types/auth'
import { AuthShell, Field } from './LoginPage'

/** Extract a human-readable message from any Axios/FastAPI error */
function extractErrorMessage(error: any): string {
  const detail = error?.response?.data?.detail
  if (!detail) return 'Unable to create account'
  // Pydantic 422 returns an array of validation errors
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d.msg ?? String(d)).join(', ')
  }
  return String(detail)
}

const PASSWORD_PATTERN = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/

export default function RegisterPage() {
  const { register: createAccount } = useAuth()
  const navigate = useNavigate()
  const [authError, setAuthError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterPayload>({ defaultValues: { role: 'student' } })

  const password = watch('password', '')

  const submit = async (data: RegisterPayload) => {
    setAuthError(null)
    try {
      const user = await createAccount(data)
      toast.success('Account created successfully')
      navigate(`/${user.role}/dashboard`, { replace: true })
    } catch (error: any) {
      const msg = extractErrorMessage(error)
      setAuthError(msg)
      toast.error(msg)
    }
  }

  // Show individual requirement checks in real time
  const reqs = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Symbol (e.g. @, #, !)', ok: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <AuthShell title="Create your account" subtitle="Join your university's trusted support space">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {authError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
            {authError}
          </div>
        )}
        <Field label="Full name" error={errors.name?.message}>
          <input
            autoComplete="name"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Use at least 2 characters' },
            })}
          />
        </Field>

        <Field label="University email" error={errors.email?.message}>
          <input
            type="email"
            autoComplete="email"
            {...register('email', { required: 'Email is required' })}
          />
        </Field>

        <input type="hidden" {...register('role')} />

        <div>
          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Use at least 8 characters' },
                validate: (value) =>
                  PASSWORD_PATTERN.test(value) ||
                  'Use upper/lower case, number, and symbol',
              })}
            />
          </Field>
          {/* Live password requirements checklist */}
          {password.length > 0 && (
            <ul className="mt-2 space-y-1">
              {reqs.map((r) => (
                <li
                  key={r.label}
                  className={`flex items-center gap-1.5 text-xs ${
                    r.ok
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <span>{r.ok ? '✓' : '○'}</span>
                  {r.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
        Already registered?{' '}
        <Link className="font-semibold text-brand-600" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}
