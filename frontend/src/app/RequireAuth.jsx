import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

/**
 * Hard auth gate for the /app subtree. Reads the JWT presence from
 * localStorage (same client auth model the app already uses). If no token
 * is present, redirect to /login. API 401s continue to handle token expiry.
 */
export default function RequireAuth() {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
