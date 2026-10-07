import React from 'react'
import { Link } from 'react-router-dom'

// Profile reads what the client already has: role, user_id, and any
// onboarding data stored locally (Onboarding.jsx). There is no GET profile
// endpoint, so we show what's available rather than inventing one.
export default function Profile() {
  const role = localStorage.getItem('role') || 'farmer'
  const userId = localStorage.getItem('user_id') || '—'
  let onboarding = null
  try {
    onboarding = JSON.parse(localStorage.getItem('kimur_onboarding') || 'null')
  } catch {
    onboarding = null
  }

  const Row = ({ label, value }) => (
    <div className="flex justify-between py-3 border-b border-graphite-border">
      <span className="font-[var(--font-chivo-mono)] text-[11px] uppercase text-steel-mid">{label}</span>
      <span className="font-[var(--font-switzer)] text-[14px] text-bone-white">{value || '—'}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-void-black text-bone-white">
      <div className="max-w-[640px] mx-auto px-6 py-10">
        <Link to="/app" className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid border border-graphite-border px-3 py-1.5 hover:border-bone-white hover:text-bone-white">← BACK TO APP</Link>
        <h1 className="font-[var(--font-twk-everett)] text-[40px] font-light mt-6">Profile</h1>

        <div className="mt-8 bg-carbon border border-graphite-border p-6">
          <Row label="User ID" value={userId} />
          <Row label="Role" value={role.replace('_', ' ')} />
          {onboarding && (
            <>
              <Row label="County" value={onboarding.county} />
              <Row label="Sub-county" value={onboarding.subCounty} />
              <Row label="Ward" value={onboarding.ward} />
              <Row label="Grows" value={onboarding.crops} />
              <Row label="Years growing" value={onboarding.years} />
            </>
          )}
        </div>

        {!onboarding && (
          <p className="font-[var(--font-switzer)] text-[13px] text-fog-light mt-4">
            No location/crop profile yet.{' '}
            <Link to="/app/onboarding" className="text-ember-orange underline">Complete onboarding</Link>.
          </p>
        )}
        <div className="mt-6">
          <Link to="/app/settings" className="font-[var(--font-chivo-mono)] text-[12px] uppercase text-steel-mid hover:text-bone-white">Settings →</Link>
        </div>
      </div>
    </div>
  )
}
