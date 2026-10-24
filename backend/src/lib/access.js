/**
 * Who may do what. Rules are named in the schema ("editors", "publishedOrAuth"…) and resolved here.
 *
 * resolve() answers with
 *   { allowed: false }                      nobody of this kind
 *   { allowed: true }                       everything
 *   { allowed: true, where: {…} }           only documents matching the constraint (e.g. published ones)
 */
export const ROLE_GROUPS = {
  editors: ['super-admin', 'editor'],
  mediaTeam: ['super-admin', 'editor', 'media-uploader'],
  superAdmin: ['super-admin'],
}

export const hasRole = (user, roles) => Boolean(user && roles.includes(user.role))

export function resolve(rule, user, collection) {
  switch (rule) {
    case 'public':
      return { allowed: true }
    case 'auth':
      return { allowed: Boolean(user) }
    case 'never':
    case undefined:
    case null:
      return { allowed: false }
    case 'publishedOrAuth':
      return user ? { allowed: true } : { allowed: true, where: publishedConstraint(collection) }
    case 'selfOrSuperAdmin':
      if (!user) return { allowed: false }
      return user.role === 'super-admin' ? { allowed: true } : { allowed: true, where: { id: { equals: user.id } } }
    default:
      return { allowed: hasRole(user, ROLE_GROUPS[rule] ?? []) }
  }
}

/** Visitors only see published documents; scheduled posts appear once their publish date has passed */
export function publishedConstraint(collection) {
  const where = { _status: { equals: 'published' } }
  if (collection?.drafts?.schedule) {
    return { and: [where, { or: [{ publishedAt: { exists: false } }, { publishedAt: { less_than_equal: new Date().toISOString() } }] }] }
  }
  return where
}

/** Field-level rule: `access: { read: ['super-admin', 'editor'] }`; no rule = everyone */
export const fieldAllowed = (field, op, user) => {
  const roles = field.access?.[op]
  return !roles || hasRole(user, roles)
}

/** What the signed-in user may do with a collection (sent to the admin so it can hide buttons) */
export function permissionsFor(collection, user) {
  const can = (op) => {
    const r = resolve(collection.access?.[op], user, collection)
    return r.allowed
  }
  return { read: can('read'), create: can('create'), update: can('update'), delete: can('delete') }
}
