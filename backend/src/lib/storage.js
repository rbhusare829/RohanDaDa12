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
  const clientConfig = {
    region: s3.region,
    endpoint: s3.endpoint,
    forcePathStyle: s3.forcePathStyle,
  }
  // If explicit credentials are provided, use them; otherwise let AWS SDK automatically use the EC2 IAM Instance Role / credential chain
  if (s3.accessKeyId && s3.secretAccessKey) {
    clientConfig.credentials = { accessKeyId: s3.accessKeyId, secretAccessKey: s3.secretAccessKey }
  }
  const client = new S3Client(clientConfig)
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

export const createStorage = (cfg) =>
  cfg.storage.driver === 's3' ? createS3Storage(cfg) : createLocalStorage(cfg)
