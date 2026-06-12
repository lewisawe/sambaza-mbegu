import React, { useState, useEffect } from 'react'
import { CircleMarker, Popup, useMap } from 'react-leaflet'

export default function ExtinctionRiskLayer({ visible }) {
  const [risks, setRisks] = useState([])
  const map = useMap()

  useEffect(() => {
    if (!visible) return
    fetch('/api/stats/extinction-risk')
      .then(r => r.json())
      .then(data => setRisks(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [visible])

  if (!visible || !risks.length) return null

  return (
    <>
      {risks.map((r, i) => {
        // Use random but deterministic position based on index for demo
        const lat = -0.3 - (i * 0.08)
        const lng = 37.4 + (i * 0.12)
        return (
          <CircleMarker
            key={`risk-${i}`}
            center={[lat, lng]}
            radius={14}
            fillColor="#ff0040"
            fillOpacity={0.3}
            color="#ff0040"
            weight={2}
            className="animate-pulse"
          >
            <Popup>
              <div className="min-w-[200px]">
                <p className="font-[var(--font-chivo-mono)] text-[11px] text-red-400 uppercase">⚠️ Extinction Risk</p>
                <p className="font-[var(--font-twk-everett)] text-[16px] text-bone-white mt-1">{r.variety}</p>
                <p className="text-[12px] text-fog-light mt-1">{r.crop}</p>
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] text-red-300">Only {r.growers} grower{r.growers > 1 ? 's' : ''} remaining</p>
                  <p className="text-[11px] text-steel-mid">Grown for ~{r.avg_years_grown} years</p>
                  {r.traits?.length > 0 && (
                    <p className="text-[11px] text-steel-mid">Traits: {r.traits.join(', ')}</p>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}
