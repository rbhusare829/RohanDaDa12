import { useLayout } from '@/lib/layout'
import { SocialIcon } from '../ui/SocialIcon'
import { socialLabels } from '@/lib/social'

/**
 * Floating Left Social Dock (Supriya Sule style):
 * Fixed along the left edge of the screen on desktop with circular social icons.
 */
export function FloatingSocialBar() {
  const { settings } = useLayout()
  const social = Object.entries(settings.social ?? {}).filter(([k, v]) => v && k !== 'id')

  if (!social.length) return null

  return (
    <aside
      aria-label="Social links"
      className="fixed left-3 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-2.5"
    >
      {social.map(([k, v]) => (
        <a
          key={k}
          href={v as string}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={socialLabels[k] ?? k}
          className="group grid size-10 place-items-center rounded-full bg-white text-[#000d3d] shadow-[0_4px_14px_rgba(0,0,0,0.15)] border border-stone-200/80 transition-all duration-300 hover:scale-110 hover:bg-[#000d3d] hover:text-white active:scale-95"
        >
          <SocialIcon name={k === 'whatsappChannel' ? 'whatsapp' : k} className="size-4.5 transition-transform group-hover:scale-110" />
        </a>
      ))}
    </aside>
  )
}
