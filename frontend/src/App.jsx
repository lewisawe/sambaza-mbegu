import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import SearchPanel from './components/SearchPanel'
import ProvenanceGraph from './components/ProvenanceGraph'
import SeedDetail from './components/SeedDetail'

const KENYA_CENTER = [-0.8, 37.5]

function FlyTo({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 12, { duration: 1 })
  }, [center, zoom])
  return null
}

export default function App() {
  const [results, setResults] = useState([])
  const [provenance, setProvenance] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [flyTarget, setFlyTarget] = useState(null)
  const markerRefs = useRef({})

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const handleSearch = async (params) => {
    setLoading(true)
    setProvenance(null)
    setSelectedResult(null)
    setFlyTarget(null)
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`/api/seeds/search?${qs}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
    // Fly to first result if any
    if (data.length && data[0].farmer?.lat) {
      setFlyTarget([data[0].farmer.lat, data[0].farmer.lng])
    }
  }

  const handleSelectResult = (result, index) => {
    setSelectedResult(result)
    if (result.farmer?.lat) {
      setFlyTarget([result.farmer.lat, result.farmer.lng])
    }
    // Open the marker popup
    setTimeout(() => {
      const ref = markerRefs.current[index]
      if (ref) ref.openPopup()
    }, 600)
  }

  const handleProvenance = async (result) => {
    setLoading(true)
    setSelectedResult(result)
    const res = await fetch(`/api/seeds/${encodeURIComponent(result.seed?.id)}/provenance`)
    setProvenance(await res.json())
    setLoading(false)
  }

  const handleBack = () => {
    setProvenance(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__brand">
          <span className="header__icon">𓇌</span>
          <h1 className="header__title">Sambaza Mbegu</h1>
          <span className="header__subtitle">Indigenous Seed Network</span>
        </div>
        {stats && (
          <div className="header__stats">
            <span>{stats.farmers} farmers</span>
            <span className="header__dot">·</span>
            <span>{stats.seeds} varieties</span>
            <span className="header__dot">·</span>
            <span>{stats.shares} exchanges</span>
          </div>
        )}
      </header>

      <div className="layout">
        <aside className="sidebar">
          <SearchPanel
            onSearch={handleSearch}
            results={results}
            onSelect={handleSelectResult}
            onProvenance={handleProvenance}
            loading={loading}
            selectedIndex={results.indexOf(selectedResult)}
          />
        </aside>

        <main className="main">
          {loading && (
            <div className="loader">
              <div className="loader__seed"></div>
            </div>
          )}

          {provenance && selectedResult ? (
            <div className="provenance-view">
              <div className="provenance-view__header">
                <button onClick={handleBack} className="btn-back">← Back to map</button>
                <SeedDetail result={selectedResult} />
              </div>
              <div className="provenance-view__graph">
                <ProvenanceGraph data={provenance} />
              </div>
            </div>
          ) : (
            <MapContainer center={KENYA_CENTER} zoom={7} className="map" scrollWheelZoom={true} zoomControl={true}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution="&copy; CARTO"
              />
              <FlyTo center={flyTarget} zoom={11} />
              {results.map((r, i) => r.farmer?.lat && (
                <CircleMarker
                  key={i}
                  center={[r.farmer.lat, r.farmer.lng]}
                  radius={10}
                  fillColor="#b45309"
                  fillOpacity={0.85}
                  color="#fef3c7"
                  weight={2}
                  ref={el => { markerRefs.current[i] = el }}
                >
                  <Popup>
                    <div className="popup-content">
                      <p className="popup__name">{r.farmer.name}</p>
                      <p className="popup__seed">{r.seed?.local_name}</p>
                      <p className="popup__meta">{r.seed?.crop_type} · Since {r.grows_info?.since_year}</p>
                      <p className="popup__location">{r.location?.county} · {r.farmer.farm_size_acres} acres</p>
                      <button className="popup__btn" onClick={() => handleProvenance(r)}>
                        View seed provenance →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}

          {!provenance && results.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-state__icon">𓇌</div>
              <h2>Discover indigenous seeds near you</h2>
              <p>Search by crop, trait, or county to find farmers growing traditional varieties adapted to your conditions.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
