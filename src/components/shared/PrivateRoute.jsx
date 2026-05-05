import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../../features/auth/slices/authSlice'
import { selectActiveWorkspaceId } from '../../features/workspace/slices/workspaceSlice'

export default function PrivateRoute({ children, requireWorkspace = true }) {
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const activeWorkspaceId = useSelector(selectActiveWorkspaceId)
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  // If we require a workspace but none is selected, go to workspace selection
  // BUT only if we aren't already going to the workspace selection page
  if (requireWorkspace && !activeWorkspaceId && location.pathname !== '/workspaces') {
    return <Navigate to='/workspaces' replace />
  }

  return children
}