import { useParams } from 'react-router'
import { admin } from '../api'
import { useAsync, useSchema } from '../context'
import { Spinner, Unavailable } from '../ui'
import { DocumentEditor } from './DocumentEditor'

/** /admin/collections/:slug/create and /admin/collections/:slug/:id */
export function EditView() {
  const { slug = '', id } = useParams()
  const { collection } = useSchema()
  const def = collection(slug)
  const loaded = useAsync(() => (id ? admin.get(slug, id) : Promise.resolve(null)), [slug, id])

  if (!def || !def.permissions.read) return <Unavailable title="Not found">There is nothing called “{slug}” that you may open.</Unavailable>
  if (!id) {
    if (!def.permissions.create) return <Unavailable title="Not allowed">Your account may not add new items here.</Unavailable>
    return <DocumentEditor key={`${slug}:new`} collection={def} doc={null} />
  }
  if (loaded.error) return <Unavailable title="Could not open this" retry={loaded.reload}>{loaded.error}</Unavailable>
  // the previous document stays in `loaded` for a moment after the address changes: wait for the right one
  if (!loaded.data || String(loaded.data.id) !== id) return <Spinner />
  return <DocumentEditor key={`${slug}:${id}`} collection={def} doc={loaded.data} />
}
