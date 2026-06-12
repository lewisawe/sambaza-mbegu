import React, { useState } from 'react'

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

export default function ListingPanel({ onCreated }) {
  const [varietyId, setVarietyId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [days, setDays] = useState('90')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/listings', {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ variety_id: varietyId, quantity_kg: parseFloat(quantity), expires_days: parseInt(days) }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.detail || 'Failed') }
      setSuccess('Listing created!')
      setVarietyId('')
      setQuantity('')
      if (onCreated) onCreated()
    } catch (err) { setError(err.message) }
  }

  return (
    <div className="p-4">
      <h3 className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase mb-3">Share Seeds</h3>
      <form onSubmit={handleCreate} className="space-y-3">
        <input
          placeholder="Variety ID" value={varietyId}
          onChange={e => setVarietyId(e.target.value)}
          className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 text-[13px] focus:border-ember-orange outline-none"
        />
        <input
          type="number" placeholder="Quantity (kg)" value={quantity} step="0.1"
          onChange={e => setQuantity(e.target.value)}
          className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 text-[13px] focus:border-ember-orange outline-none"
        />
        <select
          value={days} onChange={e => setDays(e.target.value)}
          className="w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 text-[13px]"
        >
          <option value="30">30 days</option>
          <option value="60">60 days</option>
          <option value="90">90 days</option>
        </select>
        {error && <p className="text-red-400 text-[11px]">{error}</p>}
        {success && <p className="text-green-400 text-[11px]">{success}</p>}
        <button
          type="submit"
          className="w-full bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[12px] uppercase py-2"
        >
          List for sharing
        </button>
      </form>
    </div>
  )
}
