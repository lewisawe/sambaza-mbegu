import React, { useState } from 'react'

const COUNTIES = ['Machakos', 'Kitui', 'Makueni', 'Tharaka-Nithi', 'Meru', 'Embu']
const CROPS = ['Sorghum', 'Millet', 'Cowpea', 'Pigeon Pea', 'Green Gram', 'Maize']
const TRAITS = ['Drought Resistant', 'Short Season', 'Pest Resistant', 'High Yield', 'Low Input']

export default function SearchPanel({ onSearch, onAISearch, results, onSelect, onProvenance, loading, selectedIndex }) {
  const [query, setQuery] = useState('')
  const [crop, setCrop] = useState('')
  const [trait, setTrait] = useState('')
  const [county, setCounty] = useState('')
  const [mode, setMode] = useState('ai')

  const handleAISubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    onAISearch(query.trim())
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    const params = {}
    if (crop) params.crop = crop
    if (trait) params.trait = trait.toLowerCase().replace(/ /g, '_')
    if (county) params.county = county
    onSearch(params)
  }

  return (
    <div className="p-6">
      {/* Mode toggle */}
      <div className="flex border border-graphite-border rounded-none mb-6">
        <button
          onClick={() => setMode('ai')}
          className={`flex-1 font-[var(--font-chivo-mono)] text-[12px] uppercase px-3 py-2 transition-colors ${
            mode === 'ai' ? 'bg-ember-orange text-void-black' : 'text-steel-mid hover:text-bone-white'
          }`}
        >
          AI SEARCH
        </button>
        <button
          onClick={() => setMode('filter')}
          className={`flex-1 font-[var(--font-chivo-mono)] text-[12px] uppercase px-3 py-2 transition-colors ${
            mode === 'filter' ? 'bg-ember-orange text-void-black' : 'text-steel-mid hover:text-bone-white'
          }`}
        >
          FILTERS
        </button>
      </div>

      {/* AI Search */}
      {mode === 'ai' && (
        <form onSubmit={handleAISubmit}>
          <label className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase block mb-2">
            DESCRIBE WHAT YOU NEED
          </label>
          <textarea
            id="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="e.g. I have 2 acres in Kitui, sandy soil, need something that survives dry seasons and matures fast"
            rows={3}
            className="w-full bg-carbon border border-graphite-border rounded-none px-4 py-3 text-[16px] text-bone-white placeholder:text-steel-mid focus:outline-none focus:border-ember-orange resize-none"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full mt-3 bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[14px] uppercase px-4 py-3 rounded-none disabled:opacity-40"
          >
            {loading ? 'SEARCHING...' : 'FIND SEEDS'}
          </button>
        </form>
      )}

      {/* Filter Search */}
      {mode === 'filter' && (
        <form onSubmit={handleFilterSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase block mb-2">CROP</label>
            <select
              value={crop}
              onChange={e => setCrop(e.target.value)}
              className="w-full bg-carbon border border-graphite-border rounded-none px-4 py-3 text-[14px] text-bone-white focus:outline-none focus:border-ember-orange"
            >
              <option value="">All crops</option>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase block mb-2">TRAIT</label>
            <select
              value={trait}
              onChange={e => setTrait(e.target.value)}
              className="w-full bg-carbon border border-graphite-border rounded-none px-4 py-3 text-[14px] text-bone-white focus:outline-none focus:border-ember-orange"
            >
              <option value="">Any trait</option>
              {TRAITS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase block mb-2">COUNTY</label>
            <select
              value={county}
              onChange={e => setCounty(e.target.value)}
              className="w-full bg-carbon border border-graphite-border rounded-none px-4 py-3 text-[14px] text-bone-white focus:outline-none focus:border-ember-orange"
            >
              <option value="">All counties</option>
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[14px] uppercase px-4 py-3 rounded-none disabled:opacity-40"
          >
            {loading ? 'SEARCHING...' : 'SEARCH'}
          </button>
        </form>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-6">
          <p className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid uppercase pb-3 border-b border-graphite-border">
            {results.length} VARIETIES FOUND
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {results.map((r, i) => (
              <article
                key={i}
                onClick={() => onSelect(r, i)}
                className={`p-4 border cursor-pointer transition-all ${
                  i === selectedIndex
                    ? 'border-ember-orange bg-carbon'
                    : 'border-graphite-border hover:border-fog-light'
                }`}
              >
                <span className="font-[var(--font-chivo-mono)] text-[11px] text-ember-orange uppercase">
                  {r.seed?.crop_type}
                </span>
                <h4 className="font-[var(--font-twk-everett)] text-[18px] font-light text-bone-white mt-1">
                  {r.seed?.local_name}
                </h4>
                <p className="text-[13px] text-fog-light">{r.seed?.name}</p>
                <div className="flex gap-3 mt-2 font-[var(--font-chivo-mono)] text-[11px] text-steel-mid">
                  <span>{r.farmer?.name}</span>
                  <span>{r.location?.county}</span>
                  <span>Since {r.grows_info?.since_year}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onProvenance(r) }}
                  className="mt-3 font-[var(--font-chivo-mono)] text-[11px] text-ember-orange uppercase hover:text-bone-white transition-colors"
                >
                  VIEW PROVENANCE →
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
