import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ReadMore } from './ReadMore'

/**
 * Rich text from the CMS. The backend stores it as HTML that it has already cleaned (scripts, event handlers and
 * unsafe links removed, see backend/src/lib/sanitize.js), so it can be shown directly.
 * With `anchors`, h2/h3 get ids `sec-1`, `sec-2`… in order (the same order as `articleHeadings()` in lib/blog.ts,
 * used by the article's "key points" box).
 * With `readMore`, long text is shortened on phones behind a "Read more" button (see ReadMore).
 */
export function RichText({ html, className, anchors, readMore }: { html?: string | null; className?: string; anchors?: boolean; readMore?: boolean }) {
  const content = useMemo(() => {
    if (!html || !html.trim()) return ''
    if (!anchors) return html
    let n = 0
    return html.replace(/<(h[23])>/g, (_, tag: string) => `<${tag} id="sec-${++n}" class="scroll-mt-8">`)
  }, [html, anchors])
  if (!content) return null
  const body = <div className={cn('prose-rd', className)} dangerouslySetInnerHTML={{ __html: content }} />
  return readMore ? <ReadMore>{body}</ReadMore> : body
}
