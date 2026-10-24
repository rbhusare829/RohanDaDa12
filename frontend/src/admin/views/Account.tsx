import { useState, type FormEvent, type ReactNode } from 'react'
import { admin, toApiError } from '../api'
import { useAuth } from '../context'
import { Button, Card, PageHeading, inputClass, useToast } from '../ui'

const ROLES: Record<string, string> = {
  'super-admin': 'Super admin — everything, including people and settings',
  editor: 'Editor — pages, posts, photos and messages',
  'media-uploader': 'Media uploader — photos and documents',
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.88rem] font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[0.78rem] text-charcoal-800/75">{hint}</span>}
    </label>
  )
}

/** /admin/account — the signed-in person's own name and password */
export function Account() {
  const { user, reload } = useAuth()
  const toast = useToast()

  const [name, setName] = useState(user?.name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  if (!user) return null

  const saveName = async (e: FormEvent) => {
    e.preventDefault()
    setSavingName(true)
    setNameError(null)
    try {
      await admin.update('users', user.id, { name: name.trim() })
      await reload()
      toast('Your name is saved.')
    } catch (err) {
      setNameError(toApiError(err).message)
    }
    setSavingName(false)
  }

  const savePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    if (next.length < 8) return setPasswordError('Use at least 8 characters for the new password.')
    if (next !== again) return setPasswordError('The two new passwords are not the same.')
    setSavingPassword(true)
    try {
      await admin.changePassword(current, next)
      setCurrent('')
      setNext('')
      setAgain('')
      toast('Your password has been changed.')
    } catch (err) {
      setPasswordError(toApiError(err).message)
    }
    setSavingPassword(false)
  }

  return (
    <div className="max-w-2xl">
      <PageHeading title="My account" description="Your name and your password." />
      <div className="space-y-6">
        <Card>
          <h2 className="mb-4 font-display text-[1.25rem]">About you</h2>
          <form onSubmit={saveName} className="space-y-4" noValidate>
            <Row label="Name" hint="Shown in the menu and next to what you save.">
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" className={inputClass} />
            </Row>
            <Row label="Email">
              <input value={user.email} readOnly className={inputClass} />
            </Row>
            <p className="text-[0.88rem] text-charcoal-800/70">{ROLES[user.role] ?? user.role}</p>
            {nameError && <p className="rounded-lg bg-danger-soft px-3 py-2 text-[0.88rem] text-danger" role="alert">{nameError}</p>}
            <Button type="submit" variant="primary" loading={savingName} disabled={name.trim() === (user.name ?? '')}>Save name</Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-[1.25rem]">Change password</h2>
          <form onSubmit={savePassword} className="space-y-4" noValidate>
            <Row label="Current password">
              <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={inputClass} />
            </Row>
            <Row label="New password" hint="At least 8 characters. A few random words make a strong one.">
              <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" className={inputClass} />
            </Row>
            <Row label="New password again">
              <input type="password" value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" className={inputClass} />
            </Row>
            {passwordError && <p className="rounded-lg bg-danger-soft px-3 py-2 text-[0.88rem] text-danger" role="alert">{passwordError}</p>}
            <Button type="submit" variant="primary" loading={savingPassword} disabled={!current || !next}>Change password</Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
