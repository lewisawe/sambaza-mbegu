import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Nav from '../components/public/Nav'
import Footer from '../components/public/Footer'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-canvas">
      <ScrollToTop />
      <Nav />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
