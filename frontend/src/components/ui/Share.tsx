import { Link2, Check } from 'lucide-react'
import { useState } from 'react'
import { SocialIcon } from './SocialIcon'

export function Share({ url, title, label, compact }: { url: string; title: string; label: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  const links = [
    { k: 'whatsapp', href: `https://wa.me/?text=${t}%20${u}` },
    { k: 'facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { k: 'twitter', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      {!compact && <span className="mr-1 text-sm font-semibold text-muted">{label}:</span>}
      {links.map((l) => (
        <a key={l.k} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={`${label} — ${l.k}`} className="grid size-11 place-items-center rounded-full bg-paper text-charcoal-900 ring-1 ring-field transition hover:bg-charcoal-900 hover:text-paper hover:ring-transparent">
          <SocialIcon name={l.k} className="size-4" />
        </a>
      ))}
      <button
        type="button"
        aria-label="Copy link"
        onClick={() => navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })}
        className="grid size-11 place-items-center rounded-full bg-paper text-charcoal-900 ring-1 ring-field transition hover:bg-charcoal-900 hover:text-paper hover:ring-transparent"
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </button>
    </div>
  )
}
