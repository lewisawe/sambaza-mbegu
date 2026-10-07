import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)] min-h-[60vh] flex items-center">
      <section className="max-w-[760px] mx-auto px-6 py-24 text-center">
        <p className="font-[var(--font-display)] uppercase leading-none text-[clamp(5rem,20vw,12rem)]">404</p>
        <h1 className="font-[var(--font-display)] uppercase text-[clamp(1.5rem,4vw,2.5rem)] mt-2">
          This field is fallow.
        </h1>
        <p className="font-[var(--font-body)] text-md text-slate mt-4">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="inline-block mt-8 font-[var(--font-mono)] text-sm uppercase tracking-widest bg-carbon-black text-paper-white px-7 py-4 rounded-[var(--radius-md)]">
          Back to home
        </Link>
      </section>
    </main>
  )
}
