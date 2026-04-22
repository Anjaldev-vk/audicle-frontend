import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkSession, selectIsAuthReady, selectIsLoggedIn } from './redux/slices/authSlice'

import LoginPage        from './pages/auth/LoginPage'
import RegisterPage     from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'
import MFAVerifyPage      from './pages/auth/MFAVerifyPage'
import MFASetupPage       from './pages/auth/MFASetupPage'
import AcceptInvitePage   from './pages/auth/AcceptInvitePage'
import DashboardPage      from './pages/dashboard/DashboardPage'
import ProfileSettingsPage from './pages/dashboard/settings/ProfileSettingsPage'
import OrganisationSettingsPage from './pages/dashboard/organisation/OrganisationSettingsPage'
import MembersPage        from './pages/dashboard/organisation/MembersPage'
import PrivateRoute       from './routes/PrivateRoute'
import SplashScreen       from './components/SplashScreen'
import LandingPage        from './pages/landing/LandingPage'

export default function App() {
  const dispatch    = useDispatch()
  const isAuthReady = useSelector(selectIsAuthReady)
  const isLoggedIn  = useSelector(selectIsLoggedIn)

  // check session on every app load
  // this silently refreshes the access token using the HttpOnly cookie
  useEffect(() => {
    dispatch(checkSession())
  }, [dispatch])

  // show splash screen while checking session
  // prevents flicker where logged-in user briefly sees login page
  if (!isAuthReady) {
    return <SplashScreen />
  }

  return (
    <Routes>
      {/* public routes */}
      <Route
        path='/login'
        element={isLoggedIn ? <Navigate to='/dashboard' replace /> : <LoginPage />}
      />
      <Route
        path='/register'
        element={isLoggedIn ? <Navigate to='/dashboard' replace /> : <RegisterPage />}
      />

      <Route
        path='/forgot-password'
        element={<ForgotPasswordPage />}
      />
      <Route
        path='/password-reset/confirm'
        element={<ResetPasswordPage />}
      />
      <Route
        path='/mfa/verify'
        element={<MFAVerifyPage />}
      />
      <Route
        path='/invite/:code'
        element={<AcceptInvitePage />}
      />

      {/* protected routes */}
      <Route
        path='/dashboard'
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/dashboard/settings'
        element={
          <PrivateRoute>
            <ProfileSettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/dashboard/settings/mfa'
        element={
          <PrivateRoute>
            <MFASetupPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/dashboard/organisation'
        element={
          <PrivateRoute>
            <OrganisationSettingsPage />
          </PrivateRoute>
        }
      />
      <Route
        path='/dashboard/organisation/members'
        element={
          <PrivateRoute>
            <MembersPage />
          </PrivateRoute>
        }
      />

      {/* landing page */}
      <Route
        path='/'
        element={<LandingPage />}
      />

      {/* catch all */}
      <Route
        path='*'
        element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  )
}