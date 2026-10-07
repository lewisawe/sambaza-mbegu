import React from 'react'
import { Link } from 'react-router-dom'
import seedsSackImg from '../assets/img/seeds-sack.webp'
import maleFarmers from '../assets/img/male-farmers.webp'

const DASHBOARDS = [
  {
    t: 'County agriculture offices',
    d: 'Coverage-gap reports, extinction-risk alerts, and farmer/variety data by sub-county for policy and distribution planning.',
  },
  {
    t: 'Seed banks & NGOs',
    d: 'Distribution visibility: see where varieties are concentrated, where they are missing, and which networks depend on a single grower.',
  },
  {
    t: 'Research organizations',
    d: 'National analytics on variety performance, provenance, and network vulnerability for CGIAR, ICRISAT, and similar partners.',
  },
]

const PRICING = [
  { tier: 'County dashboard', price: 'KES 50,000', unit: '/ year per county' },
  { tier: 'NGO / research analytics', price: 'KES 100,000', unit: '/ year, national API' },
]

export default function ForInstitutions() {
  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">For institutions</p>
          <h1 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.5rem,7vw,5rem)]">
            See the whole network.
          </h1>
          <p className="font-[var(--font-body)] text-lg text-slate mt-8 max-w-[620px] leading-relaxed">
            Every farmer search, listing, and exchange compounds into a living map of
            Kenya's seed system. Institutions use it to find coverage gaps, protect
            at-risk varieties, and target interventions where they matter.
          </p>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-xl)] bg-mist-gray aspect-[4/5]">
          <img
            src={seedsSackImg}
            alt="Sacks of indigenous seed prepared for distribution"
            width="640"
            height="800"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {DASHBOARDS.map(x => (
            <div key={x.t} className="bg-paper-white rounded-[var(--radius-lg)] p-8">
              <h2 className="font-[var(--font-display)] text-xl uppercase">{x.t}</h2>
              <p className="font-[var(--font-body)] text-sm text-slate mt-3 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-carbon-black text-paper-white px-6 py-20">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-mint-chip mb-4">What the data reveals</p>
            <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.8rem,4vw,3rem)] leading-[0.95]">
              Single points of failure, before they fail.
            </h2>
            <p className="font-[var(--font-body)] text-md text-ash mt-6 max-w-[640px] leading-relaxed">
              Network-vulnerability analysis finds varieties that trace back to very few
              growers. Gap detection flags wards with high search demand but zero local
              growers, with the nearest source and a recommended action. That is
              intelligence no one-off survey produces.
            </p>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-xl)] bg-graphite aspect-[4/3]">
            <img
              src={maleFarmers}
              alt="Kenyan farmers inspecting their crop in the field"
              loading="lazy"
              width="720"
              height="540"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.6rem,4vw,2.5rem)] mb-8">Institutional access</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {PRICING.map(p => (
            <div key={p.tier} className="bg-paper-white rounded-[var(--radius-lg)] p-8">
              <h3 className="font-[var(--font-display)] text-lg uppercase">{p.tier}</h3>
              <p className="font-[var(--font-display)] text-[2.5rem] leading-none mt-3">{p.price}</p>
              <p className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-slate mt-2">{p.unit}</p>
            </div>
          ))}
        </div>
        <p className="font-[var(--font-mono)] text-xs text-smoke mt-6">
          Indicative pricing. Institutional dashboards fund free feature-phone access for farmers.
        </p>
        <div className="mt-8">
          <Link to="/register" className="font-[var(--font-mono)] text-sm uppercase tracking-widest bg-carbon-black text-paper-white px-7 py-4 rounded-[var(--radius-md)] inline-block">
            Request institutional access
          </Link>
        </div>
      </section>
    </main>
  )
}
