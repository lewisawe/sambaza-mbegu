import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Post-signup onboarding capturing county / sub-county / ward + what the user
// grows (mirrors the USSD register field set from PRODUCT_SPEC).
//
// TODO: no backend endpoint accepts this profile shape yet. The USSD flow
// writes it, but there is no web write endpoint (auth/register only takes
// phone/password/role; farmers route has no profile POST). Until one exists,
// store client-side to localStorage and show success. Replace the submit
// handler with a real fetch when the endpoint lands. See NOTES-KIMUR.md.
export default function Onboarding() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ county: '', subCounty: '', ward: '', crops: '', years: '' })
  const [saved, setSaved] = useState(false)

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: replace with POST to a real onboarding endpoint when available.
    localStorage.setItem('kimur_onboarding', JSON.stringify(form))
    setSaved(true)
    setTimeout(() => navigate('/app'), 700)
  }

  const field = 'w-full bg-void-black border border-graphite-border text-bone-white px-3 py-2 font-[var(--font-switzer)] text-[14px] focus:border-ember-orange outline-none'

  return (
    <div className="min-h-screen bg-void-black text-bone-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[460px]">
        <h1 className="font-[var(--font-twk-everett)] text-[40px] font-light leading-[1]">Tell us about your farm</h1>
        <p className="font-[var(--font-switzer)] text-[14px] text-fog-light mt-3">
          This helps Kimur match you with seed near you. You can skip and do it later.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-3">
          <input className={field} placeholder="County" value={form.county} onChange={update('county')} />
          <input className={field} placeholder="Sub-county" value={form.subCounty} onChange={update('subCounty')} />
          <input className={field} placeholder="Ward" value={form.ward} onChange={update('ward')} />
          <input className={field} placeholder="What do you grow? (comma-separated)" value={form.crops} onChange={update('crops')} />
          <input className={field} type="number" placeholder="Years growing" value={form.years} onChange={update('years')} />

          {saved && <p className="text-green-400 text-[12px] font-[var(--font-chivo-mono)]">Saved locally — taking you to the app…</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[13px] uppercase py-2.5">
              Continue
            </button>
            <button type="button" onClick={() => navigate('/app')} className="border border-graphite-border text-bone-white font-[var(--font-chivo-mono)] text-[13px] uppercase px-4 py-2.5 hover:border-bone-white">
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
