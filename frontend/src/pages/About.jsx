import React from 'react'
import { Link } from 'react-router-dom'
import heroGarden from '../assets/img/hero-garden.webp'
import womenFarmers from '../assets/img/women-farmers.webp'

export default function About() {
  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div>
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">About Kimur</p>
          <h1 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.5rem,7vw,5rem)]">
            Keeping indigenous varieties alive.
          </h1>
          <p className="font-[var(--font-body)] text-lg text-slate mt-8 max-w-[620px] leading-relaxed">
            Kimur digitizes Kenya's informal indigenous seed-sharing networks. Farmers
            find climate-adapted varieties matched to their conditions, trace a seed's
            provenance, and connect with growers to exchange seeds, all on a knowledge
            graph that compounds value with every interaction.
          </p>
        </div>
        <div className="overflow-hidden rounded-[var(--radius-xl)] bg-mist-gray aspect-[4/5]">
          <img
            src={heroGarden}
            alt="Indigenous crops thriving in a Kenyan smallholder garden"
            width="640"
            height="800"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Narrative arc: villain -> turning point -> gap -> solution */}
      <section className="bg-carbon-black text-paper-white px-6 py-20">
        <div className="max-w-[900px] mx-auto grid gap-12">
          <div>
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-smoke mb-3">The villain</p>
            <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.8rem,4vw,2.75rem)] leading-[0.95]">
              For years, sharing seeds was a crime.
            </h2>
            <p className="font-[var(--font-body)] text-md text-ash mt-4 max-w-[620px] leading-relaxed">
              Seed laws criminalized the exchange of uncertified indigenous varieties,
              pushing a practice as old as farming itself underground and eroding the
              diversity that smallholders depend on in arid and semi-arid lands.
            </p>
          </div>
          <div>
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-mint-chip mb-3">The turning point</p>
            <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.8rem,4vw,2.75rem)] leading-[0.95]">
              In 2025, the High Court ruled seed-sharing legal again.
            </h2>
            <p className="font-[var(--font-body)] text-md text-ash mt-4 max-w-[620px] leading-relaxed">
              The ruling restored farmers' right to save, share, and exchange
              indigenous seeds. A practice that never stopped was finally legal once more.
            </p>
          </div>
          <div>
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-smoke mb-3">The gap</p>
            <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.8rem,4vw,2.75rem)] leading-[0.95]">
              90% of African seeds still move with no digital record.
            </h2>
            <p className="font-[var(--font-body)] text-md text-ash mt-4 max-w-[620px] leading-relaxed">
              Farmers can't find who grows what, where a variety thrives, or trace its
              history. Seed companies won't build this infrastructure, it undercuts
              their hybrids.
            </p>
          </div>
          <div>
            <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-mint-chip mb-3">The solution</p>
            <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.8rem,4vw,2.75rem)] leading-[0.95]">
              A living map of the seed network.
            </h2>
            <p className="font-[var(--font-body)] text-md text-ash mt-4 max-w-[620px] leading-relaxed">
              Kimur models farmers, seeds, soils, and climate zones as a graph. It can
              answer questions a flat database can't, like finding drought-tolerant
              sorghum grown for 20+ years in acidic soil within 30km, in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Who we serve */}
      <section className="max-w-[1200px] mx-auto px-6 py-20">
        <h2 className="font-[var(--font-display)] uppercase text-[clamp(1.8rem,4vw,3rem)] mb-10">Who Kimur serves</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { t: 'Smallholder farmers', d: '7M+ farming households, most on feature phones. Trust comes from community, not brands.' },
            { t: 'Extension workers', d: '~7,000 nationally at a 1:1000 ratio. Tools to make limited field time count.' },
            { t: 'Institutions', d: 'County agriculture offices, seed banks, NGOs, and research orgs needing variety and coverage data.' },
          ].map(x => (
            <div key={x.t} className="bg-paper-white rounded-[var(--radius-lg)] p-8">
              <h3 className="font-[var(--font-display)] text-xl uppercase">{x.t}</h3>
              <p className="font-[var(--font-body)] text-sm text-slate mt-3 leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Where & what: dataset context — real crops and counties */}
      <section className="max-w-[1200px] mx-auto px-6 pb-20 grid lg:grid-cols-2 gap-10 items-center">
        <div className="overflow-hidden rounded-[var(--radius-xl)] bg-mist-gray aspect-[4/3]">
          <img
            src={womenFarmers}
            alt="Kenyan women farmers tending indigenous crops"
            loading="lazy"
            width="720"
            height="540"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">Where we start</p>
          <h2 className="font-[var(--font-display)] uppercase leading-[0.95] text-[clamp(1.8rem,4vw,3rem)]">
            Six counties. Six staple crops.
          </h2>
          <p className="font-[var(--font-body)] text-md text-slate mt-6 leading-relaxed max-w-[560px]">
            Kimur begins in Kenya's arid and semi-arid lands, mapping the varieties that
            carry households through drought.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="bg-paper-white rounded-[var(--radius-md)] p-5">
              <p className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke mb-2">Counties</p>
              <p className="font-[var(--font-body)] text-sm text-slate leading-relaxed">
                Machakos · Kitui · Makueni · Tharaka-Nithi · Meru · Embu
              </p>
            </div>
            <div className="bg-paper-white rounded-[var(--radius-md)] p-5">
              <p className="font-[var(--font-mono)] text-xs uppercase tracking-widest text-smoke mb-2">Crops</p>
              <p className="font-[var(--font-body)] text-sm text-slate leading-relaxed">
                Sorghum · Millet · Cowpea · Pigeon pea · Green gram · Maize
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 pb-20">
        <Link to="/register" className="font-[var(--font-mono)] text-sm uppercase tracking-widest bg-carbon-black text-paper-white px-7 py-4 rounded-[var(--radius-md)] inline-block">
          Join the network
        </Link>
      </section>
    </main>
  )
}
