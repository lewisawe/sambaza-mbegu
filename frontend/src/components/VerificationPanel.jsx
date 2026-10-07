import React, { useState } from 'react'

// Extension-worker entry point. Submits a field verification report to the
// existing backend endpoint POST /api/verification/report (require_role:
// extension_worker). No new backend logic — this surfaces an endpoint that
// previously had no web UI.
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

export default function VerificationPanel({ onSubmitted }) {
  const [farmerId, setFarmerId] = useState('')
  const [varieties, setVarieties] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/verification/report', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({
          farmer_id: farmerId,
          varieties_observed: varieties.split(',').map(v => v.trim()).filter(Boolean),
          notes,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Failed') }
      setSuccess('Report submitted.')
      setFarmerId('')
      setVarieties('')
      setNotes('')
      if (onSubmitted) onSubmitted()
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="p-4">
      <h3 className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase mb-3">Field Verification</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          placeholder="Farmer ID" value={farmerId}
          onChange={e => setFarmerId(e.target.value)}
          className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 text-[13px] focus:border-ember-orange outline-none"
        />
        <input
          placeholder="Varieties observed (comma-separated)" value={varieties}
          onChange={e => setVarieties(e.target.value)}
          className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 text-[13px] focus:border-ember-orange outline-none"
        />
        <textarea
          placeholder="Notes" value={notes} rows={3}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 text-[13px] focus:border-ember-orange outline-none resize-none"
        />
        {error && <p className="text-red-400 text-[11px]">{error}</p>}
        {success && <p className="text-green-400 text-[11px]">{success}</p>}
        <button
          type="submit"
          className="w-full bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[12px] uppercase py-2"
        >
          Submit report
        </button>
      </form>
    </div>
  )
}
