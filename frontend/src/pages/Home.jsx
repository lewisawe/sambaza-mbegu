import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VarietyCard from '../components/public/VarietyCard'
import { traitLabel } from '../lib/seedFormat'

import heroGarden from '../assets/img/hero-garden.webp'
import plantingImg from '../assets/img/planting.webp'
import growingImg from '../assets/img/growing.webp'
import seedsImg from '../assets/img/seeds.webp'
import seedsSackImg from '../assets/img/seeds-sack.webp'
import womenFarmers from '../assets/img/women-farmers.webp'

/*
 * TAGLINE OPTIONS (chosen default = #1):
 *   1. "SEEDS YOUR GRANDMOTHER GREW, FINDABLE AGAIN."   <-- default
 *   2. "KENYA'S INDIGENOUS SEED NETWORK, MADE VISIBLE."
 *   3. "SHARE THE SEED. KEEP THE VARIETY ALIVE."
 */

const STAT_ITEMS = [
  { key: 'farmers', label: 'Farmers' },
  { key: 'seeds', label: 'Varieties' },
  { key: 'grow_links', label: 'Grow records' },
  { key: 'shares', label: 'Exchanges' },
  { key: 'counties', label: 'Counties' },
]

const STEPS = [
  { n: '01', t: 'Discover', d: 'Describe what you need in plain language. Kimur reads your intent and queries the seed graph for climate-matched varieties.' },
  { n: '02', t: 'Connect', d: 'See matching varieties and the growers near you, ranked by reputation. Trace a seed\'s provenance across decades.' },
  { n: '03', t: 'Share', d: 'Request seeds from a grower. Both confirm. Rate the exchange. Trust compounds across the whole network.' },
]

const CARD_IMAGES = [seedsImg, growingImg, plantingImg, seedsSackImg, heroGarden]

export default function Home() {
  const [stats, setStats] = useState(null)
  const [statsError, setStatsError] = useState(false)

  const [featured, setFeatured] = useState(null)
  const [featuredError, setFeaturedError] = useState(false)

  const [atRisk, setAtRisk] = useState(null)
  const [atRiskError, setAtRiskError] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => { if (!r.ok) throw new Error('bad status'); return r.json() })
      .then(setStats)
      .catch(() => setStatsError(true))

    fetch('/api/seeds/search')
      .then(r => { if (!r.ok) throw new Error('bad'); return r.json() })
      .then(d => setFeatured(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => setFeaturedError(true))

    fetch('/api/stats/extinction-risk')
      .then(r => { if (!r.ok) throw new Error('bad'); return r.json() })
      .then(d => setAtRisk(Array.isArray(d) ? d : []))
      .catch(() => setAtRiskError(true))
  }, [])

  return (
    <div className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      {/* Hero — split: giant headline + real full-bleed photo */}
      <section className="max-w-[1200px] mx-auto px-6 pt-10 pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">
            Indigenous seed network · Kenya
          </p>
          <h1 className="font-[var(--font-display)] uppercase leading-[0.9] tracking-tight text-[clamp(3rem,8vw,6.5rem)]">
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
              to="/varieties"
              className="font-[var(--font-mono)] text-sm uppercase tracking-widest border-2 border-carbon-black text-carbon-black px-7 py-4 rounded-[var(--radius-md)] hover:bg-carbon-black hover:text-paper-white transition-colors"
            >
              Browse varieties
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-xl)] bg-mist-gray aspect-[4/5] lg:aspect-[3/4]">
          <img
            src={heroGarden}
            alt="An indigenous crop garden in Kenya's semi-arid highlands"
            width="720"
            height="900"
            fetchpriority="high"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Live stats — bigger band, pulled from GET /api/stats, never hardcoded */}
      <section className="px-6 pb-20 max-w-[1200px] mx-auto">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-5">
          The network, right now
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STAT_ITEMS.map(item => (
            <div key={item.key} className="bg-paper-white rounded-[var(--radius-lg)] p-7">
              {stats ? (
                <p className="font-[var(--font-display)] text-[clamp(2.5rem,5vw,3.5rem)] leading-none text-carbon-black">
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

      {/* Problem -> solution narrative, with section photo */}
      <section className="bg-carbon-black text-paper-white px-6 py-24">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
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
              thrives, or how a variety has survived. Kimur makes that network visible,
              one real grow record at a time.
            </p>
            <Link to="/about" className="inline-block mt-8 font-[var(--font-mono)] text-xs uppercase tracking-widest underline text-paper-white">
              Read the full story →
            </Link>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-xl)] bg-graphite aspect-[4/3]">
            <img
              src={plantingImg}
              alt="A farmer planting indigenous seed by hand"
              loading="lazy"
              width="720"
              height="540"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* How it works in 3 steps */}
      <section className="px-6 py-24 max-w-[1200px] mx-auto">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-5">In three steps</p>
        <h2 className="font-[var(--font-display)] uppercase leading-[0.95] text-[clamp(1.8rem,5vw,3.5rem)] mb-10">
          Discover. Connect. Share.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(step => (
            <div key={step.n} className="bg-paper-white rounded-[var(--radius-lg)] p-8">
              <p className="font-[var(--font-display)] text-[3rem] leading-none text-mint-chip bg-carbon-black inline-block px-3 rounded-[var(--radius-sm)]">
                {step.n}
              </p>
              <h3 className="font-[var(--font-display)] text-2xl uppercase mt-4">{step.t}</h3>
              <p className="font-[var(--font-body)] text-sm text-slate mt-3 leading-relaxed">{step.d}</p>
            </div>
          ))}
        </div>
        <Link to="/how-it-works" className="inline-block mt-8 font-[var(--font-mono)] text-xs uppercase tracking-widest underline">
          See how it works →
        </Link>
      </section>

      {/* Featured varieties — real data from /api/seeds/search, no phone numbers */}
      {!featuredError && (featured === null || featured.length > 0) && (
        <section className="px-6 pb-24 max-w-[1200px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-3">From the seed graph</p>
              <h2 className="font-[var(--font-display)] uppercase leading-[0.95] text-[clamp(1.8rem,5vw,3.5rem)]">
                Varieties on the record.
              </h2>
            </div>
            <Link to="/varieties" className="font-[var(--font-mono)] text-xs uppercase tracking-widest bg-carbon-black text-paper-white px-6 py-3 rounded-[var(--radius-md)]">
              Browse all →
            </Link>
          </div>
          {featured === null ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-paper-white rounded-[var(--radius-lg)] p-6">
                  <div className="aspect-[4/3] bg-mist-gray rounded-[var(--radius-md)] animate-pulse" />
                  <div className="h-6 w-2/3 bg-mist-gray rounded-[var(--radius-sm)] mt-5 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((rec, i) => (
                <VarietyCard
                  key={rec?.seed?.id || i}
                  record={rec}
                  image={CARD_IMAGES[i % CARD_IMAGES.length]}
                  imageAlt={`${rec?.seed?.crop_type || 'Indigenous'} crop grown in Kenya`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Varieties at risk — real data from /api/stats/extinction-risk */}
      {!atRiskError && (atRisk === null || atRisk.length > 0) && (
        <section className="px-6 pb-24 max-w-[1200px] mx-auto">
          <div className="bg-voltage-yellow text-carbon-black rounded-[var(--radius-xl)] p-10 md:p-14">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] mb-6">Varieties at risk</p>
            {atRisk === null ? (
              <div className="h-12 w-3/4 bg-carbon-black/10 rounded-[var(--radius-sm)] animate-pulse" />
            ) : (
              <>
                <h2 className="font-[var(--font-display)] uppercase leading-[0.95] text-[clamp(2rem,5vw,3.75rem)]">
                  {atRisk.length} {atRisk.length === 1 ? 'variety is' : 'varieties are'} down to a handful of growers.
                </h2>
                <p className="font-[var(--font-body)] text-md mt-6 max-w-[620px] leading-relaxed">
                  These indigenous varieties, grown for 15+ years, now survive with
                  three or fewer growers on the network. When the last grower stops,
                  the variety is gone. Visibility is the first step to keeping them alive.
                </p>
                <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {atRisk.slice(0, 6).map((v, i) => (
                    <li key={(v.variety || '') + i} className="bg-carbon-black text-paper-white rounded-[var(--radius-md)] p-5">
                      <p className="font-[var(--font-mono)] text-[0.7rem] uppercase tracking-[0.25em] text-mint-chip">{v.crop}</p>
                      <p className="font-[var(--font-display)] text-xl uppercase leading-[0.95] mt-1">{v.variety || 'Unnamed variety'}</p>
                      <p className="font-[var(--font-mono)] text-xs text-ash mt-3">
                        {v.growers} {Number(v.growers) === 1 ? 'grower' : 'growers'}
                        {v.avg_years_grown ? ` · ~${v.avg_years_grown} yrs grown` : ''}
                      </p>
                      {Array.isArray(v.traits) && v.traits.length > 0 && (
                        <p className="font-[var(--font-body)] text-xs text-smoke mt-2">
                          {v.traits.map(traitLabel).join(' · ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>
      )}

      {/* Feature-phone band */}
      <section className="px-6 pb-24 max-w-[1200px] mx-auto">
        <div className="bg-mint-chip text-carbon-black rounded-[var(--radius-xl)] p-10 md:p-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
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
          <div className="overflow-hidden rounded-[var(--radius-lg)] bg-carbon-black/10 aspect-[4/3]">
            <img
              src={growingImg}
              alt="Indigenous crops growing in a smallholder field"
              loading="lazy"
              width="640"
              height="480"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Institutions value strip */}
      <section className="px-6 pb-24 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div className="overflow-hidden rounded-[var(--radius-xl)] bg-mist-gray aspect-[4/3] order-2 lg:order-1">
            <img
              src={seedsSackImg}
              alt="Sacks of harvested indigenous seed ready for distribution"
              loading="lazy"
              width="640"
              height="480"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="order-1 lg:order-2">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">For institutions</p>
            <h2 className="font-[var(--font-display)] uppercase leading-[0.95] text-[clamp(1.8rem,5vw,3.25rem)]">
              See the whole seed system.
            </h2>
            <p className="font-[var(--font-body)] text-md text-slate mt-6 max-w-[560px] leading-relaxed">
              Every search, listing, and exchange compounds into a living map. County
              offices, seed banks, and research organizations use it to find coverage
              gaps and protect at-risk varieties before they vanish.
            </p>
            <Link to="/for-institutions" className="inline-block mt-8 font-[var(--font-mono)] text-xs uppercase tracking-widest border-2 border-carbon-black px-6 py-3 rounded-[var(--radius-md)] hover:bg-carbon-black hover:text-paper-white transition-colors">
              For institutions →
            </Link>
          </div>
        </div>
      </section>

      {/* Closing CTA with photo */}
      <section className="px-6 pb-24 max-w-[1200px] mx-auto">
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-carbon-black text-paper-white">
          <img
            src={womenFarmers}
            alt="Kenyan women farmers in the field"
            loading="lazy"
            width="1200"
            height="640"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="relative px-8 py-20 md:px-16 md:py-28 max-w-[720px]">
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-mint-chip mb-6">
              Join the network
            </p>
            <h2 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.25rem,6vw,4.5rem)]">
              Keep the variety alive.
            </h2>
            <p className="font-[var(--font-body)] text-md text-ash mt-6 max-w-[520px] leading-relaxed">
              Find the seed, trace its story, and share it on. Every grow record you add
              makes the next farmer's search faster.
            </p>
            <div className="flex flex-wrap gap-4 mt-10">
              <Link to="/register" className="font-[var(--font-mono)] text-sm uppercase tracking-widest bg-mint-chip text-carbon-black px-7 py-4 rounded-[var(--radius-md)] hover:bg-paper-white transition-colors">
                Sign up
              </Link>
              <Link to="/login" className="font-[var(--font-mono)] text-sm uppercase tracking-widest border-2 border-paper-white text-paper-white px-7 py-4 rounded-[var(--radius-md)] hover:bg-paper-white hover:text-carbon-black transition-colors">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
