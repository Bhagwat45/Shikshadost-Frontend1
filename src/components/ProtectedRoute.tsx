import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types/auth'
import LoadingSpinner from './LoadingSpinner'
export default function ProtectedRoute({ roles }: { roles?: Role[] }) { const { user, isLoading } = useAuth(); if (isLoading) return <LoadingSpinner />; if (!user) return <Navigate to="/login" replace />; if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />; return <Outlet /> }
