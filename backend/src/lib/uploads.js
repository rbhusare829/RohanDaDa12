import { randomBytes } from 'node:crypto'
import path from 'node:path'
import sharp from 'sharp'
import { badRequest, slugify } from './util.js'

/**
 * Upload handling. Files arrive in memory (multer), are checked by what they really are — not by what the
 * browser claims — and are then written through the storage driver (local disk or S3).
 *
 *   photos     decoded and re-encoded as WebP (max 2400px) plus up to three smaller copies;
 *              the re-encoding also strips metadata and anything that is not pixels
 *   documents  PDF / Word / images, recognised by their first bytes
 */

const SIGNATURES = [
  { type: 'application/pdf', ext: '.pdf', test: (b) => b.subarray(0, 5).toString('latin1') === '%PDF-' },
  { type: 'image/jpeg', ext: '.jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: 'image/png', ext: '.png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { type: 'image/webp', ext: '.webp', test: (b) => b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP' },
  { type: 'application/msword', ext: '.doc', test: (b) => b.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) },
  {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ext: '.docx',
    // a .docx is a zip; the word/ folder name appears in its first directory entries
    test: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04 && b.includes('word/'),
  },
]

export const sniffType = (buffer) => SIGNATURES.find((s) => s.test(buffer)) ?? null

const baseName = (originalName) => slugify(path.parse(String(originalName || 'upload')).name).slice(0, 60) || 'upload'

export function createUploads({ storage }) {
  /** the key (folder + file name) of a collection's file */
  const keyFor = (collection, filename) => `${collection.upload.dir ? `${collection.upload.dir}/` : ''}${filename}`

  /** `name`, `name-1`, `name-2`… until no row of the collection uses it */
  async function uniqueFilename(model, base, ext) {
    for (let i = 0; i < 500; i++) {
      const name = `${base}${i ? `-${i}` : ''}${ext}`
      if (!(await model.count({ where: { filename: name } }))) return name
    }
    throw badRequest('Could not find a free file name.')
  }

  /** Writes the (already converted) main image and its smaller copies; removes everything again if one of them fails */
  async function storeImage(collection, filename, data, info, animated) {
    const spec = collection.upload
    const stem = filename.replace(/\.webp$/, '')
    const written = [keyFor(collection, filename)]
    const sizes = {}
    try {
      await storage.put(written[0], data, 'image/webp')
      for (const size of spec.sizes) {
        if (info.width <= size.width || animated) {
          sizes[size.name] = null // never enlarge a small photo
          continue
        }
        const copy = await sharp(data).resize({ width: size.width }).webp({ quality: size.quality }).toBuffer({ resolveWithObject: true })
        const name = `${stem}__${size.name}.webp`
        await storage.put(keyFor(collection, name), copy.data, 'image/webp')
        written.push(keyFor(collection, name))
        sizes[size.name] = { filename: name, width: copy.info.width, height: copy.info.height, mimeType: 'image/webp', filesize: copy.data.length }
      }
    } catch (err) {
      await Promise.all(written.map((k) => storage.remove(k).catch(() => {})))
      throw err
    }
    return { filename, mimeType: 'image/webp', filesize: data.length, width: info.width, height: info.height, focalX: 50, focalY: 50, sizes }
  }

  /** Photo: validate by decoding, convert to WebP, make the smaller copies, store everything */
  async function saveImage(collection, model, file) {
    const spec = collection.upload
    if (!file?.buffer?.length) throw badRequest('No file was uploaded.')
    let meta
    try {
      meta = await sharp(file.buffer, { limitInputPixels: 100_000_000 }).metadata()
    } catch {
      throw badRequest('This file is not a valid image.')
    }
    if (!['jpeg', 'png', 'webp', 'gif', 'avif', 'heif', 'tiff'].includes(meta.format)) throw badRequest('This image format is not supported (use JPG, PNG, WebP or GIF).')

    const animated = meta.format === 'gif' && (meta.pages ?? 1) > 1
    const main = await sharp(file.buffer, { animated, limitInputPixels: 100_000_000 })
      .rotate()
      .resize({ width: spec.resize.width, height: spec.resize.height, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: spec.format.quality })
      .toBuffer({ resolveWithObject: true })
    const filename = await uniqueFilename(model, baseName(file.originalname), '.webp')
    return storeImage(collection, filename, main.data, main.info, animated)
  }

  /** Seeding / importing: an image that already is a WebP photo is stored as it is (no second re-encoding), under its own file name */
  async function ingestImage(collection, { filename, buffer }) {
    const info = await sharp(buffer, { limitInputPixels: 100_000_000 }).metadata().catch(() => null)
    if (!info?.width || info.format !== 'webp') throw badRequest(`"${filename}" is not a WebP image.`)
    return storeImage(collection, filename, buffer, { width: info.width, height: info.height }, false)
  }

  /** Document: recognise the type from its first bytes, check it is allowed for this collection, store it */
  async function saveFile(collection, model, file) {
    const spec = collection.upload
    if (!file?.buffer?.length) throw badRequest('No file was uploaded.')
    if (file.buffer.length > spec.maxSize) throw badRequest(`The file is larger than ${Math.round(spec.maxSize / 1048576)} MB.`)
    const found = sniffType(file.buffer)
    if (!found || !spec.mimeTypes.includes(found.type)) throw badRequest('This file type is not accepted.')
    const base = baseName(file.originalname)
    // files sent in through public forms get an unguessable name
    const suffix = spec.private ? `-${randomBytes(5).toString('hex')}` : ''
    const filename = await uniqueFilename(model, `${base}${suffix}`, found.ext)
    await storage.put(keyFor(collection, filename), file.buffer, found.type)
    return { filename, mimeType: found.type, filesize: file.buffer.length }
  }

  /** Delete a document's original file and its smaller copies */
  async function removeFiles(collection, doc) {
    if (!doc?.filename) return
    const names = [doc.filename, ...Object.values(doc.sizes ?? {}).map((s) => s?.filename)].filter(Boolean)
    await Promise.all(names.map((n) => storage.remove(keyFor(collection, n)).catch(() => {})))
  }

  /** Adds url / thumbnailURL / sizes[*].url to an upload document for the API output */
  function describe(collection, doc) {
    if (!collection.upload || !doc?.filename) return doc
    if (collection.upload.private) return { ...doc, url: `/api/${collection.slug}/file/${encodeURIComponent(doc.filename)}` }
    const out = { ...doc, url: storage.url(keyFor(collection, doc.filename)) }
    if (collection.upload.kind === 'image') {
      const sizes = {}
      for (const s of collection.upload.sizes) {
        const v = doc.sizes?.[s.name]
        sizes[s.name] = v?.filename
          ? { url: storage.url(keyFor(collection, v.filename)), width: v.width, height: v.height, mimeType: v.mimeType, filesize: v.filesize, filename: v.filename }
          : { url: null, width: null, height: null, mimeType: null, filesize: null, filename: null }
      }
      out.sizes = sizes
      out.thumbnailURL = sizes.thumb?.url ?? out.url
    }
    return out
  }

  return { saveImage, ingestImage, saveFile, removeFiles, describe, keyFor }
}
