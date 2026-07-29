import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ComplaintDashboard from './pages/complaints/ComplaintDashboard'
import ComplaintDetailsPage from './pages/complaints/ComplaintDetailsPage'
import ComplaintListPage from './pages/complaints/ComplaintListPage'
import NewComplaintPage from './pages/complaints/NewComplaintPage'
import { NotFoundPage, UnauthorizedPage } from './pages/StatusPages'
import PlaceholderPage from './pages/student/PlaceholderPage'

/* ── Admin pages (lazy) ─────────────────────────────────────── */
const AdminDashboardPage   = lazy(() => import('./pages/administration/AdminDashboardPage'))
const AnalyticsPage        = lazy(() => import('./pages/administration/AnalyticsPage'))
const ActivityLogsPage     = lazy(() => import('./pages/administration/ActivityLogsPage'))
const DepartmentDetailsPage = lazy(() => import('./pages/administration/DepartmentDetailsPage'))
const DepartmentsPage      = lazy(() => import('./pages/administration/DepartmentsPage'))
const NotificationsPage    = lazy(() => import('./pages/administration/NotificationsPage'))
const ReportsPage          = lazy(() => import('./pages/administration/ReportsPage'))
const SettingsPage         = lazy(() => import('./pages/administration/SettingsPage'))
const StaffDetailsPage     = lazy(() => import('./pages/administration/StaffDetailsPage'))
const StaffPage            = lazy(() => import('./pages/administration/StaffPage'))
const StudentsPage         = lazy(() => import('./pages/administration/StudentsPage'))

/* ── Enterprise pages (lazy) ────────────────────────────────── */
const ChatbotPage = lazy(() =>
  import('./pages/enterprise/EnterprisePages').then(m => ({ default: m.ChatbotPage })),
)
const SlaPage = lazy(() =>
  import('./pages/enterprise/EnterprisePages').then(m => ({ default: m.SlaPage })),
)
const HeatmapPage = lazy(() =>
  import('./pages/enterprise/EnterprisePages').then(m => ({ default: m.HeatmapPage })),
)
const RecommendationsPage = lazy(() =>
  import('./pages/enterprise/EnterprisePages').then(m => ({ default: m.RecommendationsPage })),
)

/* ── New AI & Student Success pages (lazy) ─────────────────── */
const AIChatPage          = lazy(() => import('./pages/ai/AIChatPage'))
const NotesAIPage         = lazy(() => import('./pages/ai/NotesAIPage'))
const FlashcardsPage      = lazy(() => import('./pages/ai/FlashcardsPage'))
const QuizPage            = lazy(() => import('./pages/ai/QuizPage'))
const OCRPage             = lazy(() => import('./pages/ai/OCRPage'))
const VoiceAssistantPage  = lazy(() => import('./pages/ai/VoiceAssistantPage'))
const SyllabusPage        = lazy(() => import('./pages/syllabus/SyllabusPage'))
const DigitalLibraryPage  = lazy(() => import('./pages/library/DigitalLibraryPage'))
const CareerAIPage       = lazy(() => import('./pages/career/CareerAIPage'))
const PlacementPrepPage   = lazy(() => import('./pages/placement/PlacementPrepPage'))
const AdminSyllabusPage   = lazy(() => import('./pages/administration/AdminSyllabusPage'))
const StudentDashboardPage = lazy(() => import('./pages/student/StudentDashboardPage'))

/* ── Loading fallback ────────────────────────────────────────── */
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"            element={<LandingPage />} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/register"    element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ── Student ─────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['student']} />}>
          <Route element={<DashboardLayout />}>
            {/* Core */}
            <Route path="/student/dashboard"       element={<StudentDashboardPage />} />
            <Route path="/student/complaints"      element={<ComplaintListPage role="student" />} />
            <Route path="/student/complaints/new"  element={<NewComplaintPage />} />
            <Route path="/student/complaints/:complaintId" element={<ComplaintDetailsPage role="student" />} />

            {/* AI features */}
            <Route path="/student/chat"        element={<AIChatPage />} />
            <Route path="/student/notes"       element={<NotesAIPage />} />
            <Route path="/student/flashcards"  element={<FlashcardsPage />} />
            <Route path="/student/quiz"        element={<QuizPage />} />
            <Route path="/student/ocr"         element={<OCRPage />} />
            <Route path="/student/voice"       element={<VoiceAssistantPage />} />
            <Route path="/student/syllabus"    element={<SyllabusPage />} />
            <Route path="/student/library"     element={<DigitalLibraryPage />} />
            <Route path="/student/career"      element={<CareerAIPage />} />
            <Route path="/student/placement"   element={<PlacementPrepPage />} />

            {/* Additional student stubs */}
            <Route path="/student/ask-pdf"     element={<PlaceholderPage />} />
            <Route path="/student/planner"     element={<PlaceholderPage />} />
            <Route path="/student/papers"      element={<DigitalLibraryPage />} />
            <Route path="/student/attendance"  element={<PlaceholderPage />} />
            <Route path="/student/results"     element={<PlaceholderPage />} />
            <Route path="/student/notifications" element={<PlaceholderPage />} />
            <Route path="/student/profile"     element={<PlaceholderPage />} />
            <Route path="/student/settings"    element={<PlaceholderPage />} />
          </Route>
        </Route>

        {/* ── Staff ───────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['staff']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/staff/dashboard"                  element={<ComplaintDashboard role="staff" />} />
            <Route path="/staff/complaints"                 element={<ComplaintListPage role="staff" />} />
            <Route path="/staff/complaints/:complaintId"    element={<ComplaintDetailsPage role="staff" />} />
            <Route path="/staff/chat"                       element={<AIChatPage />} />
            <Route path="/staff/profile"                    element={<PlaceholderPage />} />
            <Route path="/staff/settings"                   element={<PlaceholderPage />} />
          </Route>
        </Route>

        {/* ── Admin ───────────────────────────────────────────── */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard"                  element={<AdminDashboardPage />} />
            <Route path="/admin/complaints"                 element={<ComplaintListPage role="admin" />} />
            <Route path="/admin/complaints/:complaintId"    element={<ComplaintDetailsPage role="admin" />} />
            <Route path="/admin/syllabus"                   element={<AdminSyllabusPage />} />
            <Route path="/admin/departments"                element={<DepartmentsPage />} />
            <Route path="/admin/departments/:departmentId"  element={<DepartmentDetailsPage />} />
            <Route path="/admin/staff"                      element={<StaffPage />} />
            <Route path="/admin/staff/:staffId"             element={<StaffDetailsPage />} />
            <Route path="/admin/students"                   element={<StudentsPage />} />
            <Route path="/admin/notifications"              element={<NotificationsPage />} />
            <Route path="/admin/analytics"                  element={<AnalyticsPage />} />
            <Route path="/admin/reports"                    element={<ReportsPage />} />
            <Route path="/admin/sla"                        element={<SlaPage />} />
            <Route path="/admin/heatmap"                    element={<HeatmapPage />} />
            <Route path="/admin/recommendations"            element={<RecommendationsPage />} />
            <Route path="/admin/chat"                       element={<AIChatPage />} />
            <Route path="/admin/logs"                       element={<ActivityLogsPage />} />
            <Route path="/admin/settings"                   element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*"    element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  )
}
