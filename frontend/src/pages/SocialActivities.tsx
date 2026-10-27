import { Navigate, useLocation } from 'react-router'
import { SOCIAL_ACTIVITIES_PATH } from '@/lib/social-activities'

/**
 * /social-activities (Oct 2026): the Social Activities now live in a tab of the Political Career page — this address forwards there,
 * keeping any #activity, so links made to it earlier still land in the right place.
 */
export default function SocialActivitiesPage() {
  const { hash } = useLocation()
  return <Navigate to={`${SOCIAL_ACTIVITIES_PATH}${hash}`} replace />
}
