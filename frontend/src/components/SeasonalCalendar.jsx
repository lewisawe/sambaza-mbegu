import React, { useState } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CROPS = [
  { name: 'Sorghum', plant: [2, 3], harvest: [6, 7], available: [7, 8, 9], color: '#ff4f2b' },
  { name: 'Millet', plant: [2, 3], harvest: [5, 6], available: [6, 7, 8], color: '#f59e0b' },
  { name: 'Cowpea', plant: [3, 4], harvest: [6, 7], available: [7, 8, 9, 10], color: '#10b981' },
  { name: 'Pigeon Pea', plant: [3, 4, 5], harvest: [8, 9], available: [9, 10, 11], color: '#8b5cf6' },
  { name: 'Green Gram', plant: [2, 3], harvest: [5, 6], available: [5, 6, 7], color: '#06b6d4' },
  { name: 'Maize', plant: [2, 3, 4], harvest: [7, 8], available: [8, 9, 10], color: '#eab308' },
]

const EVENTS = [
  { month: 2, type: 'rain', label: 'Long rains begin' },
  { month: 5, type: 'rain', label: 'Long rains end' },
  { month: 9, type: 'rain', label: 'Short rains begin' },
  { month: 11, type: 'rain', label: 'Short rains end' },
  { month: 7, type: 'alert', label: 'Peak sharing season' },
]

export default function SeasonalCalendar({ visible, onClose }) {
  const [hoveredCrop, setHoveredCrop] = useState(null)
  const now = new Date().getMonth()

  if (!visible) return null

  return (
    <div className="absolute inset-0 z-30 bg-void-black/95 overflow-y-auto p-8">
      <div className="max-w-[900px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-[var(--font-twk-everett)] text-[32px] text-bone-white">Seasonal Calendar</h2>
          <button onClick={onClose} className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid border border-graphite-border px-3 py-1.5 hover:border-bone-white hover:text-bone-white">CLOSE</button>
        </div>
        <p className="text-[14px] text-fog-light mb-8">
          Planting windows, harvest periods, and seed availability for indigenous crops in Eastern Kenya. Alerts fire automatically based on this calendar.
        </p>

        {/* Month headers */}
        <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-0 mb-1">
          <div />
          {MONTHS.map((m, i) => (
            <div key={m} className={`text-center text-[10px] font-[var(--font-chivo-mono)] py-1 ${i === now ? 'text-ember-orange' : 'text-steel-mid'}`}>
              {m}
            </div>
          ))}
        </div>

        {/* Rainfall indicator */}
        <div className="grid grid-cols-[120px_repeat(12,1fr)] gap-0 mb-3">
          <div className="text-[10px] text-steel-mid font-[var(--font-chivo-mono)] flex items-center">RAINFALL</div>
          {MONTHS.map((_, i) => {
            const isRainy = (i >= 1 && i <= 4) || (i >= 8 && i <= 10)
            return (
              <div key={i} className="h-3 flex items-center justify-center">
                {isRainy && <div className="w-full h-1.5 bg-blue-500/40 mx-0.5" />}
              </div>
            )
          })}
        </div>

        {/* Crop rows */}
        {CROPS.map(crop => (
          <div
            key={crop.name}
            className={`grid grid-cols-[120px_repeat(12,1fr)] gap-0 border-t border-graphite-border/50 ${hoveredCrop === crop.name ? 'bg-carbon' : ''}`}
            onMouseEnter={() => setHoveredCrop(crop.name)}
            onMouseLeave={() => setHoveredCrop(null)}
          >
            <div className="text-[12px] text-bone-white font-[var(--font-switzer)] py-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: crop.color }} />
              {crop.name}
            </div>
            {MONTHS.map((_, i) => {
              const isPlant = crop.plant.includes(i)
              const isHarvest = crop.harvest.includes(i)
              const isAvailable = crop.available.includes(i)
              return (
                <div key={i} className="py-2 flex items-center justify-center">
                  {isPlant && <div className="w-full h-4 mx-0.5 rounded-sm bg-green-600/60 flex items-center justify-center"><span className="text-[8px]">🌱</span></div>}
                  {isHarvest && <div className="w-full h-4 mx-0.5 rounded-sm bg-yellow-600/60 flex items-center justify-center"><span className="text-[8px]">🌾</span></div>}
                  {isAvailable && !isHarvest && <div className="w-full h-4 mx-0.5 rounded-sm flex items-center justify-center" style={{ background: `${crop.color}30` }}><span className="text-[8px]">📦</span></div>}
                </div>
              )
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex gap-6 mt-6 pt-4 border-t border-graphite-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-green-600/60 rounded-sm" />
            <span className="text-[11px] text-fog-light">Planting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-yellow-600/60 rounded-sm" />
            <span className="text-[11px] text-fog-light">Harvest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3 bg-ember-orange/30 rounded-sm" />
            <span className="text-[11px] text-fog-light">Seeds available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1.5 bg-blue-500/40" />
            <span className="text-[11px] text-fog-light">Rainy season</span>
          </div>
        </div>

        {/* Events */}
        <div className="mt-6">
          <p className="font-[var(--font-chivo-mono)] text-[11px] text-steel-mid uppercase mb-2">Alert Triggers</p>
          <div className="flex flex-wrap gap-2">
            {EVENTS.map((e, i) => (
              <span key={i} className={`px-2 py-1 border text-[11px] ${e.type === 'rain' ? 'border-blue-500/50 text-blue-300' : 'border-ember-orange/50 text-ember-orange'}`}>
                {MONTHS[e.month]}: {e.label}
              </span>
            ))}
          </div>
        </div>

        {/* Current month indicator */}
        <div className="mt-6 p-3 border border-ember-orange/50 bg-ember-orange/5">
          <p className="font-[var(--font-chivo-mono)] text-[11px] text-ember-orange">
            NOW ({MONTHS[now]}): {
              CROPS.filter(c => c.available.includes(now)).length > 0
                ? `${CROPS.filter(c => c.available.includes(now)).map(c => c.name).join(', ')} seeds are available for sharing`
                : CROPS.filter(c => c.plant.includes(now)).length > 0
                  ? `Planting season for ${CROPS.filter(c => c.plant.includes(now)).map(c => c.name).join(', ')}`
                  : 'Between seasons'
            }
          </p>
        </div>
      </div>
    </div>
  )
}
