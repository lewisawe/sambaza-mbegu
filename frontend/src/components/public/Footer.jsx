import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-carbon-black text-ash px-6 py-14 font-[var(--font-mono)] text-xs">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div>
            <span className="font-[var(--font-display)] text-2xl text-paper-white uppercase block">Kimur</span>
            <p className="mt-3 max-w-[280px] leading-relaxed text-smoke">
              Kenya's indigenous seed network, made visible.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-2">
              <span className="text-smoke uppercase tracking-widest">Product</span>
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
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-graphite text-smoke">
          © {new Date().getFullYear()} Kimur. Built for Kenyan smallholder farmers.
        </div>
      </div>
    </footer>
  )
}
