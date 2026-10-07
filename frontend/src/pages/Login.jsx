import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthForm } from '../components/AuthPanel'

export default function Login() {
  const navigate = useNavigate()
  return (
    <main className="min-h-[70vh] bg-warm-canvas text-carbon-black flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-slate hover:text-carbon-black">← Back to home</Link>
        <h1 className="font-[var(--font-display)] text-[3.5rem] leading-[0.9] uppercase mt-4 mb-2">Log in</h1>
        <p className="font-[var(--font-body)] text-slate text-md mb-8">Welcome back to the seed network.</p>
        <div className="bg-carbon-black text-bone-white p-8 rounded-[var(--radius-lg)]">
          <AuthForm mode="login" onAuth={() => navigate('/app')} />
        </div>
        <p className="font-[var(--font-body)] text-sm text-slate mt-6">
          No account yet?{' '}
          <Link to="/register" className="text-carbon-black underline font-semibold">Create one</Link>
        </p>
      </div>
    </main>
  )
}
