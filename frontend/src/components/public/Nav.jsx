import React, { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/for-institutions', label: 'For institutions' },
  { to: '/channels', label: 'Channels' },
  { to: '/about', label: 'About' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="bg-warm-canvas sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-[var(--font-display)] text-2xl uppercase tracking-tight text-carbon-black">
          Kimur
        </Link>

        {/* Desktop links in a brutalist pill */}
        <div className="hidden md:flex items-center gap-1 bg-paper-white rounded-[var(--radius-md)] px-2 py-1">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `font-[var(--font-mono)] text-xs uppercase tracking-widest px-3 py-2 rounded-[var(--radius-sm)] transition-colors ${
                  isActive ? 'bg-carbon-black text-paper-white' : 'text-slate hover:text-carbon-black'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-slate hover:text-carbon-black">Log in</Link>
          <Link to="/register" className="font-[var(--font-mono)] text-xs uppercase tracking-widest bg-carbon-black text-paper-white px-4 py-2 rounded-[var(--radius-md)] hover:bg-graphite">Sign up</Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden font-[var(--font-mono)] text-xs uppercase tracking-widest border-2 border-carbon-black px-3 py-2 rounded-[var(--radius-sm)]"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-6 pb-5 flex flex-col gap-1 bg-warm-canvas">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-[var(--font-mono)] text-xs uppercase tracking-widest py-2 text-slate hover:text-carbon-black">
              {l.label}
            </NavLink>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className="font-[var(--font-mono)] text-xs uppercase tracking-widest py-2">Log in</Link>
          <Link to="/register" onClick={() => setOpen(false)} className="font-[var(--font-mono)] text-xs uppercase tracking-widest bg-carbon-black text-paper-white px-4 py-2 rounded-[var(--radius-md)] text-center mt-1">Sign up</Link>
        </div>
      )}
    </nav>
  )
}
