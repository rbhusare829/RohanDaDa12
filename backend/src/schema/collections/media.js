import { relationship, text } from '../fields.js'

/**
 * Photos. Every upload is converted to WebP (max 2400px) and gets three smaller copies;
 * a copy is only made when the original is wider than it (small photos are never enlarged).
 */
export const Media = {
  slug: 'media',
  labels: { singular: 'Photo', plural: 'Media' },
  admin: { group: 'Media', description: 'All photos. Uploads are converted to WebP automatically.', defaultColumns: ['filename', 'alt', 'width', 'createdAt'] },
  access: { read: 'mediaTeam', create: 'mediaTeam', update: 'mediaTeam', delete: 'editors' },
  upload: {
    kind: 'image',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    maxSize: 15_000_000,
    resize: { width: 2400, height: 2400 },
    format: { type: 'webp', quality: 82 },
    sizes: [
      { name: 'thumb', width: 480, quality: 78 },
      { name: 'card', width: 960, quality: 80 },
      { name: 'hero', width: 1920, quality: 82 },
    ],
    focalPoint: true,
  },
  fields: [
    text('alt', { localized: true, admin: { description: 'Describe the photo (for accessibility & SEO)' } }),
    text('caption', { localized: true }),
    relationship('folder', 'media-folders', { column: true, admin: { position: 'sidebar' } }),
  ],
}

export const MediaFolders = {
  slug: 'media-folders',
  labels: { singular: 'Folder', plural: 'Media folders' },
  admin: { useAsTitle: 'name', group: 'Media', hidden: true },
  access: { read: 'mediaTeam', create: 'mediaTeam', update: 'mediaTeam', delete: 'editors' },
  fields: [text('name', { required: true })],
}

/** PDFs: profile, reports, e-books */
export const Documents = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  admin: { group: 'Media', description: 'PDFs: profile, reports, e-books', defaultColumns: ['title', 'filename', 'filesize', 'createdAt'] },
  access: { read: 'mediaTeam', create: 'mediaTeam', update: 'mediaTeam', delete: 'editors' },
  upload: { kind: 'file', dir: 'documents', mimeTypes: ['application/pdf'], maxSize: 15_000_000 },
  fields: [text('title', { localized: true })],
}

/** Files attached to public form submissions — never publicly readable */
export const FormUploads = {
  slug: 'form-uploads',
  labels: { singular: 'Form upload', plural: 'Form uploads' },
  admin: { group: 'Inbox', hidden: true, defaultColumns: ['filename', 'filesize', 'createdAt'] },
  access: { read: 'editors', create: 'never', update: 'editors', delete: 'editors' },
  upload: {
    kind: 'file',
    dir: 'private',
    private: true,
    maxSize: 5 * 1024 * 1024,
    mimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
  fields: [],
}

export const mediaCollections = [Media, MediaFolders, Documents, FormUploads]
