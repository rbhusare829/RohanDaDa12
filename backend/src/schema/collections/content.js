import {
  array, checkbox, counterArray, date, email, number, publishedDate, relationship, richText, select, seoTab, slugField,
  tabs, text, textarea, upload,
} from '../fields.js'

/** Same 7 groups as lokmangalfoundation.com/projects (Senior Citizens and Youth are kept for older entries) */
export const INITIATIVE_CATEGORIES = [
  { label: 'अन्न व पोषण / Food & Nutrition', value: 'food' },
  { label: 'जल व शेती / Water & Agriculture', value: 'agriculture' },
  { label: 'शिक्षण / Education', value: 'education' },
  { label: 'आरोग्य / Healthcare', value: 'health' },
  { label: 'सामाजिक कल्याण / Social Welfare', value: 'community' },
  { label: 'महिला व रोजगार / Women & Employment', value: 'women' },
  { label: 'संस्कृती व पर्यावरण / Culture & Environment', value: 'culture' },
  { label: 'ज्येष्ठ नागरिक / Senior Citizens', value: 'senior-citizens' },
  { label: 'युवा व रोजगार / Youth & Employment', value: 'youth' },
]

export const ALBUM_CATEGORIES = [
  { label: 'कार्यक्रम / Events', value: 'events' },
  { label: 'सामाजिक कार्य / Social Work', value: 'social' },
  { label: 'राजकीय / Political', value: 'political' },
  { label: 'जनसंपर्क / Public Connect', value: 'public' },
]

const publicAccess = { read: 'public', create: 'editors', update: 'editors', delete: 'editors' }
const mediaTeamAccess = { read: 'public', create: 'mediaTeam', update: 'mediaTeam', delete: 'editors' }

export const Initiatives = {
  slug: 'initiatives',
  labels: { singular: 'Initiative', plural: 'Initiatives' },
  admin: { useAsTitle: 'title', group: 'Social Work', defaultColumns: ['title', 'heroImage', 'category', 'featured', '_status'], preview: '/social-work/{slug}' },
  drafts: true,
  versions: 20,
  publicRead: true,
  defaultSort: 'order',
  access: { read: 'publishedOrAuth', create: 'editors', update: 'editors', delete: 'editors' },
  fields: [
    text('title', { localized: true, required: true }),
    slugField(),
    select('category', INITIATIVE_CATEGORIES, { required: true, column: true, admin: { position: 'sidebar' } }),
    select(
      'organisation',
      [
        { label: 'लोकमंगल फाऊंडेशन', value: 'foundation' },
        { label: 'लोकमंगल परिवार', value: 'parivar' },
        { label: 'विश्वमंगल', value: 'vishwamangal' },
      ],
      { defaultValue: 'foundation', admin: { position: 'sidebar' } },
    ),
    checkbox('featured', { defaultValue: false, column: true, admin: { position: 'sidebar', description: 'Show on homepage' } }),
    number('order', { defaultValue: 10, column: true, integer: true, admin: { position: 'sidebar' } }),
    text('stat', {
      label: 'Key impact',
      localized: true,
      admin: { description: 'One short line shown on the card, e.g. "500 Beneficiaries" or "48 Ceremonies | 3,221 Couples Married"' },
    }),
    textarea('excerpt', { localized: true }),
    textarea('objective', { label: 'Objective (उद्दिष्ट)', localized: true, admin: { description: 'Shown in a highlighted box below the cover photo' } }),
    upload('heroImage', 'media'),
    richText('body', { localized: true }),
    counterArray('counters', 'Impact counters (beneficiaries, years, locations)'),
    upload('gallery', 'media', { hasMany: true }),
    text('youtubeUrl'),
    array(
      'videos',
      [
        text('url', { label: 'YouTube link', required: true }),
        text('title', { localized: true }),
      ],
      { label: 'More videos', admin: { description: 'Extra YouTube videos shown under the main video' } },
    ),
    relationship('relatedPosts', 'posts', { hasMany: true }),
    tabs([seoTab]),
  ],
}

export const Events = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    useAsTitle: 'title',
    group: 'Social Work',
    defaultColumns: ['title', 'coverImage', 'initiative'],
    description: 'Recurring events with year-wise galleries (e.g. Samudayik Vivah)',
    preview: '/events/{slug}',
  },
  publicRead: true,
  access: publicAccess,
  fields: [
    text('title', { localized: true, required: true }),
    slugField(),
    relationship('initiative', 'initiatives', { column: true, admin: { position: 'sidebar' } }),
    upload('coverImage', 'media'),
    textarea('description', { localized: true }),
    select(
      'group',
      [
        { label: 'Youth & Education / युवा व शिक्षण', value: 'youth' },
        { label: 'Sports / क्रीडा', value: 'sports' },
      ],
      { column: true, admin: { position: 'sidebar', description: 'Section on the Lokmangal Foundation → कार्यक्रम tab' } },
    ),
    text('tagline', { localized: true, admin: { description: 'Short line under the title, e.g. "A stage for thousands of young talents"' } }),
    textarea('body', { label: 'About this event', localized: true }),
    array(
      'facts',
      [text('label', { localized: true, required: true }), text('value', { localized: true, required: true })],
      {
        label: 'Key facts',
        labels: { singular: 'Fact', plural: 'Facts' },
        admin: { description: 'e.g. Year → 2011, Solapur · Partner → Solapur University' },
      },
    ),
    array(
      'editions',
      [
        number('year', { required: true, integer: true }),
        text('title', { localized: true }),
        textarea('text', { localized: true }),
        upload('images', 'media', { hasMany: true }),
      ],
      { labels: { singular: 'Year', plural: 'Years' }, admin: { description: 'Optional: year-wise photo galleries' } },
    ),
  ],
}

export const Categories = {
  slug: 'categories',
  labels: { singular: 'Category', plural: 'Categories' },
  admin: { useAsTitle: 'title', group: 'Blog' },
  publicRead: true,
  access: publicAccess,
  fields: [text('title', { localized: true, required: true }), slugField()],
}

export const Posts = {
  slug: 'posts',
  labels: { singular: 'Post', plural: 'Posts' },
  admin: { useAsTitle: 'title', group: 'Blog', defaultColumns: ['title', 'coverImage', 'publishedAt', '_status'], preview: '/blog/{slug}' },
  drafts: { schedule: true },
  versions: 20,
  publicRead: true,
  defaultSort: '-publishedAt',
  access: { read: 'publishedOrAuth', create: 'editors', update: 'editors', delete: 'editors' },
  fields: [
    text('title', { localized: true, required: true }),
    text('subtitle', { localized: true }),
    slugField(),
    publishedDate,
    text('author', { localized: true, defaultValue: 'रोहन देशमुख', admin: { position: 'sidebar' } }),
    relationship('categories', 'categories', { hasMany: true, admin: { position: 'sidebar' } }),
    text('tags', { hasMany: true, admin: { position: 'sidebar' } }),
    upload('coverImage', 'media'),
    textarea('excerpt', { localized: true }),
    richText('content', { localized: true }),
    tabs([seoTab]),
  ],
}

export const Albums = {
  slug: 'albums',
  labels: { singular: 'Album', plural: 'Albums' },
  admin: {
    useAsTitle: 'title',
    group: 'Media',
    defaultColumns: ['title', 'cover', 'category', 'date'],
    description: 'Photo Gallery albums. Use bulk upload in Media, then pick the photos here.',
    preview: '/media/photos/{slug}',
  },
  publicRead: true,
  defaultSort: '-date',
  access: mediaTeamAccess,
  fields: [
    text('title', { localized: true, required: true }),
    slugField(),
    select('category', ALBUM_CATEGORIES, { defaultValue: 'events', column: true, admin: { position: 'sidebar' } }),
    date('date', { column: true, dayOnly: true, admin: { position: 'sidebar' } }),
    upload('cover', 'media'),
    textarea('description', { localized: true }),
    upload('photos', 'media', { hasMany: true, required: true }),
  ],
}

export const Videos = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos' },
  admin: { useAsTitle: 'title', group: 'Media', defaultColumns: ['title', 'playlist', 'publishedAt'] },
  publicRead: true,
  defaultSort: '-publishedAt',
  access: mediaTeamAccess,
  fields: [
    text('title', { localized: true, required: true }),
    text('youtubeUrl', { required: true }),
    text('playlist', { localized: true, admin: { description: 'Category / playlist name, e.g. "लोकमंगल फाऊंडेशन"' } }),
    checkbox('featured', { defaultValue: false }),
    publishedDate,
  ],
}

export const DownloadPhotos = {
  slug: 'download-photos',
  labels: { singular: 'Official photo', plural: 'Official photos (download)' },
  /* removed from the website (Oct 2026); data kept */
  admin: { hidden: true, useAsTitle: 'title', group: 'Media', description: 'High-resolution official photos for media use', defaultColumns: ['title', 'image', 'credit'] },
  access: { read: 'editors', create: 'mediaTeam', update: 'mediaTeam', delete: 'editors' },
  fields: [text('title', { localized: true, required: true }), upload('image', 'media', { required: true }), text('credit')],
}

export const Quotes = {
  slug: 'quotes',
  labels: { singular: 'Thought / Quote', plural: 'Thoughts / Quotes' },
  admin: { hidden: true, useAsTitle: 'text', group: 'About', defaultColumns: ['text', 'image', 'category', 'publishedAt'] },
  defaultSort: '-publishedAt',
  access: { read: 'editors', create: 'mediaTeam', update: 'mediaTeam', delete: 'editors' },
  fields: [
    textarea('text', { localized: true, required: true, admin: { description: 'The quote text (also used when no image is uploaded)' } }),
    upload('image', 'media', { admin: { description: 'Designed quote graphic (optional)' } }),
    select(
      'category',
      [
        { label: 'प्रेरणा / Inspiration', value: 'inspiration' },
        { label: 'समाजसेवा / Service', value: 'service' },
        { label: 'नवभारत / New India', value: 'new-india' },
        { label: 'उद्योजकता / Entrepreneurship', value: 'entrepreneurship' },
        { label: 'युवा / Youth', value: 'youth' },
      ],
      { defaultValue: 'inspiration' },
    ),
    publishedDate,
  ],
}

export const LeaderMeetings = {
  slug: 'leader-meetings',
  labels: { singular: 'Meeting with leader', plural: 'Meetings with leaders' },
  admin: { hidden: true, useAsTitle: 'leaderName', group: 'About', defaultColumns: ['leaderName', 'image', 'level', 'date'] },
  defaultSort: '-date',
  access: { read: 'editors', create: 'mediaTeam', update: 'mediaTeam', delete: 'editors' },
  fields: [
    text('leaderName', { localized: true, required: true }),
    upload('image', 'media', { required: true }),
    text('caption', { localized: true }),
    select('level', [{ label: 'National', value: 'national' }, { label: 'State', value: 'state' }, { label: 'Other', value: 'other' }], { defaultValue: 'national' }),
    date('date', { column: true, dayOnly: true }),
  ],
}

export const Awards = {
  slug: 'awards',
  labels: { singular: 'Award', plural: 'Awards' },
  admin: { hidden: true, useAsTitle: 'title', group: 'About', defaultColumns: ['title', 'image', 'year', 'awardingBody'] },
  defaultSort: '-year',
  access: { read: 'editors', create: 'editors', update: 'editors', delete: 'editors' },
  fields: [
    text('title', { localized: true, required: true }),
    number('year', { column: true, integer: true }),
    text('awardingBody', { localized: true }),
    upload('image', 'media'),
    textarea('description', { localized: true }),
  ],
}

export const Offices = {
  slug: 'offices',
  labels: { singular: 'Office', plural: 'Offices' },
  admin: {
    useAsTitle: 'name',
    group: 'Settings',
    defaultColumns: ['name', 'phone', 'email', 'order'],
    description: 'Office locations (Contact page) and who receives form emails',
  },
  publicRead: true,
  defaultSort: 'order',
  access: publicAccess,
  fields: [
    text('name', { localized: true, required: true }),
    textarea('address', { localized: true }),
    text('phone'),
    email('email'),
    // staff addresses are not exposed on the public API
    text('notifyEmails', { hasMany: true, access: { read: ['super-admin', 'editor'] }, admin: { description: 'Form submissions for this office are emailed here' } }),
    text('mapEmbedUrl', { admin: { description: 'Google Maps → Share → Embed a map → copy the src URL' } }),
    number('order', { defaultValue: 10, column: true, integer: true }),
  ],
}

export const Jobs = {
  slug: 'jobs',
  labels: { singular: 'Opening', plural: 'Career openings' },
  admin: { hidden: true, useAsTitle: 'title', group: 'Content', defaultColumns: ['title', 'location', 'active', 'lastDate'] },
  access: { read: 'editors', create: 'editors', update: 'editors', delete: 'editors' },
  fields: [
    text('title', { localized: true, required: true }),
    text('location', { localized: true }),
    select('type', ['full-time', 'part-time', 'internship', 'volunteer'], { defaultValue: 'full-time' }),
    textarea('description', { localized: true }),
    date('lastDate', { dayOnly: true }),
    checkbox('active', { defaultValue: true }),
  ],
}

export const contentCollections = [Initiatives, Events, Categories, Posts, Albums, Videos, DownloadPhotos, Quotes, LeaderMeetings, Awards, Offices, Jobs]
