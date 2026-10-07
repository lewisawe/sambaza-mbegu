import React from 'react'

export default function Privacy() {
  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      <section className="max-w-[760px] mx-auto px-6 pt-16 pb-24">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">Legal</p>
        <h1 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.5rem,6vw,4rem)]">Privacy</h1>
        <div className="mt-8 space-y-5 text-md text-slate leading-relaxed">
          <p>
            Kimur collects only what it needs to connect farmers: your phone number, role,
            location (county, sub-county, ward), and the varieties you grow or seek. We use
            this to match you with growers and to surface coverage gaps for institutions.
          </p>
          <p>
            We never sell personal data. Contact details are shared with another farmer only
            when you request or accept an exchange. Institutional dashboards see aggregated,
            network-level data, not your identity.
          </p>
          <p>
            You can request removal of your profile at any time through the channel you
            registered on. This is a concise summary; a full policy will accompany public launch.
          </p>
        </div>
      </section>
    </main>
  )
}
