import React, { useState } from 'react'

const API = '/api/auth'

/**
 * Shared auth form body (no modal chrome). Reused by the full-page
 * /login and /register routes and by the legacy modal AuthPanel below.
 * onAuth(data) fires after a successful login/register with the API payload
 * ({ token, user_id, role }). localStorage is written here, matching the
 * original behavior.
 */
export function AuthForm({ mode: initialMode = 'login', onAuth, onModeChange }) {
  const [mode, setMode] = useState(initialMode)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('farmer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = () => {
    const next = mode === 'login' ? 'register' : 'login'
    setMode(next)
    setError('')
    if (onModeChange) onModeChange(next)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = mode === 'register' ? { phone, password, role } : { phone, password }
      const res = await fetch(`${API}/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('role', data.role)
      onAuth({ ...data, mode })
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="tel" placeholder="+254..." value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 font-[var(--font-switzer)] text-[14px] focus:border-ember-orange outline-none"
      />
      <input
        type="password" placeholder="Password" value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 font-[var(--font-switzer)] text-[14px] focus:border-ember-orange outline-none"
      />
      {mode === 'register' && (
        <select
          value={role} onChange={e => setRole(e.target.value)}
          className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 font-[var(--font-switzer)] text-[14px]"
        >
          <option value="farmer">Farmer</option>
          <option value="extension_worker">Extension Worker</option>
          <option value="institution">Institution</option>
        </select>
      )}
      {error && <p className="text-red-400 text-[12px]">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="w-full bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[14px] uppercase py-2 disabled:opacity-50"
      >
        {loading ? '...' : mode === 'login' ? 'Sign In' : 'Register'}
      </button>
      <button
        type="button"
        onClick={switchMode}
        className="mt-2 text-[12px] text-steel-mid hover:text-ember-orange font-[var(--font-switzer)]"
      >
        {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
      </button>
    </form>
  )
}

/**
 * Legacy modal wrapper (kept for any in-app overlay usage).
 */
export default function AuthPanel({ onAuth, onClose }) {
  const [mode, setMode] = useState('login')
  return (
    <div className="fixed inset-0 z-50 bg-void-black/90 flex items-center justify-center">
      <div className="bg-carbon border border-graphite-border p-8 w-[360px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-[var(--font-chivo-mono)] text-[14px] text-bone-white uppercase">
            {mode === 'login' ? 'Sign In' : 'Register'}
          </h2>
          <button onClick={onClose} className="text-steel-mid hover:text-bone-white text-[18px]">×</button>
        </div>
        <AuthForm mode={mode} onAuth={onAuth} onModeChange={setMode} />
      </div>
    </div>
  )
}
