import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute() {
  //@ts-ignore
  const { User } = useAuthStore()

  if (!User) {
    // Redirect to Login page if not authenticated
    return <Navigate to="/" />
  }

  // If user is authenticated, render the child routes (Outlet)
  return <Outlet />
}

export default ProtectedRoute
