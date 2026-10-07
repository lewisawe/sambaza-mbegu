import React from 'react'

export default function Terms() {
  return (
    <main className="bg-warm-canvas text-carbon-black font-[var(--font-body)]">
      <section className="max-w-[760px] mx-auto px-6 pt-16 pb-24">
        <p className="font-[var(--font-mono)] text-xs uppercase tracking-[0.3em] text-slate mb-6">Legal</p>
        <h1 className="font-[var(--font-display)] uppercase leading-[0.9] text-[clamp(2.5rem,6vw,4rem)]">Terms</h1>
        <div className="mt-8 space-y-5 text-md text-slate leading-relaxed">
          <p>
            Kimur is a platform for discovering and exchanging indigenous seed varieties.
            Exchanges happen directly between farmers; Kimur facilitates the connection but
            is not a party to any transaction.
          </p>
          <p>
            Sharing indigenous seeds is legal in Kenya following the 2025 High Court ruling.
            You are responsible for the accuracy of listings you create and for honoring
            exchanges you confirm.
          </p>
          <p>
            Use the platform respectfully. Misrepresenting varieties, gaming reputation, or
            harassing other users may result in removal. This is a concise summary; full
            terms will accompany public launch.
          </p>
        </div>
      </section>
    </main>
  )
}
