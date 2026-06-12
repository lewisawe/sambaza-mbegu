import React, { useState, useEffect } from 'react'

const API = '/api/exchanges'
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

export default function ExchangePanel() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadHistory() }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/history`, { headers: headers() })
      const data = await res.json()
      setHistory(data.exchanges || [])
    } catch {}
    setLoading(false)
  }

  const handleAction = async (id, action) => {
    const method = action === 'rate' ? 'POST' : 'PUT'
    const url = `${API}/${id}/${action}`
    const body = action === 'rate' ? JSON.stringify({ score: 5 }) : undefined
    await fetch(url, { method, headers: headers(), body })
    loadHistory()
  }

  const statusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400', accepted: 'text-blue-400',
      completed: 'text-green-400', declined: 'text-red-400',
      pending_confirmation: 'text-purple-400',
    }
    return colors[status] || 'text-steel-mid'
  }

  if (loading) return <div className="p-4 text-steel-mid text-[12px]">Loading exchanges...</div>

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase mb-2">Exchange History</h3>
      {history.length === 0 && <p className="text-[12px] text-fog-light">No exchanges yet.</p>}
      {history.map((ex, i) => (
        <div key={i} className="border border-graphite-border p-3 bg-void-black">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-[var(--font-switzer)] text-[13px] text-bone-white">{ex.variety || 'Seed'}</p>
              <p className="text-[11px] text-steel-mid mt-1">
                with {ex.owner_name || ex.requester_name}
              </p>
            </div>
            <span className={`font-[var(--font-chivo-mono)] text-[10px] uppercase ${statusColor(ex.status)}`}>
              {ex.status}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            {ex.status === 'pending' && (
              <>
                <button onClick={() => handleAction(ex.id, 'accept')} className="text-[10px] bg-green-900 text-green-300 px-2 py-1">Accept</button>
                <button onClick={() => handleAction(ex.id, 'decline')} className="text-[10px] bg-red-900 text-red-300 px-2 py-1">Decline</button>
              </>
            )}
            {(ex.status === 'accepted' || ex.status === 'pending_confirmation') && (
              <button onClick={() => handleAction(ex.id, 'confirm')} className="text-[10px] bg-blue-900 text-blue-300 px-2 py-1">Confirm Exchange</button>
            )}
            {ex.status === 'completed' && !ex.rating && (
              <button onClick={() => handleAction(ex.id, 'rate')} className="text-[10px] bg-ember-orange text-void-black px-2 py-1">Rate ★5</button>
            )}
            {ex.rating && <span className="text-[10px] text-yellow-400">★{ex.rating}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}
