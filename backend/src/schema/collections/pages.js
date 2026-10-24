import { blocks, checkbox, number, select, seoTab, tabs, text, textarea, upload } from '../fields.js'
import { pageBlocks } from '../blocks.js'

export const SECTIONS = [
  { label: 'About', value: 'about' },
  { label: 'Lokmangal', value: 'lokmangal' },
  { label: 'Campaign (not used)', value: 'constituency' },
  { label: 'Political Career', value: 'political' },
  { label: 'Vision / Appeal', value: 'vision' },
  { label: 'Engagement', value: 'engage' },
  { label: 'Legal', value: 'legal' },
  { label: 'Other', value: 'other' },
]

export const Pages = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['title', 'path', 'section', '_status', 'updatedAt'],
    description: 'Content pages (Family Background, Lokmangal Parivar, Privacy Policy…)',
    preview: '{path}',
  },
  drafts: true,
  versions: 20,
  publicRead: true,
  access: { read: 'publishedOrAuth', create: 'editors', update: 'editors', delete: 'editors' },
  fields: [
    text('title', { localized: true, required: true }),
    text('path', {
      required: true,
      unique: true,
      column: true,
      normalize: 'path',
      admin: { position: 'sidebar', description: 'Page URL, e.g. /about/biography' },
    }),
    select('section', SECTIONS, {
      defaultValue: 'other',
      column: true,
      admin: { position: 'sidebar', description: 'Pages in the same section are listed in the side menu' },
    }),
    number('menuOrder', { defaultValue: 10, column: true, integer: true, admin: { position: 'sidebar' } }),
    checkbox('showSideMenu', { defaultValue: true, admin: { position: 'sidebar' } }),
    tabs([
      { label: 'Banner', fields: [textarea('subtitle', { localized: true }), upload('bannerImage', 'media')] },
      { label: 'Content', fields: [blocks('layout', pageBlocks, { admin: { initCollapsed: true } })] },
      seoTab,
    ]),
  ],
}
