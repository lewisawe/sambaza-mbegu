import React from 'react'
import { Link } from 'react-router-dom'

const USSD_TREE = `*384*738#   (738 = "SEW" for seed)

[1] Find Seeds
    [1] By Crop
        Sorghum · Millet · Cowpea · Pigeon Pea · Green Gram · Maize
        -> "3 growers near you. Reply 1-3 for contact."
    [2] By Problem
        Drought · Pests · Low Soil · Short Season
        -> top matches for your registered location
    [3] Near Me
        -> varieties available within 20km

[2] Share Seeds
    [1] I have seeds to share   -> listed for 90 days
    [2] Log an exchange         -> records sharing event

[3] My Seeds
    -> varieties you've registered (add / remove)

[4] Register
    -> name, phone, county, sub-county, ward
    -> what do you grow? (multi-select) · how long? (years)`

const SMS_KEYWORDS = [
  { kw: 'SEED SORGHUM MACHAKOS', d: 'Top 3 matches with phone numbers' },
  { kw: 'SHARE COWPEA', d: 'Register that you have seed available' },
  { kw: 'RENEW', d: 'Keep an expiring listing active' },
  { kw: 'STOP', d: 'Unsubscribe from notifications' },
]

export default function Channels() {
  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      <section className="max-w-[1100px] mx-auto px-6 pt-16 pb-12">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">Access channels</p>
        <h1 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.5rem,7vw,5rem)]">
          Any phone works.
        </h1>
        <p className="font-[var(--font-body)] text-lg text-slate mt-8 max-w-[620px] leading-relaxed">
          Most Kenyan farmers use feature phones. Kimur meets them there, over USSD and
          SMS, as well as WhatsApp and the web. The same seed graph powers all four.
        </p>
      </section>

      {/* USSD */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="bg-paper-white rounded-[var(--radius-lg)] p-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-[var(--font-display)] text-2xl uppercase">USSD · widest reach</h2>
            <span className="font-[var(--font-mono)] text-xs text-smoke">free for the farmer · 3 menu levels · 60s session</span>
          </div>
          <pre className="font-[var(--font-mono)] text-xs md:text-sm leading-relaxed text-slate mt-5 overflow-x-auto whitespace-pre bg-mist-gray rounded-[var(--radius-md)] p-5">{USSD_TREE}</pre>
        </div>
      </section>

      {/* SMS */}
      <section className="max-w-[1100px] mx-auto px-6 pb-12">
        <div className="bg-paper-white rounded-[var(--radius-lg)] p-8">
          <h2 className="font-[var(--font-display)] text-2xl uppercase">SMS · any phone, no session</h2>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            {SMS_KEYWORDS.map(k => (
              <div key={k.kw} className="border-2 border-carbon-black rounded-[var(--radius-md)] p-4">
                <p className="font-[var(--font-mono)] text-sm font-bold">{k.kw}</p>
                <p className="font-[var(--font-body)] text-sm text-slate mt-1">{k.d}</p>
              </div>
            ))}
          </div>
          <p className="font-[var(--font-mono)] text-xs text-smoke mt-5">
            Outbound example: "2 farmers near Wote have millet ready to share this month. Reply YES for contacts."
          </p>
        </div>
      </section>

      {/* WhatsApp */}
      <section className="max-w-[1100px] mx-auto px-6 pb-20">
        <div className="bg-mint-chip text-carbon-black rounded-[var(--radius-xl)] p-10">
          <h2 className="font-[var(--font-display)] text-2xl uppercase">WhatsApp · voice & text</h2>
          <ol className="font-[var(--font-body)] text-md mt-5 space-y-2 max-w-[620px] leading-relaxed list-decimal list-inside">
            <li>Send a text or voice note: "I need something drought-resistant for my shamba in Kitui, sandy soil."</li>
            <li>Kimur interprets it, queries the graph, and returns matching growers.</li>
            <li>Tap "Connect" for a direct WhatsApp link to the grower.</li>
          </ol>
          <p className="font-[var(--font-mono)] text-xs mt-5">
            Voice notes in Swahili or Kikamba are transcribed, understood, and answered in the same language.
          </p>
        </div>
      </section>

      <section className="max-w-[1100px] mx-auto px-6 pb-20">
        <Link to="/register" className="font-[var(--font-mono)] text-sm uppercase tracking-widest bg-carbon-black text-paper-white px-7 py-4 rounded-[var(--radius-md)] inline-block">
          Get started on the web
        </Link>
      </section>
    </main>
  )
}
