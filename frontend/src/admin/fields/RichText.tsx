import { useEffect, useRef, useState } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Minus, Quote, Redo2, Strikethrough, Underline as UnderlineIcon, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { plain } from '../schema'
import { MediaPicker } from './MediaPicker'
import type { MediaDoc } from './docs'
import { useField } from './useField'

/** Photos in an article: lazy-loaded, with their size (so the page does not jump while they load) */
const ArticleImage = Image.extend({
  addAttributes() {
    return { ...this.parent?.(), loading: { default: 'lazy' }, decoding: { default: 'async' } }
  },
})

function Tool({ label, active, disabled, onClick, children }: { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn('grid size-8 place-items-center rounded-md transition disabled:opacity-30', active ? 'bg-charcoal-900 text-white' : 'text-charcoal-800 hover:bg-charcoal-900/[0.08]')}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor, onImage }: { editor: Editor; onImage: () => void }) {
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('Link address (https://…, mailto:… or tel:…). Leave empty to remove the link.', previous ?? 'https://')
    if (url === null) return
    if (url.trim() === '') editor.chain().focus().extendMarkRange('link').unsetLink().run()
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim(), target: /^https?:/.test(url) ? '_blank' : null }).run()
  }
  const sep = <span aria-hidden className="mx-1 h-5 w-px bg-charcoal-900/15" />
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-charcoal-900/15 bg-charcoal-900/[0.03] px-2 py-1.5" role="toolbar" aria-label="Text formatting">
      <Tool label="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="size-4" /></Tool>
      <Tool label="Sub-heading" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="size-4" /></Tool>
      {sep}
      <Tool label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-4" /></Tool>
      <Tool label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-4" /></Tool>
      <Tool label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="size-4" /></Tool>
      <Tool label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="size-4" /></Tool>
      {sep}
      <Tool label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-4" /></Tool>
      <Tool label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-4" /></Tool>
      <Tool label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="size-4" /></Tool>
      <Tool label="Divider line" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="size-4" /></Tool>
      {sep}
      <Tool label="Link" active={editor.isActive('link')} onClick={setLink}><Link2 className="size-4" /></Tool>
      <Tool label="Photo" onClick={onImage}><ImagePlus className="size-4" /></Tool>
      <span className="ml-auto flex gap-0.5">
        <Tool label="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="size-4" /></Tool>
        <Tool label="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="size-4" /></Tool>
      </span>
    </div>
  )
}

/**
 * The text editor (TipTap) for articles, page text and answers. It stores clean HTML — the same HTML the website shows,
 * and the backend cleans it again before saving.
 */
export function RichTextControl({ name, id }: { name: string; id: string }) {
  const [value, setValue] = useField<string | null>(name)
  const [pickPhoto, setPickPhoto] = useState(false)
  // the last HTML this editor produced: a different value coming from the form (a restored version, a reset) replaces the content
  const emitted = useRef<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } },
      }),
      ArticleImage,
    ],
    content: value ?? '',
    editorProps: { attributes: { id, role: 'textbox', 'aria-multiline': 'true', 'aria-labelledby': `${id}-label`, class: 'prose-rd min-h-48 max-h-[34rem] overflow-y-auto px-4 py-3 outline-none' } },
    onUpdate: ({ editor: e }) => {
      const html = e.isEmpty ? '' : e.getHTML()
      emitted.current = html
      setValue(html)
    },
  })

  useEffect(() => {
    if (!editor) return
    const incoming = value ?? ''
    if (incoming !== emitted.current && incoming !== (editor.isEmpty ? '' : editor.getHTML())) {
      editor.commands.setContent(incoming, { emitUpdate: false })
      emitted.current = incoming
    }
  }, [editor, value])

  if (!editor) return <div className="h-48 animate-pulse rounded-lg bg-charcoal-900/[0.05]" />
  return (
    <div className="overflow-hidden rounded-lg border border-field bg-white focus-within:border-saffron-700 focus-within:ring-2 focus-within:ring-saffron-700">
      <Toolbar editor={editor} onImage={() => setPickPhoto(true)} />
      <EditorContent editor={editor} />
      <MediaPicker
        open={pickPhoto}
        onClose={() => setPickPhoto(false)}
        selected={[]}
        onPick={([doc]) => {
          const m = doc as MediaDoc
          const src = m.sizes?.hero?.url || m.url
          if (src) editor.chain().focus().setImage({ src, alt: plain(m.alt), width: m.width, height: m.height }).run()
        }}
      />
    </div>
  )
}
