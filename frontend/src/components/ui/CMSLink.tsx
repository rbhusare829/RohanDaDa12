import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { isExternal } from '@/lib/utils'

type Props = { url?: string | null; newTab?: boolean | null; className?: string; children: ReactNode; 'aria-label'?: string; tabIndex?: number; onClick?: () => void }

/** A link from the CMS: a page of this site (client-side navigation), another site, e-mail or phone */
export function CMSLink({ url, newTab, className, children, ...rest }: Props) {
  if (!url) return <span className={className}>{children}</span>
  if (isExternal(url) || url.startsWith('mailto:') || url.startsWith('tel:') || newTab)
    return (
      <a href={url} className={className} target={isExternal(url) || newTab ? '_blank' : undefined} rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    )
  return (
    <Link to={url} className={className} {...rest}>
      {children}
    </Link>
  )
}
