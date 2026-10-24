import {
  array, blocks, checkbox, date, email, group, linkFields, number, seoTab, tabs, text, textarea, upload,
} from './fields.js'
import { homeBlocks } from './blocks.js'

const access = { read: 'public', update: 'editors' }

export const SiteSettings = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: { group: 'Settings' },
  access,
  fields: [
    tabs([
      {
        label: 'General',
        fields: [
          text('siteName', { localized: true, required: true, defaultValue: 'रोहन सुभाष देशमुख' }),
          textarea('tagline', { localized: true }),
          upload('logoLight', 'media', { admin: { description: 'Logo for dark backgrounds' } }),
          upload('logoDark', 'media', { admin: { description: 'Logo for light backgrounds' } }),
          upload('defaultShareImage', 'media'),
          upload('profilePdf', 'documents', { admin: { description: 'Profile PDF (Biography download)' } }),
        ],
      },
      {
        label: 'Contact & social',
        fields: [
          text('phone'),
          email('email'),
          textarea('address', { localized: true }),
          text('whatsappNumber', { admin: { description: 'For click-to-chat button, digits only with country code, e.g. 918208737624' } }),
          group('social', [
            text('facebook'),
            text('instagram'),
            text('twitter'),
            text('youtube'),
            text('linkedin'),
            text('whatsappChannel'),
            text('telegram'),
          ]),
        ],
      },
      {
        label: 'Forms',
        fields: [
          // staff addresses are not exposed on the public API
          text('formNotifyEmails', { hasMany: true, access: { read: ['super-admin', 'editor'] }, admin: { description: 'Default recipients for all form submissions' } }),
          textarea('formConsentText', { localized: true }),
        ],
      },
    ]),
  ],
}

/** Menu items: up to three levels (children → subItems) */
const navItem = (depth) => {
  const base = [
    text('label', { localized: true, required: true }),
    text('url', { admin: { description: 'Leave empty for a heading-only item' } }),
    checkbox('newTab', { defaultValue: false }),
  ]
  if (depth >= 3) return base
  return [
    ...base,
    array(depth === 1 ? 'children' : 'subItems', navItem(depth + 1), {
      labels: { singular: depth === 1 ? 'Sub-item' : 'Third-level item', plural: depth === 1 ? 'Sub-items' : 'Third-level items' },
      admin: { initCollapsed: true },
    }),
  ]
}

export const Header = {
  slug: 'header',
  label: 'Menu (header)',
  admin: { group: 'Settings', description: 'Main mega-menu — up to 3 levels' },
  access,
  fields: [array('nav', navItem(1), { admin: { initCollapsed: true } })],
}

export const Footer = {
  slug: 'footer',
  label: 'Footer',
  admin: { group: 'Settings' },
  access,
  fields: [
    array('columns', [text('title', { localized: true, required: true }), array('links', linkFields)], { maxRows: 4 }),
    array('legalLinks', linkFields),
    text('copyright', { localized: true }),
    text('developerCredit'),
    text('developerUrl'),
  ],
}

export const Home = {
  slug: 'home',
  label: 'Homepage',
  admin: { group: 'Content', description: 'Drag sections to reorder, tick "hidden" to hide one', preview: '/' },
  access,
  versions: 20,
  fields: [tabs([{ label: 'Sections', fields: [blocks('sections', homeBlocks, { admin: { initCollapsed: true } })] }, seoTab])],
}

export const Popup = {
  slug: 'popup',
  label: 'Site popup',
  admin: { group: 'Settings', description: 'Optional popup shown once per visit' },
  access,
  fields: [
    checkbox('enabled', { defaultValue: false }),
    upload('image', 'media'),
    text('title', { localized: true }),
    textarea('text', { localized: true }),
    text('linkLabel', { localized: true }),
    text('linkUrl'),
    date('startDate'),
    date('endDate'),
    number('delaySeconds', { defaultValue: 2 }),
  ],
}

export const globals = [SiteSettings, Header, Footer, Home, Popup]
