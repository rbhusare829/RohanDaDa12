import { useState } from 'react'
import { Check, Share2 } from 'lucide-react'

/** One-tap share: the phone's share sheet where available, otherwise copies the link */
export function QuickShare({ url, title, label }: { url: string; title: string; label: string }) {
  const [done, setDone] = useState(false)
  const onClick = async () => {
    try {
      if (navigator.share) await navigator.share({ title, url })
      else {
        await navigator.clipboard.writeText(url)
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }
    } catch { /* cancelled */ }
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="-my-1.5 grid size-11 place-items-center rounded-full text-muted transition hover:bg-cream hover:text-charcoal-900">
      {done ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
    </button>
  )
}
