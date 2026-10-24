import { createHmac } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { notFound } from './util.js'

/**
 * Where uploaded files live. A key looks like "media-file.webp", "documents/profile.pdf" or "private/cv.pdf".
 *   local  → backend/uploads (served by Express under /uploads; the private/ folder is never served)
 *   s3     → any S3-compatible bucket (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO…), see "Switching to S3" in the README
 *   vercel-blob → Vercel Blob (the default on Vercel when the Blob store is connected): see "Deploying on Vercel" in the README
 */
const safeKey = (key) => {
  const k = String(key).replace(/\\/g, '/')
  if (!k || k.startsWith('/') || k.split('/').some((p) => p === '..' || p === '')) throw new Error(`Unsafe storage key: ${key}`)
  return k
}

const IMMUTABLE = 'public, max-age=31536000, immutable'

function createLocalStorage(cfg) {
  const root = cfg.storage.dir
  const resolve = (key) => {
    const full = path.resolve(root, safeKey(key))
    if (!full.startsWith(root + path.sep)) throw new Error(`Unsafe storage key: ${key}`)
    return full
  }
  return {
    driver: 'local',
    root,
    async put(key, buffer) {
      const file = resolve(key)
      await mkdir(path.dirname(file), { recursive: true })
      await writeFile(file, buffer)
    },
    async remove(key) {
      await rm(resolve(key), { force: true })
    },
    async exists(key) {
      try {
        await stat(resolve(key))
        return true
      } catch {
        return false
      }
    },
    async read(key) {
      const file = resolve(key)
      let info
      try {
        info = await stat(file)
      } catch {
        throw notFound('File not found.')
      }
      return { stream: createReadStream(file), size: info.size }
    },
    url: (key) => `/uploads/${safeKey(key)}`,
  }
}

function createS3Storage(cfg) {
  const { s3 } = cfg.storage
  const client = new S3Client({
    region: s3.region,
    endpoint: s3.endpoint,
    forcePathStyle: s3.forcePathStyle,
    credentials: { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey },
  })
  const objectKey = (key) => (s3.prefix ? `${s3.prefix}/${safeKey(key)}` : safeKey(key))
  const base = s3.publicUrl || (s3.endpoint ? `${s3.endpoint.replace(/\/$/, '')}/${s3.bucket}` : `https://${s3.bucket}.s3.${s3.region}.amazonaws.com`)
  return {
    driver: 's3',
    async put(key, buffer, contentType) {
      const isPrivate = key.startsWith('private/')
      await client.send(
        new PutObjectCommand({
          Bucket: s3.bucket,
          Key: objectKey(key),
          Body: buffer,
          ContentType: contentType || 'application/octet-stream',
          CacheControl: isPrivate ? 'private, max-age=0' : IMMUTABLE,
        }),
      )
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: objectKey(key) }))
    },
    async exists(key) {
      try {
        await client.send(new HeadObjectCommand({ Bucket: s3.bucket, Key: objectKey(key) }))
        return true
      } catch {
        return false
      }
    },
    async read(key) {
      try {
        const res = await client.send(new GetObjectCommand({ Bucket: s3.bucket, Key: objectKey(key) }))
        return { stream: res.Body, size: res.ContentLength, contentType: res.ContentType }
      } catch {
        throw notFound('File not found.')
      }
    },
    url: (key) => `${base}/${s3.prefix ? `${s3.prefix}/` : ''}${safeKey(key)}`,
  }
}

/**
 * Vercel Blob. The store is public (anyone with a file's address can open it), so:
 *   - photos and documents are stored at "<prefix>/<key>" and linked directly, cached for a year
 *   - private files (form attachments, key "private/…") are stored under a folder named by an HMAC of the key, so their
 *     address cannot be guessed; the site only ever serves them to signed-in admins, through the API
 * The public address of the store comes from the token (vercel_blob_rw_<storeId>_…) unless BLOB_PUBLIC_URL is set.
 */
// @vercel/blob is loaded only when this driver is used, so a local setup without it (SQLite + local files) never needs it
let blobModule = null
const loadBlob = async () => (blobModule ??= await import('@vercel/blob'))
const vercelBlobClient = {
  put: async (...a) => (await loadBlob()).put(...a),
  del: async (...a) => (await loadBlob()).del(...a),
  head: async (...a) => (await loadBlob()).head(...a),
  fetch: (...a) => fetch(...a),
}

export function createBlobStorage(cfg, client = vercelBlobClient) {
  const { blob } = cfg.storage
  const storeId = blob.token.match(/^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i)?.[1]?.toLowerCase()
  const base = blob.publicUrl || (storeId ? `https://${storeId}.public.blob.vercel-storage.com` : '')
  if (!base) throw new Error('BLOB_READ_WRITE_TOKEN does not look like a Vercel Blob token (vercel_blob_rw_<store>_…); set BLOB_PUBLIC_URL')
  const pathname = (key) => {
    const k = safeKey(key)
    const p = k.startsWith('private/') ? `private/${createHmac('sha256', blob.token).update(k).digest('hex').slice(0, 32)}/${k.slice(8)}` : k
    return blob.prefix ? `${blob.prefix}/${p}` : p
  }
  const address = (key) => `${base}/${pathname(key).split('/').map(encodeURIComponent).join('/')}`
  const opts = { token: blob.token }
  return {
    driver: 'vercel-blob',
    async put(key, buffer, contentType) {
      const isPrivate = key.startsWith('private/')
      await client.put(pathname(key), buffer, {
        ...opts,
        access: 'public',
        contentType: contentType || 'application/octet-stream',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: isPrivate ? 60 : 31536000,
      })
    },
    async remove(key) {
      try {
        await client.del(address(key), opts)
      } catch {
        /* already gone */
      }
    },
    async exists(key) {
      try {
        await client.head(address(key), opts)
        return true
      } catch {
        return false
      }
    },
    async read(key) {
      const res = await client.fetch(address(key), { cache: 'no-store' })
      if (!res.ok || !res.body) throw notFound('File not found.')
      return { stream: Readable.fromWeb(res.body), size: Number(res.headers.get('content-length')) || undefined, contentType: res.headers.get('content-type') || undefined }
    },
    url: (key) => address(key),
  }
}

export const createStorage = (cfg) =>
  cfg.storage.driver === 's3' ? createS3Storage(cfg) : cfg.storage.driver === 'vercel-blob' ? createBlobStorage(cfg) : createLocalStorage(cfg)
