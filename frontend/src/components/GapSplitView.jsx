import React, { useState } from 'react'

const COUNTIES = [
  { name: 'Machakos', lat: -1.52, lng: 37.26, gaps: 4, covered: 8 },
  { name: 'Kitui', lat: -1.37, lng: 38.01, gaps: 6, covered: 5 },
  { name: 'Makueni', lat: -1.80, lng: 37.62, gaps: 3, covered: 9 },
  { name: 'Tharaka-Nithi', lat: -0.30, lng: 37.80, gaps: 2, covered: 10 },
  { name: 'Meru', lat: 0.05, lng: 37.65, gaps: 3, covered: 7 },
  { name: 'Embu', lat: -0.54, lng: 37.45, gaps: 1, covered: 11 },
]

export default function GapSplitView({ visible, onClose }) {
  const [mode, setMode] = useState('before')

  if (!visible) return null

  return (
    <div className="absolute inset-0 z-30 bg-void-black/95 overflow-y-auto p-8">
      <div className="max-w-[900px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-[var(--font-twk-everett)] text-[32px] text-bone-white">Coverage Gap Analysis</h2>
          <button onClick={onClose} className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid border border-graphite-border px-3 py-1.5 hover:border-bone-white hover:text-bone-white">CLOSE</button>
        </div>

        {/* Toggle */}
        <div className="flex gap-0 mb-8">
          <button
            onClick={() => setMode('before')}
            className={`font-[var(--font-chivo-mono)] text-[12px] uppercase px-4 py-2 border ${mode === 'before' ? 'bg-red-900/50 border-red-500 text-red-300' : 'border-graphite-border text-steel-mid'}`}
          >
            Before (Gaps)
          </button>
          <button
            onClick={() => setMode('after')}
            className={`font-[var(--font-chivo-mono)] text-[12px] uppercase px-4 py-2 border ${mode === 'after' ? 'bg-green-900/50 border-green-500 text-green-300' : 'border-graphite-border text-steel-mid'}`}
          >
            After (Connected)
          </button>
        </div>

        <p className="text-[14px] text-fog-light mb-6">
          {mode === 'before'
            ? 'Red zones show wards where farmers search for varieties but no local growers exist within 20km.'
            : 'Green zones show wards where Sambaza Mbegu connected farmers with nearby growers, filling coverage gaps.'}
        </p>

        {/* County grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {COUNTIES.map(c => {
            const total = c.gaps + c.covered
            const gapPct = (c.gaps / total) * 100
            const coveredPct = (c.covered / total) * 100
            return (
              <div key={c.name} className="border border-graphite-border bg-carbon p-4">
                <p className="font-[var(--font-chivo-mono)] text-[13px] text-bone-white">{c.name}</p>
                <div className="mt-3 h-2 bg-void-black rounded-full overflow-hidden flex">
                  {mode === 'before' ? (
                    <>
                      <div className="h-full bg-red-500/80" style={{ width: `${gapPct}%` }} />
                      <div className="h-full bg-graphite-border" style={{ width: `${coveredPct}%` }} />
                    </>
                  ) : (
                    <>
                      <div className="h-full bg-green-500/80" style={{ width: `${coveredPct + gapPct * 0.7}%` }} />
                      <div className="h-full bg-yellow-500/60" style={{ width: `${gapPct * 0.3}%` }} />
                    </>
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  {mode === 'before' ? (
                    <>
                      <span className="text-[10px] text-red-400">{c.gaps} gaps</span>
                      <span className="text-[10px] text-steel-mid">{c.covered} covered</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-green-400">{c.covered + Math.floor(c.gaps * 0.7)} connected</span>
                      <span className="text-[10px] text-yellow-400">{Math.ceil(c.gaps * 0.3)} remaining</span>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Impact summary */}
        <div className="mt-8 border-t border-graphite-border pt-6 flex gap-8">
          <div>
            <p className="font-[var(--font-chivo-mono)] text-[28px] text-ember-orange">
              {mode === 'before' ? '19' : '6'}
            </p>
            <p className="text-[11px] text-steel-mid uppercase">
              {mode === 'before' ? 'Total gaps' : 'Remaining gaps'}
            </p>
          </div>
          <div>
            <p className="font-[var(--font-chivo-mono)] text-[28px] text-bone-white">
              {mode === 'before' ? '0%' : '68%'}
            </p>
            <p className="text-[11px] text-steel-mid uppercase">Gap reduction</p>
          </div>
          <div>
            <p className="font-[var(--font-chivo-mono)] text-[28px] text-bone-white">
              {mode === 'before' ? '0' : '47'}
            </p>
            <p className="text-[11px] text-steel-mid uppercase">Farmers connected</p>
          </div>
        </div>
      </div>
    </div>
  )
}
