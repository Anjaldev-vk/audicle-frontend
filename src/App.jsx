import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkSession, selectIsAuthReady, selectIsLoggedIn } from './features/auth/slices/authSlice'

import LoginPage        from './features/auth/pages/LoginPage'
import RegisterPage     from './features/auth/pages/RegisterPage'
import MfaPage          from './features/auth/pages/MfaPage'
import WorkspaceSelectPage from './features/workspace/components/WorkspaceSelectPage'
import DashboardPage      from './pages/DashboardPage'
import MeetingsPage       from './features/meetings/pages/MeetingsPage'
import UploadPage         from './features/meetings/pages/UploadPage'
import MeetingDetailPage  from './features/meetings/pages/MeetingDetailPage'
import SettingsPage       from './features/accounts/pages/SettingsPage'
import ChatPage           from './features/rag/pages/ChatPage'
import SearchPage         from './features/search/pages/SearchPage'
import PrivateRoute       from './components/shared/PrivateRoute'
import { Toaster } from 'react-hot-toast'
import RateLimitToast from './components/shared/RateLimitToast'
import SplashScreen       from './components/shared/SplashScreen'

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
      <Routes>
        <Route path='/login' element={isLoggedIn ? <Navigate to='/workspaces' replace /> : <LoginPage />} />
        <Route path='/register' element={isLoggedIn ? <Navigate to='/workspaces' replace /> : <RegisterPage />} />
        <Route path='/mfa/verify' element={<MfaPage />} />

        <Route path='/workspaces' element={
          <PrivateRoute requireWorkspace={false}>
            <WorkspaceSelectPage />
          </PrivateRoute>
        } />

        <Route path='/dashboard' element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path='/dashboard/meetings' element={<PrivateRoute><MeetingsPage /></PrivateRoute>} />
        <Route path='/dashboard/meetings/upload' element={<PrivateRoute><UploadPage /></PrivateRoute>} />
        <Route path='/dashboard/meetings/:id' element={<PrivateRoute><MeetingDetailPage /></PrivateRoute>} />
        <Route path='/dashboard/chat' element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path='/dashboard/search' element={<PrivateRoute><SearchPage /></PrivateRoute>} />
        <Route path='/dashboard/settings' element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        
        <Route path='/' element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
        <Route path='*' element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </>
  )
}