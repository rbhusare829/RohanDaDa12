import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { lexicalToHtml, convertBundle } from '../src/seed/payload-convert.js'
import { matches, parseWhere, parseSort, sortDocs } from '../src/lib/query.js'
import { pickLocale } from '../src/lib/localize.js'
import { slugify, normalizePath } from '../src/lib/util.js'
import { sanitizeRichText, htmlToText } from '../src/lib/sanitize.js'
import { toCsv } from '../src/lib/csv.js'
import { sniffType } from '../src/lib/uploads.js'

describe('query language', () => {
  const docs = [
    { id: 1, title: 'Alpha', tags: ['a', 'b'], n: 5, at: '2026-01-01T00:00:00.000Z', empty: null },
    { id: 2, title: 'beta', tags: [], n: 10, at: '2026-06-01T00:00:00.000Z', empty: 'x' },
  ]
  const find = (where) => docs.filter((d) => matches(d, parseWhere(where))).map((d) => d.id)

  it('equals / not_equals / in / not_in', () => {
    assert.deepEqual(find({ id: { equals: '1' } }), [1])
    assert.deepEqual(find({ id: { not_equals: 1 } }), [2])
    assert.deepEqual(find({ id: { in: '1,2' } }), [1, 2])
    assert.deepEqual(find({ id: { not_in: [1] } }), [2])
  })
  it('contains works on lists and on text; like ignores case', () => {
    assert.deepEqual(find({ tags: { contains: 'a' } }), [1])
    assert.deepEqual(find({ title: { like: 'ALP' } }), [1])
    assert.deepEqual(find({ title: { contains: 'ET' } }), [2])
  })
  it('exists treats null, empty text and empty lists as missing', () => {
    assert.deepEqual(find({ empty: { exists: 'true' } }), [2])
    assert.deepEqual(find({ empty: { exists: 'false' } }), [1])
    assert.deepEqual(find({ tags: { exists: true } }), [1])
  })
  it('compares numbers and dates', () => {
    assert.deepEqual(find({ n: { greater_than: '5' } }), [2])
    assert.deepEqual(find({ n: { less_than_equal: 5 } }), [1])
    assert.deepEqual(find({ at: { greater_than_equal: '2026-03-01T00:00:00.000Z' } }), [2])
  })
  it('and / or nest, and a bare value means equals', () => {
    assert.deepEqual(find({ or: [{ id: { equals: 1 } }, { n: { equals: 10 } }] }), [1, 2])
    assert.deepEqual(find({ and: [{ n: { greater_than: 1 } }, { or: [{ title: 'beta' }] }] }), [2])
  })
  it('refuses absurd nesting', () => {
    let w = { id: 1 }
    for (let i = 0; i < 9; i++) w = { and: [w] }
    assert.throws(() => parseWhere(w), /too deeply/)
  })
  it('sorts by several keys, newest first', () => {
    assert.deepEqual(sortDocs(docs, parseSort('-n')).map((d) => d.id), [2, 1])
    assert.deepEqual(sortDocs(docs, parseSort('title', '-id'), 'en').map((d) => d.id), [1, 2])
  })
  it('records that tie follow the direction of the sort: newest first puts the newer record first', () => {
    const same = [{ id: 1, at: 'x' }, { id: 3, at: 'x' }, { id: 2, at: 'x' }]
    assert.deepEqual(sortDocs(same, parseSort('-at')).map((d) => d.id), [3, 2, 1])
    assert.deepEqual(sortDocs(same, parseSort('at')).map((d) => d.id), [1, 2, 3])
  })
  it('with locale=all a condition holds in any language, and sorting uses the requested one', () => {
    const view = [
      { id: 1, title: { en: 'Water', mr: 'पाणी' }, tags: { en: ['a'], mr: [] } },
      { id: 2, title: { en: '', mr: 'शेती' }, tags: { en: [], mr: [] } },
    ]
    const hit = (where) => view.filter((d) => matches(d, parseWhere(where))).map((d) => d.id)
    assert.deepEqual(hit({ title: { like: 'wat' } }), [1])
    assert.deepEqual(hit({ title: { like: 'पाणी' } }), [1])
    assert.deepEqual(hit({ title: { like: 'शेती' } }), [2])
    assert.deepEqual(hit({ tags: { contains: 'a' } }), [1])
    assert.deepEqual(hit({ tags: { exists: 'false' } }), [2])
    // a title with no English falls back to its Marathi text, which sorts after Latin letters
    assert.deepEqual(sortDocs(view, parseSort('title'), 'en').map((d) => d.id), [1, 2])
    assert.deepEqual(sortDocs(view, parseSort('title'), 'mr').map((d) => d.id), [1, 2])
  })
})

describe('languages', () => {
  it('picks a language, falling back to the other one when empty', () => {
    assert.equal(pickLocale({ en: 'Hi', mr: 'नमस्कार' }, 'mr'), 'नमस्कार')
    assert.equal(pickLocale({ en: '', mr: 'फक्त' }, 'en'), 'फक्त')
    assert.equal(pickLocale({ en: null, mr: null }, 'en'), null)
    assert.equal(pickLocale('plain', 'en'), 'plain')
    assert.deepEqual(pickLocale({ en: [], mr: ['x'] }, 'en'), ['x'])
    assert.equal(pickLocale({ en: '<p></p>', mr: 'text' }, 'en'), 'text') // empty HTML counts as empty
  })
})

describe('helpers', () => {
  it('slugify keeps letters, numbers and Devanagari marks', () => {
    assert.equal(slugify('  Hello, World! 2026 '), 'hello-world-2026')
    assert.equal(slugify('सामाजिक कार्य'), 'सामाजिक-कार्य')
    assert.equal(slugify('---a--b---'), 'a-b')
    assert.equal(slugify('x'.repeat(200)).length, 80)
  })
  it('normalizePath', () => {
    assert.equal(normalizePath(' /About/Team/ '), '/about/team')
    assert.equal(normalizePath('///'), '')
  })
  it('sanitizeRichText + htmlToText', () => {
    assert.equal(sanitizeRichText('<p>a<script>x</script></p>'), '<p>a</p>')
    assert.equal(sanitizeRichText('<a href="//evil.example">x</a>'), 'x')
    assert.equal(htmlToText('<p>Tom &amp; Jerry&#39;s</p><p>two</p>'), "Tom & Jerry's two")
  })
  it('toCsv neutralises formulas and quotes', () => {
    assert.equal(toCsv(['a', 'b'], [{ a: '=1+1', b: 'x,"y"' }]), '﻿a,b\r\n\'=1+1,"x,""y"""\r\n')
  })
  it('sniffType recognises documents by their first bytes', () => {
    assert.equal(sniffType(Buffer.from('%PDF-1.7 ...')).type, 'application/pdf')
    assert.equal(sniffType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0])).type, 'image/jpeg')
    assert.equal(sniffType(Buffer.from('PK\x03\x04 ... word/document.xml')).ext, '.docx')
    assert.equal(sniffType(Buffer.from('PK\x03\x04 plain zip')), null)
    assert.equal(sniffType(Buffer.from('<?php')), null)
  })
})

describe('Payload → HTML conversion', () => {
  const t = (text, format = 0) => ({ type: 'text', text, format })
  const p = (...children) => ({ type: 'paragraph', children })
  const root = (...children) => ({ type: 'root', children })
  it('paragraphs, formats, headings, lists, quotes and links', () => {
    const html = lexicalToHtml(
      root(
        { type: 'heading', tag: 'h2', children: [t('Title')] },
        p(t('plain '), t('bold', 1), t(' '), t('both', 3), t('<tag> & "q"')),
        { type: 'list', tag: 'ul', children: [{ type: 'listitem', children: [t('one')] }, { type: 'listitem', children: [t('two')] }] },
        { type: 'list', tag: 'ol', children: [{ type: 'listitem', children: [t('first')] }] },
        { type: 'quote', children: [t('Quoted')] },
        p({ type: 'link', fields: { url: 'https://x.example', newTab: true }, children: [t('link')] }),
        p(),
      ),
    )
    assert.equal(
      html,
      '<h2>Title</h2><p>plain <strong>bold</strong> <em><strong>both</strong></em>&lt;tag&gt; &amp; &quot;q&quot;</p><ul><li>one</li><li>two</li></ul><ol><li>first</li></ol><blockquote><p>Quoted</p></blockquote><p><a href="https://x.example" target="_blank" rel="noopener noreferrer">link</a></p><p><br></p>',
    )
  })
  it('uploads become images (and vanish when the photo is gone)', () => {
    const media = new Map([[7, { filename: 'a b.webp', width: 10, height: 5, alt: 'Alt "text"' }]])
    assert.equal(lexicalToHtml({ type: 'upload', value: 7 }, media), '<figure><img src="/uploads/a%20b.webp" alt="Alt &quot;text&quot;" width="10" height="5" loading="lazy"></figure>')
    assert.equal(lexicalToHtml({ type: 'upload', value: 99 }, media), '')
  })
  it('converts a whole bundle by the schema: language maps, empty {} values, ids, blocks', () => {
    const bundle = {
      collections: {
        media: [{ id: 3, filename: 'x.webp', mimeType: 'image/webp', width: 5, height: 5, alt: {}, caption: { en: 'c', mr: null } }],
        posts: [{ id: 1, title: { en: 'T', mr: 'टी' }, slug: 's', categories: [1], coverImage: 3, meta: { title: {}, description: { en: null, mr: null }, image: { en: 3, mr: null } }, content: { en: { root: root(p(t('Hi'))) }, mr: {} }, _status: 'draft', unknown: 1 }],
        pages: [{ id: 2, title: { en: 'P', mr: null }, path: '/p', layout: [{ id: 'abc', blockType: 'quote', text: { en: 'Q', mr: null }, hidden: false }, { blockType: 'bogus' }] }],
      },
      globals: { popup: { enabled: true, title: {} } },
    }
    const out = convertBundle(bundle)
    assert.deepEqual(out.collections.media[0].alt, { en: null, mr: null })
    const post = out.collections.posts[0]
    assert.equal(post._status, 'draft')
    assert.ok(!('unknown' in post))
    assert.deepEqual(post.content, { en: '<p>Hi</p>', mr: null })
    assert.equal(post.meta.image, 3)
    assert.deepEqual(post.meta.title, { en: null, mr: null })
    assert.deepEqual(out.collections.pages[0].layout, [{ id: 'abc', blockType: 'quote', text: { en: 'Q', mr: null }, hidden: false }])
    assert.deepEqual(out.globals.popup, { enabled: true, title: { en: null, mr: null } })
  })
})
