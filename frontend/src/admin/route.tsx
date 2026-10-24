import '@fontsource/mukta/devanagari-400.css'
import '@fontsource/mukta/devanagari-500.css'
import '@fontsource/mukta/devanagari-600.css'
import '@fontsource/mukta/devanagari-700.css'
import '@fontsource/mukta/latin-400.css'
import '@fontsource/mukta/latin-500.css'
import '@fontsource/mukta/latin-600.css'
import '@fontsource/mukta/latin-700.css'
import './admin.css'
import { useEffect } from 'react'
import { LazyMotion, MotionConfig } from 'motion/react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { AuthProvider, SchemaProvider, useAuth } from './context'
import { AdminLayout } from './layout'
import { Feedback, Spinner, Unavailable } from './ui'
import { Account } from './views/Account'
import { ForgotPasswordView, LoginView, ResetPasswordView } from './views/Auth'
import { Dashboard } from './views/Dashboard'
import { EditView } from './views/EditView'
import { GlobalView } from './views/GlobalView'
import { ListView } from './views/ListView'

/** The animation features load after the first paint (see motion-features.ts) */
const loadMotion = () => import('@/lib/motion-features').then((m) => m.default)

/** Everything behind the sign-in: wait for the session, send visitors to the login page, then load the content schema */
function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()
  if (status === 'loading') return <Spinner />
  if (status === 'out') return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  return (
    <SchemaProvider>
      <AdminLayout />
    </SchemaProvider>
  )
}

/** The admin panel — its own app inside the website, loaded only when someone opens /admin */
export function Component() {
  useEffect(() => {
    const previous = document.title
    document.title = 'Admin — Rohan Deshmukh'
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <div className="admin-root">
      <LazyMotion features={loadMotion} strict>
        {/* people who ask for less motion get fades only: nothing slides in or out */}
        <MotionConfig reducedMotion="user">
          <Feedback>
            <AuthProvider>
              <Routes>
                <Route path="login" element={<LoginView />} />
                <Route path="forgot-password" element={<ForgotPasswordView />} />
                <Route path="reset-password" element={<ResetPasswordView />} />
                <Route element={<RequireAuth />}>
                  <Route index element={<Dashboard />} />
                  <Route path="collections/:slug" element={<ListView />} />
                  <Route path="collections/:slug/create" element={<EditView />} />
                  <Route path="collections/:slug/:id" element={<EditView />} />
                  <Route path="globals/:slug" element={<GlobalView />} />
                  <Route path="account" element={<Account />} />
                  <Route path="*" element={<Unavailable title="Page not found">There is nothing at this address in the admin.</Unavailable>} />
                </Route>
              </Routes>
            </AuthProvider>
          </Feedback>
        </MotionConfig>
      </LazyMotion>
    </div>
  )
}
