import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppShell from './app/AppShell'
import RequireAuth from './app/RequireAuth'
import PublicLayout from './pages/PublicLayout'
import Home from './pages/Home'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import ForInstitutions from './pages/ForInstitutions'
import Channels from './pages/Channels'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'

// Public routes share PublicLayout (Nav + Footer + 404 catch-all).
// /login and /register are standalone full-page auth screens.
// /app is the only gated subtree, guarded by RequireAuth.
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/how-it-works', element: <HowItWorks /> },
      { path: '/for-institutions', element: <ForInstitutions /> },
      { path: '/channels', element: <Channels /> },
      { path: '/privacy', element: <Privacy /> },
      { path: '/terms', element: <Terms /> },
      { path: '*', element: <NotFound /> },
    ],
  },
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
