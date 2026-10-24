import {
  array, checkbox, counterArray, linkFields, number, relationship, richText, select, text, textarea, upload,
} from './fields.js'

/* ------------------------------------------------------------------ page blocks (Pages → Content tab) */

const common = [
  text('eyebrow', { localized: true, admin: { description: 'Small label above the heading' } }),
  text('heading', { localized: true }),
  checkbox('hidden', { defaultValue: false, admin: { description: 'Hide this block on the site' } }),
]

const block = (slug, singular, plural, fields) => ({ slug, labels: { singular, plural }, fields })

export const pageBlocks = [
  block('content', 'Rich text', 'Rich text', [...common, richText('body', { localized: true })]),
  block('mediaText', 'Image + text', 'Image + text', [
    ...common,
    upload('image', 'media'),
    select('imagePosition', ['left', 'right'], { defaultValue: 'left' }),
    richText('body', { localized: true }),
    array('buttons', linkFields),
  ]),
  block('stats', 'Counters', 'Counters', [...common, counterArray('items', 'Counters')]),
  block('cards', 'Cards', 'Cards', [
    ...common,
    textarea('intro', { localized: true }),
    select('columns', ['2', '3', '4'], { defaultValue: '3' }),
    array('items', [
      text('icon', { admin: { description: 'Not shown on the website (emoji are not used)' } }),
      upload('image', 'media'),
      text('title', { localized: true, required: true }),
      text('meta', { localized: true, admin: { description: 'e.g. "स्थापना: २००२"' } }),
      textarea('text', { localized: true }),
      text('tags', { localized: true, hasMany: true }),
      text('url'),
    ]),
  ]),
  block('gallery', 'Photo gallery', 'Photo galleries', [
    ...common,
    select('layout', ['grid', 'masonry'], { defaultValue: 'grid' }),
    upload('images', 'media', { hasMany: true }),
  ]),
  block('faq', 'FAQ accordion', 'FAQ accordions', [
    ...common,
    array('items', [text('question', { localized: true, required: true }), richText('answer', { localized: true })]),
  ]),
  block('video', 'YouTube video', 'YouTube videos', [
    ...common,
    text('youtubeUrl', { required: true }),
    text('caption', { localized: true }),
  ]),
  block('quote', 'Pull quote', 'Pull quotes', [
    checkbox('hidden', { defaultValue: false }),
    textarea('text', { localized: true, required: true }),
    text('author', { localized: true }),
  ]),
  block('downloads', 'File downloads', 'File downloads', [
    ...common,
    array('files', [text('label', { localized: true, required: true }), upload('file', 'documents', { required: true })]),
  ]),
  block('cta', 'Call to action', 'Calls to action', [
    ...common,
    textarea('text', { localized: true }),
    upload('image', 'media'),
    array('buttons', linkFields),
  ]),
]

/* ------------------------------------------------------------------ home blocks (Homepage → sections) */

const base = [
  checkbox('hidden', { defaultValue: false, admin: { description: 'Hide this section on the homepage' } }),
  text('eyebrow', { localized: true }),
  text('heading', { localized: true }),
]
const buttonUrl = [text('buttonLabel', { localized: true }), text('buttonUrl')]

export const homeBlocks = [
  block('heroSlider', 'Hero slider', 'Hero sliders', [
    checkbox('hidden', { defaultValue: false }),
    select(
      'heroStyle',
      [
        { label: 'With the slide photos', value: 'photo' },
        { label: 'Text only (navy band, no photo)', value: 'text' },
      ],
      {
        label: 'Hero style',
        defaultValue: 'photo',
        admin: { description: 'Switch between the two to compare them (the site does not split visitors by itself).' },
      },
    ),
    upload('photo', 'media', {
      label: 'Single hero photo (not used)',
      admin: { description: 'Kept from the single-photo hero. The current hero is a carousel: each slide shows its own Slide photo (below).' },
    }),
    upload('photoMobile', 'media', {
      label: 'Single hero photo for phones (not used)',
      admin: { description: 'Kept from the single-photo hero; the carousel uses each slide\'s photos.' },
    }),
    number('autoplaySeconds', { defaultValue: 5, min: 3, max: 15 }),
    array(
      'slides',
      [
        upload('image', 'media', {
          label: 'Slide photo',
          admin: { description: 'The photo shown with this slide (4:3 frame). Set the focal point (click the face) so it stays in view. Needed unless the hero style is "Text only".' },
        }),
        upload('imageMobile', 'media', {
          label: 'Slide photo for phones (optional)',
          admin: { description: 'A different photo for phones. If empty, the slide photo is used.' },
        }),
        text('kicker', {
          label: 'Small line above the heading (optional)',
          localized: true,
          admin: { description: 'Short orange line, e.g. रोहन सुभाष देशमुख' },
        }),
        text('heading', { localized: true }),
        textarea('subheading', { localized: true }),
        array('buttons', linkFields, { maxRows: 2, admin: { description: 'Not shown: the carousel has no buttons (Oct 2026). Kept so existing content is not lost.' } }),
      ],
      { minRows: 1, maxRows: 10, admin: { initCollapsed: true } },
    ),
    counterArray('badge', 'Small counter badge (not shown in the current hero design)'),
  ]),
  block('quickLinks', 'Quick links', 'Quick links', [
    ...base,
    array(
      'items',
      [
        select('icon', ['user', 'heart', 'book', 'camera', 'video', 'vote', 'pen', 'phone', 'info', 'flag', 'leaf', 'award'], { defaultValue: 'info' }),
        ...linkFields,
      ],
      { maxRows: 8 },
    ),
  ]),
  block('aboutIntro', 'About block', 'About blocks', [
    ...base,
    upload('image', 'media'),
    textarea('text', { localized: true }),
    textarea('pledge', { localized: true, admin: { description: 'Personal pledge quote' } }),
    counterArray('stats', 'Counters'),
    ...buttonUrl,
  ]),
  block('homeJourney', 'Journey strip', 'Journey strips', [
    ...base,
    array('items', [text('place', { localized: true }), text('title', { localized: true }), textarea('text', { localized: true })], { maxRows: 6 }),
    ...buttonUrl,
  ]),
  block('biography', 'Biography highlights', 'Biography highlights', [
    ...base,
    upload('image', 'media'),
    textarea('intro', { localized: true }),
    array('items', [text('title', { localized: true }), textarea('text', { localized: true }), text('url')]),
  ]),
  block('featuredVideo', 'Featured video', 'Featured videos', [
    ...base,
    text('youtubeUrl', { required: true }),
    textarea('text', { localized: true }),
    array('links', [...linkFields, text('description', { localized: true })], { maxRows: 4 }),
  ]),
  block('workHighlights', 'Work highlights', 'Work highlights', [
    ...base,
    array('items', [upload('image', 'media'), text('title', { localized: true }), textarea('text', { localized: true }), text('url')]),
  ]),
  block('initiativesShowcase', 'Initiatives showcase', 'Initiatives showcases', [
    ...base,
    textarea('intro', { localized: true }),
    relationship('initiatives', 'initiatives', { hasMany: true, admin: { description: 'Leave empty to show featured initiatives automatically' } }),
    counterArray('stats', 'Impact numbers shown above the cards'),
    ...buttonUrl,
  ]),
  block('family', 'Family background', 'Family background', [
    ...base,
    array('members', [
      upload('image', 'media'),
      text('relation', { localized: true }),
      text('name', { localized: true }),
      textarea('text', { localized: true }),
    ]),
    textarea('intro', { localized: true }),
    ...buttonUrl,
  ]),
  block('homeParivar', 'Lokmangal Parivar groups', 'Lokmangal Parivar groups', [
    ...base,
    textarea('text', { localized: true }),
    array(
      'items',
      [text('value', { localized: true, admin: { description: 'Big number, e.g. 4' } }), text('title', { localized: true }), text('text', { localized: true })],
      { maxRows: 8 },
    ),
    ...buttonUrl,
  ]),
  block('homeHighlights', 'Highlight cards', 'Highlight cards', [
    ...base,
    textarea('text', { localized: true }),
    array(
      'items',
      [
        upload('image', 'media', { admin: { description: 'Card photo (landscape, about 16:10)' } }),
        text('tag', { localized: true, admin: { description: 'Small label above the title' } }),
        text('title', { localized: true }),
        textarea('text', { localized: true }),
        text('url'),
      ],
      { maxRows: 6 },
    ),
    ...buttonUrl,
  ]),
  block('homeEvents', 'Events', 'Events', [...base, number('limit', { defaultValue: 4, min: 2, max: 8 }), ...buttonUrl]),
  block('homeVision', 'Vision band', 'Vision bands', [
    ...base,
    upload('image', 'media', { admin: { description: 'Book cover' } }),
    textarea('text', { localized: true }),
    ...buttonUrl,
  ]),
  block('homeGallery', 'Photo strip', 'Photo strips', [...base, upload('images', 'media', { hasMany: true }), ...buttonUrl]),
  block('homeStats', 'Impact counters', 'Impact counters', [...base, upload('image', 'media'), counterArray('items', 'Counters'), ...buttonUrl]),
  block('homeFaq', 'FAQs', 'FAQs', [
    ...base,
    textarea('text', { localized: true }),
    array('items', [text('question', { localized: true, required: true }), richText('answer', { localized: true })]),
    array('buttons', linkFields, { maxRows: 2 }),
  ]),
  block('latestBlog', 'Latest blog posts', 'Latest blog posts', [...base, number('limit', { defaultValue: 3 })]),
  block('socialFeeds', 'Social feeds', 'Social feeds', [
    ...base,
    textarea('text', { localized: true }),
    array('instagramPosts', [text('url', { required: true }), text('title', { localized: true })], {
      admin: { description: 'Instagram post/reel URLs to embed' },
    }),
    checkbox('showFacebook', { defaultValue: true }),
    checkbox('showYoutube', { defaultValue: true, admin: { description: 'Shows latest videos from the Video Gallery' } }),
  ]),
  block('appealBand', 'Appeal band', 'Appeal bands', [
    ...base,
    textarea('text', { localized: true }),
    checkbox('showWhatsapp', { label: 'Show WhatsApp button', defaultValue: true }),
    upload('image', 'media'),
    ...buttonUrl,
  ]),
]
