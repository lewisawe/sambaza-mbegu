import React from 'react'
import { Outlet } from 'react-router-dom'
import Nav from '../components/public/Nav'
import Footer from '../components/public/Footer'

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-canvas">
      <Nav />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
