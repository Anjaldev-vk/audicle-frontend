import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../redux/slices/authSlice'

export default function PrivateRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to='/login' replace />
  }

  return children
}