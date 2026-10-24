import sanitizeHtml from 'sanitize-html'

/**
 * Rich text is stored as HTML. Everything an editor (or a forged request) sends is cleaned here before it is saved,
 * so the website can render it directly without risk of script injection.
 */
const options = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'hr', 'img', 'figure', 'figcaption'],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    h1: 'h2',
    h5: 'h4',
    h6: 'h4',
    a: (tagName, attribs) => {
      const next = { ...attribs }
      if (attribs.target === '_blank') next.rel = 'noopener noreferrer'
      else {
        delete next.target
        delete next.rel
      }
      return { tagName, attribs: next }
    },
  },
}

/** An <a> that has no href (the sanitiser removed an unsafe address such as javascript:…): keep its text, drop the tag */
const LINK_WITHOUT_ADDRESS = /<a(?![^>]*\shref=)[^>]*>([\s\S]*?)<\/a>/gi

/** Drops unsafe tags, attributes and link targets. (The output is predictable, so the unwrapping is a plain pattern, not an HTML parse.) */
export const sanitizeRichText = (html) => sanitizeHtml(String(html ?? ''), options).replace(LINK_WITHOUT_ADDRESS, '$1').trim()

/** True when the HTML has no text and no image */
export const isEmptyHtml = (html) => typeof html === 'string' && !/<img\b/i.test(html) && html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() === ''

const BLOCK_END = /<\/(p|h[1-6]|li|blockquote|figure|div)>|<br\s*\/?>/gi

/** Plain text of some HTML (for search, reading time and meta descriptions): paragraphs are separated by a space */
export const htmlToText = (html) =>
  sanitizeHtml(String(html ?? '').replace(BLOCK_END, ' '), { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
