import React from 'react'

export default function RecommendationCard({ text }) {
  if (!text) return null

  return (
    <div className="absolute top-4 right-4 z-10 max-w-[360px] bg-void-black border border-graphite-border p-5">
      <p className="font-[var(--font-chivo-mono)] text-[11px] text-ember-orange uppercase mb-3">
        AI RECOMMENDATION
      </p>
      <p className="text-[14px] text-fog-light leading-[1.5] whitespace-pre-line">
        {text}
      </p>
    </div>
  )
}
