import { DataTypes } from 'sequelize'
import { collections, flatFields, tableName } from '../schema/index.js'

const { INTEGER, STRING, TEXT, BOOLEAN, DATE, DOUBLE } = DataTypes

/** A JSON document kept in one long TEXT column (portable: works the same on SQLite and every MySQL / MariaDB version) */
const jsonColumn = (name, dialect) => ({
  type: dialect === 'mysql' ? TEXT('long') : TEXT, // MySQL needs LONGTEXT for big documents; SQLite and PostgreSQL have one unlimited TEXT type
  allowNull: false,
  get() {
    const raw = this.getDataValue(name)
    if (!raw) return {}
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  },
  set(value) {
    this.setDataValue(name, JSON.stringify(value ?? {}))
  },
})

/** Database column for a field that is kept in its own column (`column: true`) */
function columnFor(field) {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'select':
      if (field.hasMany) throw new Error(`Field "${field.name}": lists cannot have their own column`)
      return { type: STRING(field.maxLength || 255), allowNull: true, unique: Boolean(field.unique) }
    case 'textarea':
      return { type: TEXT, allowNull: true }
    case 'number':
      return { type: field.integer ? INTEGER : DOUBLE, allowNull: true }
    case 'checkbox':
      return { type: BOOLEAN, allowNull: true }
    case 'date':
      return { type: DATE, allowNull: true }
    case 'upload':
    case 'relationship':
      if (field.hasMany) throw new Error(`Field "${field.name}": lists cannot have their own column`)
      return { type: INTEGER, allowNull: true }
    default:
      throw new Error(`Field "${field.name}" (${field.type}) cannot have its own column`)
  }
}

/** Columns every upload collection has */
const uploadColumns = (upload) => ({
  filename: { type: STRING(255), allowNull: false, unique: true },
  mimeType: { type: STRING(120), allowNull: true },
  filesize: { type: INTEGER, allowNull: true },
  ...(upload.kind === 'image'
    ? { width: { type: INTEGER, allowNull: true }, height: { type: INTEGER, allowNull: true }, focalX: { type: DOUBLE, allowNull: true }, focalY: { type: DOUBLE, allowNull: true } }
    : {}),
})

const userColumns = {
  email: { type: STRING(255), allowNull: false, unique: true },
  passwordHash: { type: STRING(255), allowNull: false },
  loginAttempts: { type: INTEGER, allowNull: false, defaultValue: 0 },
  lockUntil: { type: DATE, allowNull: true },
}

/** Names of the columns that hold promoted fields + built-ins, per collection (used to split rows and documents) */
export const columnNames = {}

export function buildModels(sequelize) {
  const models = {}
  const dialect = sequelize.getDialect()

  for (const c of collections) {
    const attributes = {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      data: jsonColumn('data', dialect),
    }
    const indexes = []
    const promoted = []

    if (c.drafts) {
      attributes._status = { type: STRING(16), allowNull: false, defaultValue: 'published' }
      indexes.push({ fields: ['_status'] })
      promoted.push('_status')
    }
    if (c.upload) {
      Object.assign(attributes, uploadColumns(c.upload))
      promoted.push(...Object.keys(uploadColumns(c.upload)))
    }
    if (c.auth) {
      Object.assign(attributes, userColumns)
      promoted.push('email', 'passwordHash', 'loginAttempts', 'lockUntil')
    }
    for (const f of flatFields(c.fields)) {
      if (!f.column) continue
      attributes[f.name] = columnFor(f)
      promoted.push(f.name)
      if (!f.unique && ['select', 'number', 'date', 'upload', 'relationship', 'checkbox'].includes(f.type)) indexes.push({ fields: [f.name] })
    }

    columnNames[c.slug] = promoted
    models[c.slug] = sequelize.define(c.slug, attributes, { tableName: tableName(c.slug), timestamps: true, indexes })
  }

  /** Singletons (site settings, menu, footer, homepage, popup) — one row each */
  const globalModel = sequelize.define(
    'global',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: STRING(80), allowNull: false, unique: true },
      data: jsonColumn('data', dialect),
    },
    { tableName: 'globals', timestamps: true },
  )

  /** Older saved copies of documents (the last N edits of pages, posts, initiatives and the homepage) */
  const versionModel = sequelize.define(
    'version',
    {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      kind: { type: STRING(16), allowNull: false },
      slug: { type: STRING(80), allowNull: false },
      docId: { type: INTEGER, allowNull: true },
      status: { type: STRING(16), allowNull: true },
      userId: { type: INTEGER, allowNull: true },
      data: jsonColumn('data', dialect),
    },
    { tableName: 'versions', timestamps: true, updatedAt: false, indexes: [{ fields: ['kind', 'slug', 'docId'] }] },
  )

  return { models, globalModel, versionModel }
}
