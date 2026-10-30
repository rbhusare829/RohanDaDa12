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
  labels: { singular: 'संपर्क संदेश (Contact Message)', plural: 'संपर्क संदेश (Contact Messages)' },
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

/** कामाचे निवेदन (Grievance / Work Application) */
export const Grievances = {
  slug: 'grievances',
  labels: { singular: 'कामाचे निवेदन (Grievance)', plural: 'कामाचे निवेदन (Grievances)' },
  admin: { useAsTitle: 'name', group: 'Inbox', defaultColumns: ['referenceNo', 'name', 'mobile', 'subject', 'inConstituency', 'status', 'createdAt'], export: true },
  sqlOnly: true,
  access: inboxAccess,
  reference: { field: 'referenceNo', prefix: 'RD-GR' },
  notify: { label: 'कामाचे निवेदन (grievance)', fields: ['referenceNo', 'name', 'mobile', 'subject', 'description'] },
  fields: [
    text('referenceNo', { column: true, admin: { readOnly: true, position: 'sidebar' } }),
    text('name', { required: true, column: true, admin: { readOnly: true } }),
    text('mobile', { required: true, column: true, admin: { readOnly: true } }),
    select('inConstituency', [{ label: 'होय (Yes)', value: 'yes' }, { label: 'नाही (No)', value: 'no' }], { defaultValue: 'yes', column: true, admin: { readOnly: true } }),
    text('subject', { required: true, column: true, admin: { readOnly: true } }),
    textarea('description', { required: true, column: true, admin: { readOnly: true } }),
    textarea('address', { column: true, admin: { readOnly: true } }),
    email('email', { column: true, admin: { readOnly: true } }),
    upload('attachment', 'form-uploads', { column: true, admin: { readOnly: true } }),
    status,
    notes,
  ],
}

/** भेटीची विनंती / भेटीचे विवरण (Appointment / Meeting Request) */
export const Appointments = {
  slug: 'appointments',
  labels: { singular: 'भेटीची विनंती (Meeting Request)', plural: 'भेटीच्या विनंत्या (Meeting Requests)' },
  admin: { useAsTitle: 'name', group: 'Inbox', defaultColumns: ['referenceNo', 'name', 'mobile', 'preferredDate', 'status', 'createdAt'], export: true },
  sqlOnly: true,
  access: inboxAccess,
  reference: { field: 'referenceNo', prefix: 'RD-AP' },
  notify: { label: 'भेटीची विनंती (meeting request)', fields: ['referenceNo', 'name', 'mobile', 'address', 'reason', 'preferredDate', 'preferredTime'] },
  fields: [
    text('referenceNo', { column: true, admin: { readOnly: true, position: 'sidebar' } }),
    text('name', { required: true, column: true, admin: { readOnly: true } }),
    text('mobile', { required: true, column: true, admin: { readOnly: true } }),
    textarea('address', { required: true, column: true, admin: { readOnly: true } }),
    textarea('reason', { required: true, column: true, admin: { readOnly: true } }),
    text('preferredDate', { column: true, admin: { readOnly: true } }),
    text('preferredTime', { column: true, admin: { readOnly: true } }),
    upload('attachment', 'form-uploads', { column: true, admin: { readOnly: true } }),
    status,
    notes,
  ],
}

/** शुभकार्य आमंत्रण (Invitation) */
export const Invitations = {
  slug: 'invitations',
  labels: { singular: 'शुभकार्य आमंत्रण (Invitation)', plural: 'शुभकार्य आमंत्रणे (Invitations)' },
  admin: { useAsTitle: 'eventTitle', group: 'Inbox', defaultColumns: ['referenceNo', 'organizerName', 'eventTitle', 'eventDate', 'status', 'createdAt'], export: true },
  sqlOnly: true,
  access: inboxAccess,
  reference: { field: 'referenceNo', prefix: 'RD-IN' },
  notify: { label: 'शुभकार्य आमंत्रण (invitation)', fields: ['referenceNo', 'organizerName', 'mobile', 'eventTitle', 'eventDate', 'eventTime', 'location', 'description'] },
  fields: [
    text('referenceNo', { column: true, admin: { readOnly: true, position: 'sidebar' } }),
    text('organizerName', { required: true, column: true, admin: { readOnly: true } }),
    text('mobile', { required: true, column: true, admin: { readOnly: true } }),
    text('eventTitle', { required: true, column: true, admin: { readOnly: true } }),
    text('eventDate', { required: true, column: true, admin: { readOnly: true } }),
    text('eventTime', { column: true, admin: { readOnly: true } }),
    textarea('location', { required: true, column: true, admin: { readOnly: true } }),
    textarea('description', { column: true, admin: { readOnly: true } }),
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

export const inboxCollections = [ContactMessages, Grievances, Appointments, Invitations, JobApplications]
