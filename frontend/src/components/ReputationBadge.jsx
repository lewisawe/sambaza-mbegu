import React from 'react'

const TIER_COLORS = {
  'Unverified': 'text-steel-mid',
  'Confirmed': 'text-blue-400',
  'Champion': 'text-purple-400',
  'Seed Bank': 'text-ember-orange',
}

export default function ReputationBadge({ score, tier }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <span className="font-[var(--font-chivo-mono)] text-[12px] text-bone-white">
          {score?.toFixed(1) || '0.0'}
        </span>
        <span className="text-[10px] text-steel-mid">/100</span>
      </div>
      {tier && (
        <span className={`font-[var(--font-chivo-mono)] text-[10px] uppercase ${TIER_COLORS[tier] || 'text-steel-mid'}`}>
          {tier}
        </span>
      )}
    </div>
  )
}
