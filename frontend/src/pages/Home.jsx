import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

/*
 * TAGLINE OPTIONS (chosen default = #1):
 *   1. "SEEDS YOUR GRANDMOTHER GREW, FINDABLE AGAIN."   <-- default
 *   2. "KENYA'S INDIGENOUS SEED NETWORK, MADE VISIBLE."
 *   3. "SHARE THE SEED. KEEP THE VARIETY ALIVE."
 */

const STAT_ITEMS = [
  { key: 'farmers', label: 'Farmers' },
  { key: 'seeds', label: 'Varieties' },
  { key: 'shares', label: 'Exchanges' },
  { key: 'counties', label: 'Counties' },
]

// Minimal inline nav/footer for Phase 2; replaced by the shared public
// layout (Nav/Footer) in Phase 3.
function MiniNav() {
  return (
    <nav className="flex items-center justify-between px-6 py-5 bg-warm-canvas">
      <Link to="/" className="font-[var(--font-display)] text-2xl uppercase tracking-tight text-carbon-black">Kimur</Link>
      <div className="flex items-center gap-3">
        <Link to="/login" className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-slate hover:text-carbon-black">Log in</Link>
        <Link to="/register" className="font-[var(--font-mono)] text-xs uppercase tracking-widest bg-carbon-black text-paper-white px-4 py-2 rounded-[var(--radius-md)] hover:bg-graphite">Sign up</Link>
      </div>
    </nav>
  )
}

function MiniFooter() {
  return (
    <footer className="bg-carbon-black text-ash px-6 py-10 font-[var(--font-mono)] text-xs">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="font-[var(--font-display)] text-xl text-paper-white uppercase">Kimur</span>
        <span>Kenya's indigenous seed network.</span>
      </div>
    </footer>
  )
}

export default function Home() {
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => { if (!r.ok) throw new Error('bad status'); return r.json() })
      .then(setStats)
      .catch(() => setStatsError(true))
  }, [])

  return (
    <div className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      <MiniNav />

      {/* Hero */}
      <section className="px-6 pt-10 pb-20 max-w-[1100px] mx-auto">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">
          Indigenous seed network · Kenya
        </p>
        <h1 className="font-[var(--font-display)] uppercase leading-[0.9] tracking-tight text-[clamp(3rem,9vw,7rem)]">
          Seeds your grandmother grew,
          <span className="block">findable again.</span>
        </h1>
        <p className="font-[var(--font-body)] text-md md:text-lg text-slate mt-8 max-w-[560px] leading-relaxed">
          Kimur maps Kenya's informal indigenous seed networks so farmers can find
          climate-adapted varieties matched to their soil, trace a seed's provenance
          across decades, and connect with growers nearby.
        </p>
        <div className="flex flex-wrap gap-4 mt-10">
          <Link
            to="/register"
            className="font-[var(--font-mono)] text-sm uppercase tracking-widest bg-carbon-black text-paper-white px-7 py-4 rounded-[var(--radius-md)] hover:bg-graphite transition-colors"
          >
            Sign up
          </Link>
          <Link
            to="/login"
            className="font-[var(--font-mono)] text-sm uppercase tracking-widest border-2 border-carbon-black text-carbon-black px-7 py-4 rounded-[var(--radius-md)] hover:bg-carbon-black hover:text-paper-white transition-colors"
          >
            Log in
          </Link>
        </div>
      </section>

      {/* Live stats — pulled from GET /api/stats, never hardcoded */}
      <section className="px-6 pb-20 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_ITEMS.map(item => (
            <div key={item.key} className="bg-paper-white rounded-[var(--radius-lg)] p-7">
              {stats ? (
                <p className="font-[var(--font-display)] text-[3rem] leading-none text-carbon-black">
                  {stats[item.key] ?? 0}
                </p>
              ) : statsError ? (
                <p className="font-[var(--font-display)] text-[3rem] leading-none text-ash">—</p>
              ) : (
                <div className="h-[3rem] w-20 bg-mist-gray rounded-[var(--radius-sm)] animate-pulse" />
              )}
              <p className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-slate mt-3">
                {item.label}
              </p>
            </div>
          ))}
        </div>
        {statsError && (
          <p className="font-[var(--font-mono)] text-xs text-smoke mt-4">
            Live network stats are temporarily unavailable.
          </p>
        )}
      </section>

      {/* Mission block — inverted */}
      <section className="bg-carbon-black text-paper-white px-6 py-24">
        <div className="max-w-[900px] mx-auto">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-mint-chip mb-6">
            Why Kimur exists
          </p>
          <h2 className="font-[var(--font-display)] uppercase leading-[0.95] text-[clamp(2rem,5vw,4rem)]">
            In 2025, Kenya's High Court made sharing indigenous seeds legal again.
          </h2>
          <p className="font-[var(--font-body)] text-md text-ash mt-8 max-w-[640px] leading-relaxed">
            After years of criminalization, farmers can trade heritage varieties
            freely once more. But 90% of African seeds still move through informal
            networks with no digital record. No one can see who grows what, where it
            thrives, or how a variety has survived. Kimur makes that network visible.
          </p>
        </div>
      </section>

      {/* How it works teaser */}
      <section className="px-6 py-24 max-w-[1100px] mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: '01', t: 'Search', d: 'Describe what you need in plain language. Kimur extracts your intent and queries the seed graph.' },
            { n: '02', t: 'Discover', d: 'See matching varieties on the map. Trace who grew it, where it thrived, and how long it survived.' },
            { n: '03', t: 'Exchange', d: 'Request seeds from a grower. Both confirm. Rate the exchange. Trust compounds in the network.' },
          ].map(step => (
            <div key={step.n} className="bg-paper-white rounded-[var(--radius-lg)] p-8">
              <p className="font-[var(--font-mono)] text-xs text-smoke">{step.n}</p>
              <h3 className="font-[var(--font-display)] text-2xl uppercase mt-2">{step.t}</h3>
              <p className="font-[var(--font-body)] text-sm text-slate mt-3 leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
        <Link to="/how-it-works" className="inline-block mt-8 font-[var(--font-mono)] text-xs uppercase tracking-widest underline">
          See how it works →
        </Link>
      </section>

      {/* Feature-phone section — no smartphone needed */}
      <section className="px-6 pb-24 max-w-[1100px] mx-auto">
        <div className="bg-mint-chip text-carbon-black rounded-[var(--radius-xl)] p-10 md:p-16">
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] mb-6">No smartphone? No problem.</p>
          <h2 className="font-[var(--font-display)] uppercase leading-[0.95] text-[clamp(2rem,5vw,3.5rem)]">
            Works on any phone.
          </h2>
          <p className="font-[var(--font-body)] text-md mt-6 max-w-[560px] leading-relaxed">
            Dial a USSD shortcode to search by crop or problem. Text keywords like
            <span className="font-[var(--font-mono)]"> SEED SORGHUM MACHAKOS</span> for instant matches.
            Or send a WhatsApp voice note in Swahili or Kikamba.
          </p>
          <Link to="/channels" className="inline-block mt-8 font-[var(--font-mono)] text-xs uppercase tracking-widest bg-carbon-black text-paper-white px-6 py-3 rounded-[var(--radius-md)]">
            Explore channels →
          </Link>
        </div>
      </section>

      <MiniFooter />
    </div>
  )
}
