import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkSession, selectIsAuthReady, selectIsLoggedIn } from './features/auth/slices/authSlice'

import LoginPage        from './features/auth/pages/LoginPage'
import RegisterPage     from './features/auth/pages/RegisterPage'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage'
import MfaPage          from './features/auth/pages/MfaPage'
import WorkspaceSelectPage from './features/workspace/components/WorkspaceSelectPage'
import DashboardPage      from './pages/DashboardPage'
import MeetingsPage       from './features/meetings/pages/MeetingsPage'
import UploadPage         from './features/meetings/pages/UploadPage'
import MeetingDetailPage  from './features/meetings/pages/MeetingDetailPage'
import SettingsPage       from './features/accounts/pages/SettingsPage'
import BillingPage        from './features/billing/pages/BillingPage'
import ChatPage           from './features/rag/pages/ChatPage'
import SearchPage         from './features/search/pages/SearchPage'
import CalendarPage     from './features/meetings/pages/CalendarPage'
import CalendarCallback from './features/meetings/pages/CalendarCallback'
import ActionItemsPage   from './features/meetings/pages/ActionItemsPage'
import AnalyticsPage     from './features/analytics/pages/AnalyticsPage'
import InviteAcceptPage  from './features/accounts/pages/InviteAcceptPage'
import NotificationsPage from './features/notifications/pages/NotificationsPage'
import PrivateRoute       from './components/shared/PrivateRoute'
import { Toaster } from 'react-hot-toast'
import RateLimitToast from './components/shared/RateLimitToast'
import SplashScreen       from './components/shared/SplashScreen'
import ErrorBoundary      from './components/shared/ErrorBoundary'

export default function App() {
  const dispatch    = useDispatch()
  const isAuthReady = useSelector(selectIsAuthReady)
  const isLoggedIn  = useSelector(selectIsLoggedIn)

  useEffect(() => {
    dispatch(checkSession())
  }, [dispatch])

  if (!isAuthReady) {
    return <SplashScreen />
  }

  return (
    <>
      <Toaster position="top-right" />
      <RateLimitToast />
      <ErrorBoundary>
        <Routes>
          <Route path='/login' element={isLoggedIn ? <Navigate to='/workspaces' replace /> : <LoginPage />} />
          <Route path='/register' element={isLoggedIn ? <Navigate to='/workspaces' replace /> : <RegisterPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/mfa/verify' element={<MfaPage />} />
          <Route path='/invites/:code/accept' element={<InviteAcceptPage />} />

          <Route path='/workspaces' element={
            <PrivateRoute requireWorkspace={false}>
              <WorkspaceSelectPage />
            </PrivateRoute>
          } />

          <Route path='/dashboard' element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path='/dashboard/meetings' element={<PrivateRoute><MeetingsPage /></PrivateRoute>} />
          <Route path='/dashboard/meetings/upload' element={<PrivateRoute><UploadPage /></PrivateRoute>} />
          <Route path='/dashboard/meetings/:id' element={<PrivateRoute><MeetingDetailPage /></PrivateRoute>} />
          <Route path='/dashboard/calendar' element={<PrivateRoute><CalendarPage /></PrivateRoute>} />
          <Route path='/dashboard/calendar/callback' element={<PrivateRoute><CalendarCallback /></PrivateRoute>} />
          <Route path='/dashboard/action-items' element={<PrivateRoute><ActionItemsPage /></PrivateRoute>} />
          <Route path='/dashboard/analytics' element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
          <Route path='/dashboard/chat' element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path='/dashboard/search' element={<PrivateRoute><SearchPage /></PrivateRoute>} />
          <Route path='/dashboard/notifications' element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path='/dashboard/settings' element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path='/dashboard/billing' element={<PrivateRoute><BillingPage /></PrivateRoute>} />
          
          <Route path='/' element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
          <Route path='*' element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </ErrorBoundary>
    </>
  )
}