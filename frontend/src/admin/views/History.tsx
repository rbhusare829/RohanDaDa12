import { useState } from 'react'
import { History as HistoryIcon, RotateCcw } from 'lucide-react'
import type { Version } from '../api'
import { toApiError } from '../api'
import { useAsync, useAuth } from '../context'
import { formatDate } from '../form'
import { Button, Modal, Pill, Spinner, useToast } from '../ui'

/**
 * The saved versions of a document (the last 20): see when and by whom, and bring an older one back into the form.
 * Restoring only fills the form — nothing changes on the website until the editor saves.
 */
export function HistoryDialog({ open, onClose, load, onRestore }: { open: boolean; onClose: () => void; load: () => Promise<Version[]>; onRestore: (versionId: number, savedAt: string) => Promise<void> }) {
  const { user } = useAuth()
  const toast = useToast()
  const [busy, setBusy] = useState<number | null>(null)
  const list = useAsync(() => (open ? load() : Promise.resolve([] as Version[])), [open])
  const versions = list.data ?? []

  const restore = async (v: Version) => {
    setBusy(v.id)
    try {
      await onRestore(v.id, v.createdAt)
      onClose()
    } catch (e) {
      toast(toApiError(e).message, 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Version history">
      {list.loading && !versions.length ? (
        <Spinner />
      ) : list.error ? (
        <p className="text-danger" role="alert">{list.error}</p>
      ) : !versions.length ? (
        <p className="py-6 text-center text-charcoal-800/70"><HistoryIcon className="mx-auto mb-2 size-6" aria-hidden />No earlier versions yet. Every save is kept here (the last 20).</p>
      ) : (
        <ul className="divide-y divide-charcoal-900/10">
          {versions.map((v, i) => (
            <li key={v.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{formatDate(v.createdAt, true)} {i === 0 && <span className="ml-1 text-[0.78rem] font-normal text-charcoal-800/75">(latest save)</span>}</p>
                <p className="text-[0.82rem] text-charcoal-800/75">{v.userId == null ? 'By the system' : v.userId === user?.id ? 'By you' : `By user #${v.userId}`}</p>
              </div>
              {v.status && <Pill tone={v.status}>{v.status}</Pill>}
              <Button size="sm" onClick={() => void restore(v)} loading={busy === v.id} disabled={busy !== null && busy !== v.id}>
                <RotateCcw className="size-3.5" /> Restore
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
