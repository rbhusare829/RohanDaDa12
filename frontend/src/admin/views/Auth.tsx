import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { admin, toApiError } from '../api'
import { useAuth } from '../context'
import { Button, inputClass } from '../ui'

/** The card all the sign-in screens share: navy background, the "रो" mark, a short welcome */
function Frame({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-[#3b2a35] p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-700 font-display text-2xl text-white">रो</span>
          <div className="leading-tight">
            <p className="font-display text-[1.3rem] text-charcoal-900">रोहन सुभाष देशमुख</p>
            <p className="text-[0.82rem] text-charcoal-800/75">Website admin panel</p>
          </div>
        </div>
        <h1 className="mt-6 font-display text-[1.6rem] text-charcoal-900">{title}</h1>
        <p className="mt-1 text-[0.92rem] text-charcoal-800/70">{intro}</p>
        <div className="mt-5">{children}</div>
      </div>
    </main>
  )
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.88rem] font-semibold text-charcoal-900">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.78rem] text-charcoal-800/75">{hint}</span>}
    </label>
  )
}

export function LoginView() {
  const { status, login } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  // after signing in, go back to where the person was heading (an /admin address only)
  const from = (location.state as { from?: string } | null)?.from
  const target = from?.startsWith('/admin') && !from.startsWith('/admin/login') ? from : '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  if (status === 'in') return <Navigate to={target} replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      navigate(target, { replace: true })
    } catch (err) {
      setError(toApiError(err).message)
      setBusy(false)
    }
  }
  return (
    <Frame title="Sign in" intro="नमस्कार 🙏 Sign in to manage the website content.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        {params.get('expired') && !error && <p className="rounded-lg bg-saffron-50 px-3 py-2 text-[0.88rem] text-saffron-700" role="status">Your session ended. Please sign in again.</p>}
        <Field label="Email"><input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoFocus /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} /></Field>
        {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-[0.88rem] text-danger" role="alert">{error}</p>}
        <Button type="submit" variant="primary" loading={busy} className="w-full">Sign in</Button>
        <p className="text-center text-[0.88rem]"><Link to="/admin/forgot-password" className="text-charcoal-800 underline underline-offset-4 hover:text-saffron-700">Forgot password?</Link></p>
      </form>
    </Frame>
  )
}

export function ForgotPasswordView() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      setDone((await admin.forgotPassword(email)).message)
    } catch (err) {
      setError(toApiError(err).message)
    }
    setBusy(false)
  }
  return (
    <Frame title="Forgot your password?" intro="Enter your e-mail address and we will send you a link to choose a new one.">
      {done ? (
        <p className="rounded-lg bg-leaf-50 px-3 py-3 text-[0.92rem] text-leaf-600" role="status">{done}</p>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email"><input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoFocus /></Field>
          {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-[0.88rem] text-danger" role="alert">{error}</p>}
          <Button type="submit" variant="primary" loading={busy} className="w-full">Send the link</Button>
        </form>
      )}
      <p className="mt-4 text-center text-[0.88rem]"><Link to="/admin/login" className="text-charcoal-800 underline underline-offset-4 hover:text-saffron-700">Back to sign in</Link></p>
    </Frame>
  )
}

export function ResetPasswordView() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { reload } = useAuth()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [again, setAgain] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== again) return setError('The two passwords are not the same.')
    setBusy(true)
    setError(null)
    try {
      await admin.resetPassword(token, password)
      await reload()
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(toApiError(err).message)
      setBusy(false)
    }
  }
  return (
    <Frame title="Choose a new password" intro="Use at least 8 characters.">
      {!token ? (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-[0.88rem] text-danger" role="alert">This link is not complete. Ask for a new one.</p>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="New password"><input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoFocus /></Field>
          <Field label="New password again"><input type="password" autoComplete="new-password" value={again} onChange={(e) => setAgain(e.target.value)} className={inputClass} /></Field>
          {error && <p className="rounded-lg bg-danger-soft px-3 py-2 text-[0.88rem] text-danger" role="alert">{error}</p>}
          <Button type="submit" variant="primary" loading={busy} className="w-full">Save the password</Button>
        </form>
      )}
      <p className="mt-4 text-center text-[0.88rem]"><Link to="/admin/forgot-password" className="text-charcoal-800 underline underline-offset-4 hover:text-saffron-700">Ask for a new link</Link></p>
    </Frame>
  )
}
