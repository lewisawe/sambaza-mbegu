import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/Kimur_logo.svg'

export default function Footer() {
  return (
    <footer className="bg-carbon-black text-ash px-6 py-14 font-[var(--font-mono)] text-xs">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <Link to="/" aria-label="Kimur" className="flex items-center gap-2">
              <img src={logo} alt="Kimur" width="40" height="40" className="h-10 w-10 bg-paper-white rounded-[var(--radius-sm)] p-1" />
              <span aria-hidden="true" className="font-[var(--font-display)] text-2xl text-paper-white uppercase">Kimur</span>
            </Link>
            <p className="mt-3 max-w-[280px] leading-relaxed text-smoke">
              Kenya's indigenous seed network, made visible.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-smoke uppercase tracking-widest">Product</span>
              <Link to="/varieties" className="hover:text-paper-white">Varieties</Link>
              <Link to="/how-it-works" className="hover:text-paper-white">How it works</Link>
              <Link to="/channels" className="hover:text-paper-white">Channels</Link>
              <Link to="/for-institutions" className="hover:text-paper-white">For institutions</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-smoke uppercase tracking-widest">Company</span>
              <Link to="/about" className="hover:text-paper-white">About</Link>
              <Link to="/login" className="hover:text-paper-white">Log in</Link>
              <Link to="/register" className="hover:text-paper-white">Sign up</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-smoke uppercase tracking-widest">Legal</span>
              <Link to="/privacy" className="hover:text-paper-white">Privacy</Link>
              <Link to="/terms" className="hover:text-paper-white">Terms</Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-smoke uppercase tracking-widest">Contact</span>
              <a href="mailto:info@kimur.app" className="hover:text-paper-white">info@kimur.app</a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-graphite text-smoke">
          © {new Date().getFullYear()} Kimur. Built for Kenyan smallholder farmers.
        </div>
      </div>
    </footer>
  )
}
