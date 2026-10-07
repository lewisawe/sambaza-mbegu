import React from 'react'
import { Link } from 'react-router-dom'

// Settings: controls here have NO backend endpoint yet, so they are clearly
// marked "Not yet wired" rather than faking persistence. Do not invent
// endpoints — see NOTES-KIMUR.md TODOs.
export default function Settings() {
  const StubRow = ({ label, control }) => (
    <div className="flex items-center justify-between py-4 border-b border-graphite-border">
      <div>
        <p className="font-[var(--font-switzer)] text-[14px] text-bone-white">{label}</p>
        <p className="font-[var(--font-chivo-mono)] text-[10px] uppercase text-steel-mid mt-1">Not yet wired</p>
      </div>
      <div className="opacity-50 pointer-events-none">{control}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-void-black text-bone-white">
      <div className="max-w-[640px] mx-auto px-6 py-10">
        <Link to="/app" className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid border border-graphite-border px-3 py-1.5 hover:border-bone-white hover:text-bone-white">← BACK TO APP</Link>
        <h1 className="font-[var(--font-twk-everett)] text-[40px] font-light mt-6">Settings</h1>
        <p className="font-[var(--font-switzer)] text-[13px] text-fog-light mt-3">
          These controls are placeholders. The backend endpoints to persist them don't exist yet.
        </p>

        <div className="mt-8 bg-carbon border border-graphite-border p-6">
          <StubRow label="SMS notifications" control={<span className="border border-graphite-border px-3 py-1.5 text-[11px] font-[var(--font-chivo-mono)]">ON</span>} />
          <StubRow label="Preferred language" control={<span className="border border-graphite-border px-3 py-1.5 text-[11px] font-[var(--font-chivo-mono)]">English</span>} />
          <StubRow label="Search radius (km)" control={<span className="border border-graphite-border px-3 py-1.5 text-[11px] font-[var(--font-chivo-mono)]">20</span>} />
        </div>

        <div className="mt-6">
          <Link to="/app/profile" className="font-[var(--font-chivo-mono)] text-[12px] uppercase text-steel-mid hover:text-bone-white">← Profile</Link>
        </div>
      </div>
    </div>
  )
}
