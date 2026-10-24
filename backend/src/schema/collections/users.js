import { select, text } from '../fields.js'

export const Users = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  admin: { useAsTitle: 'email', group: 'Settings', defaultColumns: ['name', 'email', 'role'] },
  // signing in: 5 wrong passwords lock the account for 10 minutes
  auth: { maxLoginAttempts: 5, lockTimeMs: 10 * 60 * 1000 },
  access: { read: 'selfOrSuperAdmin', create: 'superAdmin', update: 'selfOrSuperAdmin', delete: 'superAdmin' },
  fields: [
    text('name'),
    select(
      'role',
      [
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Editor (content)', value: 'editor' },
        { label: 'Media Uploader', value: 'media-uploader' },
      ],
      { required: true, defaultValue: 'editor', column: true, access: { create: ['super-admin'], update: ['super-admin'] } },
    ),
  ],
}
