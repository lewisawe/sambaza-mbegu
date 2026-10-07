import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import VarietyCard from '../components/public/VarietyCard'
import { CROPS, COUNTIES, tierLabel, publicLocation, fieldSuccess } from '../lib/seedFormat'

import seedsImg from '../assets/img/seeds.webp'
import growingImg from '../assets/img/growing.webp'
import plantingImg from '../assets/img/planting.webp'
import seedsSackImg from '../assets/img/seeds-sack.webp'
import heroGardenImg from '../assets/img/hero-garden.webp'

// Rotate real crop/field imagery across cards for texture (not claimed to be the
// specific variety — generic indigenous-crop photography as an editorial accent).
const CARD_IMAGES = [seedsImg, growingImg, plantingImg, seedsSackImg, heroGardenImg]

function buildQuery({ crop, county }) {
  const p = new URLSearchParams()
  if (crop) p.set('crop', crop)
  if (county) p.set('county', county)
  const qs = p.toString()
  return `/api/seeds/search${qs ? `?${qs}` : ''}`
}

export default function Varieties() {
  const [crop, setCrop] = useState('')
  const [county, setCounty] = useState('')
  const [records, setRecords] = useState(null) // null = loading
  const [error, setError] = useState(false)
  const [active, setActive] = useState(null) // selected record for detail

  useEffect(() => {
    let cancelled = false
    setRecords(null)
    setError(false)
    fetch(buildQuery({ crop, county }))
      .then(r => { if (!r.ok) throw new Error('bad status'); return r.json() })
      .then(data => { if (!cancelled) setRecords(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [crop, county])

  const clearFilters = () => { setCrop(''); setCounty('') }

  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-10">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">Browse the network</p>
        <h1 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.5rem,7vw,5rem)]">
          Indigenous varieties,
          <span className="block">on the record.</span>
        </h1>
        <p className="font-[var(--font-body)] text-lg text-slate mt-8 max-w-[640px] leading-relaxed">
          Every variety below is a real entry in Kimur's seed graph, grown across six
          counties in Kenya's arid and semi-arid lands. Browse by crop and county.
          To request an exchange, log in, grower contact stays private.
        </p>
      </section>

      {/* Filters */}
      <section className="max-w-[1200px] mx-auto px-6 pb-10">
        <div className="bg-paper-white rounded-[var(--radius-lg)] p-6 flex flex-wrap gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label htmlFor="crop" className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">Crop</label>
            <select
              id="crop"
              value={crop}
              onChange={e => setCrop(e.target.value)}
              className="font-[var(--font-mono)] text-sm uppercase tracking-widest border-2 border-carbon-black rounded-[var(--radius-sm)] px-4 py-2 bg-paper-white min-w-[180px]"
            >
              <option value="">All crops</option>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="county" className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">County</label>
            <select
              id="county"
              value={county}
              onChange={e => setCounty(e.target.value)}
              className="font-[var(--font-mono)] text-sm uppercase tracking-widest border-2 border-carbon-black rounded-[var(--radius-sm)] px-4 py-2 bg-paper-white min-w-[180px]"
            >
              <option value="">All counties</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {(crop || county) && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-[var(--font-mono)] text-xs uppercase tracking-widest underline py-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="max-w-[1200px] mx-auto px-6 pb-24">
        {records === null && !error && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-paper-white rounded-[var(--radius-lg)] p-6">
                <div className="aspect-[4/3] bg-mist-gray rounded-[var(--radius-md)] animate-pulse" />
                <div className="h-6 w-2/3 bg-mist-gray rounded-[var(--radius-sm)] mt-5 animate-pulse" />
                <div className="h-4 w-1/2 bg-mist-gray rounded-[var(--radius-sm)] mt-3 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-paper-white rounded-[var(--radius-lg)] p-10 text-center">
            <h2 className="font-[var(--font-display)] text-2xl uppercase">The seed graph is resting.</h2>
            <p className="font-[var(--font-body)] text-sm text-slate mt-3">
              Live varieties are temporarily unavailable. Please try again shortly.
            </p>
          </div>
        )}

        {records && records.length === 0 && !error && (
          <div className="bg-paper-white rounded-[var(--radius-lg)] p-10 text-center">
            <h2 className="font-[var(--font-display)] text-2xl uppercase">No varieties match that filter.</h2>
            <p className="font-[var(--font-body)] text-sm text-slate mt-3">
              Try a different crop or county, or clear the filters to see everything.
            </p>
            {(crop || county) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-block mt-5 font-[var(--font-mono)] text-xs uppercase tracking-widest bg-carbon-black text-paper-white px-6 py-3 rounded-[var(--radius-md)]"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {records && records.length > 0 && (
          <>
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke mb-6">
              {records.length} {records.length === 1 ? 'variety' : 'varieties'}
              {crop ? ` · ${crop}` : ''}{county ? ` · ${county}` : ''}
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {records.map((rec, i) => (
                <VarietyCard
                  key={rec?.seed?.id || i}
                  record={rec}
                  image={CARD_IMAGES[i % CARD_IMAGES.length]}
                  imageAlt={`${rec?.seed?.crop_type || 'Indigenous'} crop grown in Kenya`}
                  onOpen={setActive}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {active && (
        <VarietyDetail record={active} onClose={() => setActive(null)} />
      )}
    </main>
  )
}

// --- Detail modal: provenance teaser + optional story (graceful empty) ---

function VarietyDetail({ record, onClose }) {
  const seed = record?.seed || {}
  const seedId = seed.id
  const [provenance, setProvenance] = useState(null) // null = loading
  const [provError, setProvError] = useState(false)
  const [story, setStory] = useState(null)

  const onKey = useCallback((e) => { if (e.key === 'Escape') onClose() }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onKey])

  useEffect(() => {
    if (!seedId) { setProvError(true); return }
    let cancelled = false
    fetch(`/api/seeds/${encodeURIComponent(seedId)}/provenance`)
      .then(r => { if (!r.ok) throw new Error('bad'); return r.json() })
      .then(d => { if (!cancelled) setProvenance(Array.isArray(d) ? d : []) })
      .catch(() => { if (!cancelled) setProvError(true) })

    fetch(`/api/seeds/${encodeURIComponent(seedId)}/story`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (cancelled) return
        // Story is a no-op while the LLM is off; accept string or {story}.
        const text = typeof d === 'string' ? d : d?.story
        if (text && typeof text === 'string' && text.trim()) setStory(text.trim())
      })
      .catch(() => { /* story is optional; stay silent */ })

    return () => { cancelled = true }
  }, [seedId])

  // Non-identifying provenance teaser: count of sharing events + earliest/longest.
  const chainCount = Array.isArray(provenance) ? provenance.length : 0
  const maxDepth = Array.isArray(provenance)
    ? provenance.reduce((m, p) => Math.max(m, Number(p?.depth) || 0), 0)
    : 0

  const title = seed.local_name || seed.name || 'Indigenous variety'

  return (
    <div
      className="fixed inset-0 z-[100] bg-carbon-black/70 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} details`}
      onClick={onClose}
    >
      <div
        className="bg-warm-canvas w-full sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {seed.crop_type && (
              <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-smoke">{seed.crop_type}</p>
            )}
            <h2 className="font-[var(--font-display)] text-3xl uppercase leading-[0.95] mt-1">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-[var(--font-mono)] text-xs uppercase tracking-widest border-2 border-carbon-black px-3 py-2 rounded-[var(--radius-sm)] shrink-0"
          >
            Close
          </button>
        </div>

        <dl className="mt-6 space-y-2">
          {publicLocation(record?.location) && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">County</dt>
              <dd className="font-[var(--font-body)] text-sm text-slate">{publicLocation(record.location)}</dd>
            </div>
          )}
          {record?.grows_info?.since_year && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">Grown since</dt>
              <dd className="font-[var(--font-body)] text-sm text-slate">{record.grows_info.since_year}</dd>
            </div>
          )}
          {fieldSuccess(record?.grows_info?.success_rating) && (
            <div className="flex items-baseline justify-between gap-3">
              <dt className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">Grower signal</dt>
              <dd className="font-[var(--font-body)] text-sm text-slate">{fieldSuccess(record.grows_info.success_rating)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">Tier</dt>
            <dd className="font-[var(--font-body)] text-sm text-slate">{tierLabel(record?.farmer?.verification_tier)}</dd>
          </div>
        </dl>

        {/* Provenance teaser */}
        <div className="mt-8 bg-paper-white rounded-[var(--radius-lg)] p-6">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-smoke">Provenance</p>
          {provenance === null && !provError && (
            <div className="h-5 w-2/3 bg-mist-gray rounded-[var(--radius-sm)] mt-3 animate-pulse" />
          )}
          {provError && (
            <p className="font-[var(--font-body)] text-sm text-slate mt-2">
              Provenance for this variety isn't available right now.
            </p>
          )}
          {provenance && !provError && chainCount > 0 && (
            <p className="font-[var(--font-body)] text-sm text-slate mt-2 leading-relaxed">
              Traced through <span className="font-[var(--font-mono)]">{chainCount}</span>{' '}
              recorded sharing {chainCount === 1 ? 'link' : 'links'}
              {maxDepth > 0 ? <> across up to <span className="font-[var(--font-mono)]">{maxDepth}</span> hands</> : null}.
              Full grower identities unlock after you log in.
            </p>
          )}
          {provenance && !provError && chainCount === 0 && (
            <p className="font-[var(--font-body)] text-sm text-slate mt-2 leading-relaxed">
              No recorded sharing chain yet, this variety is newly on the network.
            </p>
          )}
        </div>

        {/* Story — only renders when the LLM actually returned one */}
        {story && (
          <div className="mt-6 bg-carbon-black text-paper-white rounded-[var(--radius-lg)] p-6">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-mint-chip">Variety story</p>
            <p className="font-[var(--font-body)] text-sm text-ash mt-3 leading-relaxed">{story}</p>
          </div>
        )}

        <Link
          to="/login"
          className="block text-center mt-8 font-[var(--font-mono)] text-sm uppercase tracking-widest bg-carbon-black text-paper-white px-7 py-4 rounded-[var(--radius-md)]"
        >
          Log in to request an exchange
        </Link>
      </div>
    </div>
  )
}
