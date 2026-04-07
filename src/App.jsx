import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SessionProvider } from './context/SessionContext'
import AuthGuard from './components/AuthGuard'
import AdminGuard from './components/AdminGuard'
import BottomNav from './components/BottomNav'
import ConfigError from './components/ConfigError'
import ErrorBoundary from './components/ErrorBoundary'
import PageLoader from './components/PageLoader'
import { isConfigMissing } from './lib/supabase'

// Public pages
const Landing        = lazy(() => import('./pages/Landing'))
const Pricing        = lazy(() => import('./pages/Pricing'))
const Privacy        = lazy(() => import('./pages/Privacy'))
const Terms          = lazy(() => import('./pages/Terms'))

// Auth pages
const Login          = lazy(() => import('./pages/auth/Login'))
const Signup         = lazy(() => import('./pages/auth/Signup'))
const Reset          = lazy(() => import('./pages/auth/Reset'))
const UpdatePassword = lazy(() => import('./pages/auth/UpdatePassword'))

// App pages (protected)
const Dashboard      = lazy(() => import('./pages/Dashboard'))
const ProfileBuilder = lazy(() => import('./pages/ProfileBuilder'))
const ResumeImport   = lazy(() => import('./pages/ResumeImport'))
const JobTailoring   = lazy(() => import('./pages/JobTailoring'))
const ResumeEditor   = lazy(() => import('./pages/ResumeEditor'))
const CoverLetter    = lazy(() => import('./pages/CoverLetter'))
const InterviewPrep  = lazy(() => import('./pages/InterviewPrep'))
const ResumeVersions = lazy(() => import('./pages/ResumeVersions'))
const Settings       = lazy(() => import('./pages/Settings'))
const SessionView    = lazy(() => import('./pages/SessionView'))
const ExtensionPage  = lazy(() => import('./pages/ExtensionPage'))

// Admin pages
const AdminLayout    = lazy(() => import('./pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const LogViewer      = lazy(() => import('./pages/admin/LogViewer'))
const UserManager    = lazy(() => import('./pages/admin/UserManager'))
const UserDetail     = lazy(() => import('./pages/admin/UserDetail'))

export default function App() {
  if (isConfigMissing) {
    return <ConfigError />
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SessionProvider>
          <Suspense fallback={<PageLoader />}>
            <>
              <Routes>
                {/* Public */}
                <Route path="/"                      element={<Landing />} />
                <Route path="/auth/login"            element={<Login />} />
                <Route path="/auth/signup"           element={<Signup />} />
                <Route path="/auth/reset"            element={<Reset />} />
                <Route path="/auth/update-password"  element={<UpdatePassword />} />
                <Route path="/pricing"               element={<Pricing />} />
                <Route path="/privacy"               element={<Privacy />} />
                <Route path="/terms"                 element={<Terms />} />

                {/* Protected /app/* routes */}
                <Route path="/app/dashboard"   element={<AuthGuard><Dashboard /></AuthGuard>} />
                <Route path="/app/profile"     element={<AuthGuard><ProfileBuilder /></AuthGuard>} />
                <Route path="/app/import"      element={<AuthGuard><ResumeImport /></AuthGuard>} />
                <Route path="/app/tailor"      element={<AuthGuard><JobTailoring /></AuthGuard>} />
                <Route path="/app/editor"      element={<AuthGuard><ResumeEditor /></AuthGuard>} />
                <Route path="/app/cover-letter" element={<AuthGuard><CoverLetter /></AuthGuard>} />
                <Route path="/app/interview"   element={<AuthGuard><InterviewPrep /></AuthGuard>} />
                <Route path="/app/session/:id" element={<AuthGuard><SessionView /></AuthGuard>} />
                <Route path="/app/resumes"     element={<AuthGuard><ResumeVersions /></AuthGuard>} />
                <Route path="/app/settings"    element={<AuthGuard><Settings /></AuthGuard>} />
                <Route path="/app/extension"   element={<AuthGuard><ExtensionPage /></AuthGuard>} />
                <Route path="/app"             element={<Navigate to="/app/dashboard" replace />} />

                {/* Admin */}
                <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="logs"      element={<LogViewer />} />
                  <Route path="users"     element={<UserManager />} />
                  <Route path="users/:id" element={<UserDetail />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>

              {/* Mobile bottom navigation */}
              <BottomNav />
            </>
          </Suspense>
        </SessionProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
