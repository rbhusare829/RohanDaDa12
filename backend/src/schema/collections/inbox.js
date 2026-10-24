import { email, relationship, select, text, textarea, upload } from '../fields.js'

const status = select(
  'status',
  [
    { label: 'New', value: 'new' },
    { label: 'In progress', value: 'in-progress' },
    { label: 'Resolved', value: 'resolved' },
    { label: 'Spam', value: 'spam' },
  ],
  { defaultValue: 'new', column: true, admin: { position: 'sidebar', cell: 'status' } },
)
const notes = textarea('internalNotes', { column: true, admin: { position: 'sidebar' } })

/**
 * Inbox collections: written only by the public form endpoints, read and managed by editors.
 * Every field has its own column, so lists can be filtered, searched and paged in SQL however large the inbox grows.
 */
const inboxAccess = { read: 'editors', create: 'never', update: 'editors', delete: 'editors' }

export const ContactMessages = {
  slug: 'contact-messages',
  labels: { singular: 'Contact message', plural: 'Contact messages' },
  admin: { useAsTitle: 'name', group: 'Inbox', defaultColumns: ['name', 'mobile', 'subject', 'office', 'status', 'createdAt'], export: true },
  sqlOnly: true,
  access: inboxAccess,
  notify: { label: 'contact message', fields: ['name', 'mobile', 'email', 'subject', 'message'] },
  fields: [
    text('name', { required: true, column: true, admin: { readOnly: true } }),
    text('mobile', { required: true, column: true, admin: { readOnly: true } }),
    email('email', { required: true, column: true, admin: { readOnly: true } }),
    text('subject', { required: true, column: true, admin: { readOnly: true } }),
    relationship('office', 'offices', { column: true, admin: { readOnly: true } }),
    textarea('message', { column: true, admin: { readOnly: true } }),
    upload('attachment', 'form-uploads', { column: true, admin: { readOnly: true } }),
    status,
    notes,
  ],
}

/* removed from the website (Oct 2026); data kept and still readable in the admin */
export const Grievances = {
  slug: 'grievances',
  labels: { singular: 'Grievance / Suggestion', plural: 'Grievances / Suggestions' },
  admin: { hidden: true, useAsTitle: 'name', group: 'Inbox', defaultColumns: ['referenceNo', 'name', 'mobile', 'type', 'status', 'createdAt'], export: true },
  sqlOnly: true,
  access: inboxAccess,
  reference: { field: 'referenceNo', prefix: 'RD' },
  notify: { label: 'grievance / suggestion', fields: ['referenceNo', 'type', 'name', 'mobile', 'email', 'address', 'issue'] },
  fields: [
    text('referenceNo', { column: true, admin: { readOnly: true, position: 'sidebar' } }),
    select('type', [{ label: 'Grievance', value: 'grievance' }, { label: 'Suggestion', value: 'suggestion' }], { defaultValue: 'grievance', column: true, admin: { readOnly: true } }),
    text('name', { required: true, column: true, admin: { readOnly: true } }),
    text('mobile', { required: true, column: true, admin: { readOnly: true } }),
    email('email', { column: true, admin: { readOnly: true } }),
    textarea('address', { required: true, column: true, admin: { readOnly: true } }),
    textarea('issue', { required: true, column: true, admin: { readOnly: true } }),
    upload('attachment', 'form-uploads', { column: true, admin: { readOnly: true } }),
    status,
    notes,
  ],
}

export const JobApplications = {
  slug: 'job-applications',
  labels: { singular: 'Job application', plural: 'Job applications' },
  admin: { hidden: true, useAsTitle: 'name', group: 'Inbox', defaultColumns: ['name', 'mobile', 'job', 'status', 'createdAt'], export: true },
  sqlOnly: true,
  access: inboxAccess,
  notify: { label: 'job application', fields: ['name', 'mobile', 'email', 'message'] },
  fields: [
    relationship('job', 'jobs', { column: true, admin: { readOnly: true } }),
    text('name', { required: true, column: true, admin: { readOnly: true } }),
    text('mobile', { required: true, column: true, admin: { readOnly: true } }),
    email('email', { required: true, column: true, admin: { readOnly: true } }),
    textarea('message', { column: true, admin: { readOnly: true } }),
    upload('cv', 'form-uploads', { column: true, admin: { readOnly: true } }),
    status,
    notes,
  ],
}

export const inboxCollections = [ContactMessages, Grievances, JobApplications]
