import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { checkSession, selectIsAuthReady, selectIsLoggedIn } from './redux/slices/authSlice'

import LoginPage        from './pages/auth/LoginPage'
import RegisterPage     from './pages/auth/RegisterPage'
import DashboardPage    from './pages/dashboard/DashboardPage'
import PrivateRoute     from './routes/PrivateRoute'
import SplashScreen     from './components/SplashScreen'
import LandingPage      from './pages/landing/LandingPage'

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

      {/* protected routes */}
      <Route
        path='/dashboard'
        element={
          <PrivateRoute>
            <DashboardPage />
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