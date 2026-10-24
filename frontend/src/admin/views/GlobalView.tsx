import { useParams } from 'react-router'
import { admin } from '../api'
import { useAsync, useSchema } from '../context'
import { Spinner, Unavailable } from '../ui'
import { DocumentEditor } from './DocumentEditor'

/** /admin/globals/:slug — a settings page with one set of values (Homepage, Menu, Footer, Site settings, Popup) */
export function GlobalView() {
  const { slug = '' } = useParams()
  const { global } = useSchema()
  const def = global(slug)
  const loaded = useAsync(async () => ({ slug, doc: await admin.getGlobal(slug) }), [slug])

  if (!def || !def.permissions.read) return <Unavailable title="Not found">There is no settings page called “{slug}” that you may open.</Unavailable>
  if (loaded.error) return <Unavailable title="Could not open this" retry={loaded.reload}>{loaded.error}</Unavailable>
  if (!loaded.data || loaded.data.slug !== slug) return <Spinner />
  return <DocumentEditor key={slug} global={def} doc={loaded.data.doc} />
}
