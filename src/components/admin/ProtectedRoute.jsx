import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, ownerOnly = false }) {
  const { session, loading } = useAuth()

  if (loading) return null
  if (!session) return <Navigate to="/panel/login" replace />
  if (ownerOnly && session.role !== 'owner') return <Navigate to="/panel/frases" replace />

  return children
}
