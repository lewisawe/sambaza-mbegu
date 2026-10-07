import React from 'react'
import { tierLabel, fieldSuccess, publicLocation } from '../../lib/seedFormat'

// A single public, privacy-safe variety card.
// Shows: crop, local name, county, since-year, non-identifying grower signal.
// NEVER shows farmer name or phone (privacy rule).
export default function VarietyCard({ record, image, imageAlt, onOpen }) {
  const seed = record?.seed || {}
  const grows = record?.grows_info || {}
  const county = publicLocation(record?.location)
  const since = Number(grows.since_year) || null
  const success = fieldSuccess(grows.success_rating)
  const tier = tierLabel(record?.farmer?.verification_tier)

  const title = seed.local_name || seed.name || 'Indigenous variety'
  const crop = seed.crop_type || null

  const clickable = typeof onOpen === 'function'

  const inner = (
    <>
      {image && (
        <div className="overflow-hidden rounded-[var(--radius-md)] mb-5 bg-mist-gray aspect-[4/3]">
          <img
            src={image}
            alt={imageAlt || `${crop || 'Indigenous'} crop`}
            loading="lazy"
            width="400"
            height="300"
            className="w-full h-full object-cover grayscale-[0.15]"
          />
        </div>
      )}
      {crop && (
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.25em] text-smoke">{crop}</p>
      )}
      <h3 className="font-[var(--font-display)] text-2xl uppercase leading-[0.95] mt-1">{title}</h3>

      <dl className="mt-4 space-y-2">
        {county && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">County</dt>
            <dd className="font-[var(--font-body)] text-sm text-slate text-right">{county}</dd>
          </div>
        )}
        {since && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">Grown since</dt>
            <dd className="font-[var(--font-body)] text-sm text-slate text-right">{since}</dd>
          </div>
        )}
        {success && (
          <div className="flex items-baseline justify-between gap-3">
            <dt className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke">Grower signal</dt>
            <dd className="font-[var(--font-body)] text-sm text-slate text-right">{success}</dd>
          </div>
        )}
      </dl>

      <span className="inline-block mt-5 font-[var(--font-mono)] text-[0.7rem] uppercase tracking-widest bg-mint-chip text-carbon-black px-2 py-1 rounded-[var(--radius-sm)]">
        {tier}
      </span>
    </>
  )

  if (clickable) {
    return (
      <button
        type="button"
        onClick={() => onOpen(record)}
        className="text-left bg-paper-white rounded-[var(--radius-lg)] p-6 w-full hover:outline-2 hover:outline-carbon-black transition-[outline] focus-visible:outline-2 focus-visible:outline-carbon-black"
      >
        {inner}
        <span className="block mt-4 font-[var(--font-mono)] text-xs uppercase tracking-widest underline">
          View provenance →
        </span>
      </button>
    )
  }

  return <div className="bg-paper-white rounded-[var(--radius-lg)] p-6">{inner}</div>
}
