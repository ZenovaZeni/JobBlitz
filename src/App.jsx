import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SessionProvider } from './context/SessionContext'
import AuthGuard from './components/AuthGuard'
import BottomNav from './components/BottomNav'

// Public pages
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import Pricing from './pages/Pricing'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'

// App pages (protected)
import Dashboard from './pages/Dashboard'
import ProfileBuilder from './pages/ProfileBuilder'
import ResumeImport from './pages/ResumeImport'
import JobTailoring from './pages/JobTailoring'
import ResumeEditor from './pages/ResumeEditor'
import CoverLetter from './pages/CoverLetter'
import InterviewPrep from './pages/InterviewPrep'
import ResumeVersions from './pages/ResumeVersions'
import Settings from './pages/Settings'
import SessionView from './pages/SessionView'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import LogViewer from './pages/admin/LogViewer'
import UserManager from './pages/admin/UserManager'
import AdminGuard from './components/AdminGuard'
import DevLogin from './pages/DevLogin'

export default function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* Protected /app/* routes */}
            <Route path="/app/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/app/profile" element={<AuthGuard><ProfileBuilder /></AuthGuard>} />
            <Route path="/app/import" element={<AuthGuard><ResumeImport /></AuthGuard>} />
            <Route path="/app/tailor" element={<AuthGuard><JobTailoring /></AuthGuard>} />
            <Route path="/app/editor" element={<AuthGuard><ResumeEditor /></AuthGuard>} />
            <Route path="/app/cover-letter" element={<AuthGuard><CoverLetter /></AuthGuard>} />
            <Route path="/app/interview" element={<AuthGuard><InterviewPrep /></AuthGuard>} />
            <Route path="/app/session/:id" element={<AuthGuard><SessionView /></AuthGuard>} />
            <Route path="/app/resumes" element={<AuthGuard><ResumeVersions /></AuthGuard>} />
            <Route path="/app/settings" element={<AuthGuard><Settings /></AuthGuard>} />
            <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />

            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="logs" element={<LogViewer />} />
              <Route path="users" element={<UserManager />} />
            </Route>

            {/* Dev Only Verification Bypass */}
            <Route path="/dev-login" element={<DevLogin />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          {/* Mobile bottom navigation — only visible on small screens */}
          <BottomNav />
        </>
      </SessionProvider>
    </AuthProvider>
  )
}
