import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './app/AppShell'
import RequireAuth from './app/RequireAuth'
import Home from './pages/Home'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import ForInstitutions from './pages/ForInstitutions'
import Channels from './pages/Channels'
import Login from './pages/Login'
import Register from './pages/Register'

// Public routes are flat and get a shared layout in Phase 3.
// /app is the only gated subtree, guarded by RequireAuth.
const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/about', element: <About /> },
  { path: '/how-it-works', element: <HowItWorks /> },
  { path: '/for-institutions', element: <ForInstitutions /> },
  { path: '/channels', element: <Channels /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  {
    element: <RequireAuth />,
    children: [
      { path: '/app', element: <AppShell /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
