import React from 'react'
import { Link } from 'react-router-dom'
import plantingImg from '../assets/img/planting.webp'
import seedsImg from '../assets/img/seeds.webp'

const STEPS = [
  {
    n: '01',
    t: 'Search',
    d: 'Describe what you need in plain language, "drought-tolerant sorghum for acidic soil near Machakos." Kimur extracts your intent and queries the seed graph.',
  },
  {
    n: '02',
    t: 'Discover',
    d: 'See matching varieties on the map. View provenance chains showing who grew it, where it thrived, and how long it survived. Check the grower\'s reputation score.',
  },
  {
    n: '03',
    t: 'Exchange',
    d: 'Request seeds from a grower. Both parties confirm the exchange happened. Rate the experience. Trust builds across the network.',
  },
]

const AUDIENCES = [
  {
    t: 'For farmers',
    d: 'Find climate-matched varieties and nearby growers in seconds, on a smartphone or a feature phone. Build a reputation every time you share.',
  },
  {
    t: 'For extension workers',
    d: 'Spot coverage gaps and at-risk varieties across your wards so limited field time lands where it counts most.',
  },
  {
    t: 'For institutions',
    d: 'Read the whole network, variety spread, provenance depth, and single points of failure, to target seed-bank and research investment.',
  },
]

export default function HowItWorks() {
  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">How it works</p>
          <h1 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.5rem,7vw,5rem)]">
            Search. Discover. Exchange.
          </h1>
          <p className="font-[var(--font-body)] text-lg text-slate mt-8 max-w-[620px] leading-relaxed">
            Kimur connects farmers who grow indigenous varieties with those who need them.
            A graph database maps the relationships between seeds, farmers, soil types, and
            climate zones so matches that flat databases miss surface in seconds.
          </p>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-xl)] bg-mist-gray aspect-[4/5]">
          <img
            src={seedsImg}
            alt="A close view of indigenous seed varieties"
            width="640"
            height="800"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map(s => (
            <div key={s.n} className="bg-paper-white rounded-[var(--radius-lg)] p-8">
              <p className="font-[var(--font-display)] text-[3rem] leading-none text-mint-chip bg-carbon-black inline-block px-3 rounded-[var(--radius-sm)]">{s.n}</p>
              <h2 className="font-[var(--font-display)] text-2xl uppercase mt-4">{s.t}</h2>
              <p className="font-[var(--font-body)] text-sm text-slate mt-3 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-carbon-black text-paper-white px-6 py-20">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-mint-chip mb-4">The graph advantage</p>
            <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.8rem,4vw,3rem)] leading-[0.95]">
              Relationships flat databases can't model.
            </h2>
            <p className="font-[var(--font-body)] text-md text-ash mt-6 max-w-[640px] leading-relaxed">
              Every farmer, seed, soil type, and climate zone is a node. Every "grows,"
              "shares," and "thrives in" is an edge. That structure lets Kimur trace a
              variety's provenance across decades and find climate-matched seed within
              a radius of your shamba.
            </p>
          </div>
          <div className="overflow-hidden rounded-[var(--radius-xl)] bg-graphite aspect-[4/3]">
            <img
              src={plantingImg}
              alt="A farmer sowing indigenous seed in a prepared field"
              loading="lazy"
              width="720"
              height="540"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Segmented value props */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.6rem,4vw,2.75rem)] mb-10">Built for everyone in the network</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {AUDIENCES.map(a => (
            <div key={a.t} className="bg-paper-white rounded-[var(--radius-lg)] p-8">
              <h3 className="font-[var(--font-display)] text-xl uppercase">{a.t}</h3>
              <p className="font-[var(--font-body)] text-sm text-slate mt-3 leading-relaxed">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.6rem,4vw,2.5rem)] mb-8">Beyond the web</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-mint-chip text-carbon-black rounded-[var(--radius-lg)] p-8">
            <h3 className="font-[var(--font-display)] text-xl uppercase">Feature-phone access</h3>
            <p className="font-[var(--font-body)] text-sm mt-3 leading-relaxed">
              No smartphone needed. Dial the USSD shortcode for menu-based search, or
              text keywords like <span className="font-[var(--font-mono)]">SEED SORGHUM MACHAKOS</span> to find growers instantly.
            </p>
          </div>
          <div className="bg-paper-white rounded-[var(--radius-lg)] p-8">
            <h3 className="font-[var(--font-display)] text-xl uppercase">Voice search</h3>
            <p className="font-[var(--font-body)] text-sm text-slate mt-3 leading-relaxed">
              Send a WhatsApp voice note in Swahili or Kikamba. Kimur transcribes it,
              understands your need, and replies in your language.
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/register" className="font-[var(--font-mono)] text-sm uppercase tracking-widest bg-carbon-black text-paper-white px-7 py-4 rounded-[var(--radius-md)]">
            Start searching
          </Link>
          <Link to="/channels" className="font-[var(--font-mono)] text-sm uppercase tracking-widest border-2 border-carbon-black px-7 py-4 rounded-[var(--radius-md)] hover:bg-carbon-black hover:text-paper-white transition-colors">
            See all channels
          </Link>
        </div>
      </section>
    </main>
  )
}
