import React, { useState } from 'react'

const COUNTIES = ['Machakos', 'Kitui', 'Makueni', 'Tharaka-Nithi', 'Meru', 'Embu']
const CROPS = ['Sorghum', 'Millet', 'Cowpea', 'Pigeon Pea', 'Green Gram', 'Maize']
const TRAITS = ['Drought Resistant', 'Short Season', 'Pest Resistant', 'High Yield', 'Low Input']

export default function SearchPanel({ onSearch, results, onSelect, onProvenance, loading, selectedIndex }) {
  const [crop, setCrop] = useState('')
  const [trait, setTrait] = useState('')
  const [county, setCounty] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const params = {}
    if (crop) params.crop = crop
    if (trait) params.trait = trait.toLowerCase().replace(/ /g, '_')
    if (county) params.county = county
    onSearch(params)
  }

  return (
    <div className="search-panel">
      <div className="search-panel__header">
        <h2>Find Seeds</h2>
        <p>Match varieties to your land</p>
      </div>

      <form onSubmit={handleSubmit} className="search-panel__form">
        <div className="field">
          <label>Crop</label>
          <select value={crop} onChange={e => setCrop(e.target.value)}>
            <option value="">All crops</option>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Trait</label>
          <select value={trait} onChange={e => setTrait(e.target.value)}>
            <option value="">Any trait</option>
            {TRAITS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="field">
          <label>County</label>
          <select value={county} onChange={e => setCounty(e.target.value)}>
            <option value="">All counties</option>
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-search" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="results">
          <p className="results__count">{results.length} varieties found</p>
          <div className="results__list">
            {results.map((r, i) => (
              <article
                key={i}
                className={`result-card ${i === selectedIndex ? 'result-card--active' : ''}`}
                onClick={() => onSelect(r, i)}
              >
                <div className="result-card__crop">{r.seed?.crop_type}</div>
                <h4 className="result-card__local">{r.seed?.local_name}</h4>
                <p className="result-card__name">{r.seed?.name}</p>
                <div className="result-card__footer">
                  <span>👤 {r.farmer?.name}</span>
                  <span>📍 {r.location?.county}</span>
                  <span>🌱 Since {r.grows_info?.since_year}</span>
                </div>
                <div className="result-card__actions">
                  <button
                    className="btn-provenance"
                    onClick={(e) => { e.stopPropagation(); onProvenance(r) }}
                  >
                    View provenance trail
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
