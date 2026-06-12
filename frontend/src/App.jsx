import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import SearchPanel from './components/SearchPanel'
import ProvenanceGraph from './components/ProvenanceGraph'
import SeedDetail from './components/SeedDetail'
import RecommendationCard from './components/RecommendationCard'
import AuthPanel from './components/AuthPanel'
import ExchangePanel from './components/ExchangePanel'
import ListingPanel from './components/ListingPanel'
import ExtinctionRiskLayer from './components/ExtinctionRiskLayer'
import NetworkVulnerability from './components/NetworkVulnerability'
import GapSplitView from './components/GapSplitView'
import SeasonalCalendar from './components/SeasonalCalendar'

const KENYA_CENTER = [-0.8, 37.5]

function FlyTo({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
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
  const [recommendation, setRecommendation] = useState(null)
  const [showHero, setShowHero] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showHowItWorks, setShowHowItWorks] = useState(false)
  const [exchangeMsg, setExchangeMsg] = useState(null)
  const [showExtinctionRisk, setShowExtinctionRisk] = useState(false)
  const [showNetworkVuln, setShowNetworkVuln] = useState(false)
  const [showGapView, setShowGapView] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [provenanceStory, setProvenanceStory] = useState(null)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token')
    return token ? { token, role: localStorage.getItem('role'), user_id: localStorage.getItem('user_id') } : null
  })
  const [activePanel, setActivePanel] = useState(null)
  const [sidebarWidth, setSidebarWidth] = useState(400)
  const markerRefs = useRef({})

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const handleSearch = async (params) => {
    setLoading(true)
    setProvenance(null)
    setSelectedResult(null)
    setFlyTarget(null)
    setRecommendation(null)
    setShowHero(false)
    setShowHowItWorks(false)
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`/api/seeds/search?${qs}`)
    const data = await res.json()
    setResults(data)
    setLoading(false)
    if (data.length && data[0].farmer?.lat) {
      setFlyTarget([data[0].farmer.lat, data[0].farmer.lng])
    }
  }

  const handleAISearch = async (query) => {
    setLoading(true)
    setProvenance(null)
    setSelectedResult(null)
    setFlyTarget(null)
    setRecommendation(null)
    setShowHero(false)
    setShowHowItWorks(false)
    try {
      const res = await fetch('/api/seeds/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await res.json()
      setResults(data.results || [])
      setRecommendation(data.recommendation || null)
      if (data.results?.length && data.results[0].farmer?.lat) {
        setFlyTarget([data.results[0].farmer.lat, data.results[0].farmer.lng])
      }
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const handleSelectResult = (result, index) => {
    setSelectedResult(result)
    if (result.farmer?.lat) {
      setFlyTarget([result.farmer.lat, result.farmer.lng])
    }
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

  const handleRequestExchange = async (result) => {
    if (!user) {
      setShowAuth(true)
      return
    }
    try {
      const res = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ listing_id: result.seed?.id || result.listing_id || '' })
      })
      const data = await res.json()
      if (res.ok) {
        setExchangeMsg('Exchange requested! Check your exchanges panel.')
      } else {
        setExchangeMsg(data.detail || 'Could not request exchange.')
      }
    } catch {
      setExchangeMsg('Network error. Try again.')
    }
    setTimeout(() => setExchangeMsg(null), 4000)
  }

  return (
    <div className="h-screen flex flex-col bg-void-black">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-3 bg-void-black border-b border-graphite-border z-50 relative">
        <div className="flex items-center gap-4">
          <span className="font-[var(--font-chivo-mono)] text-[16px] font-normal text-bone-white tracking-wide cursor-pointer" onClick={() => { setShowHero(true); setShowHowItWorks(false); setResults([]) }}>
            SAMBAZA MBEGU
          </span>
          {stats && (
            <div className="hidden md:flex gap-3 font-[var(--font-chivo-mono)] text-[11px] text-steel-mid">
              <span>{stats.farmers} FARMERS</span>
              <span>{stats.seeds} VARIETIES</span>
              <span>{stats.shares} EXCHANGES</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowHero(false); setShowHowItWorks(false); document.getElementById('search-input')?.focus() }} className="bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[12px] uppercase px-3 py-1.5 rounded-none">
            FIND SEEDS
          </button>
          {user ? (
            <>
              {user.role === 'farmer' && (
                <>
                  <button onClick={() => setActivePanel(activePanel === 'listing' ? null : 'listing')} className="border border-graphite-border text-bone-white font-[var(--font-chivo-mono)] text-[11px] uppercase px-2 py-1.5 hover:border-ember-orange">SHARE</button>
                  <button onClick={() => setActivePanel(activePanel === 'exchanges' ? null : 'exchanges')} className="border border-graphite-border text-bone-white font-[var(--font-chivo-mono)] text-[11px] uppercase px-2 py-1.5 hover:border-ember-orange">EXCHANGES</button>
                </>
              )}
              <button onClick={() => { localStorage.clear(); setUser(null); setActivePanel(null) }} className="text-[11px] text-steel-mid hover:text-red-400 font-[var(--font-chivo-mono)]">LOGOUT</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="border border-bone-white text-bone-white font-[var(--font-chivo-mono)] text-[11px] uppercase px-2 py-1.5 hover:bg-bone-white hover:text-void-black">SIGN IN</button>
          )}
        </div>
      </nav>

      {/* Toast */}
      {exchangeMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[2000] bg-carbon border border-ember-orange px-4 py-2 font-[var(--font-chivo-mono)] text-[12px] text-ember-orange shadow-xl">
          {exchangeMsg}
        </div>
      )}

      {/* Hero */}
      {showHero && !showHowItWorks && (
        <section className="flex-1 flex flex-col justify-center px-10 bg-void-black">
          <h1 className="font-[var(--font-twk-everett)] font-light text-[72px] leading-[1] tracking-[-0.79px] text-bone-white max-w-[800px]">
            Discover seeds your
            <span className="text-ember-orange"> grandmother</span> grew
          </h1>
          <p className="font-[var(--font-switzer)] text-[18px] text-fog-light mt-6 max-w-[540px] leading-[1.4]">
            Search Kenya's indigenous seed network. Find climate-adapted varieties matched to your soil, trace their provenance across decades, connect with growers near you.
          </p>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => { setShowHero(false); setTimeout(() => document.getElementById('search-input')?.focus(), 100) }}
              className="bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[14px] uppercase px-6 py-3 rounded-none"
            >
              SEARCH NOW
            </button>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="border border-bone-white text-bone-white font-[var(--font-chivo-mono)] text-[14px] uppercase px-6 py-3 rounded-none hover:bg-bone-white hover:text-void-black transition-colors"
            >
              HOW IT WORKS
            </button>
          </div>

          {/* Quick stats cards */}
          {stats && (
            <div className="flex gap-6 mt-16">
              {[
                { label: 'Farmers', value: stats.farmers, icon: '👤' },
                { label: 'Seed Varieties', value: stats.seeds, icon: '🌱' },
                { label: 'Exchanges', value: stats.shares, icon: '🤝' },
                { label: 'Counties', value: stats.counties, icon: '📍' },
              ].map(s => (
                <div key={s.label} className="border border-graphite-border px-5 py-4 bg-carbon">
                  <p className="text-[24px] font-[var(--font-twk-everett)] text-bone-white">{s.icon} {s.value}</p>
                  <p className="text-[11px] font-[var(--font-chivo-mono)] text-steel-mid uppercase mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* How It Works */}
      {showHowItWorks && (
        <section className="flex-1 overflow-y-auto px-10 py-12 bg-void-black">
          <button onClick={() => setShowHowItWorks(false)} className="font-[var(--font-chivo-mono)] text-[12px] text-steel-mid border border-graphite-border px-3 py-1.5 mb-8 hover:border-bone-white hover:text-bone-white">← BACK</button>
          <h2 className="font-[var(--font-twk-everett)] font-light text-[48px] text-bone-white">How It Works</h2>
          <p className="text-[16px] text-fog-light mt-4 max-w-[600px]">
            Sambaza Mbegu connects farmers who grow indigenous seed varieties with those who need them. The platform uses a graph database to map relationships between seeds, farmers, soil types, and climate zones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-[900px]">
            <div className="border border-graphite-border p-6 bg-carbon">
              <p className="text-[32px] mb-3">🔍</p>
              <h3 className="font-[var(--font-chivo-mono)] text-[14px] text-ember-orange uppercase">1. Search</h3>
              <p className="text-[14px] text-fog-light mt-2">Describe what you need in plain language. "Drought-tolerant sorghum for acidic soil near Machakos." The AI extracts your intent and queries the seed graph.</p>
            </div>
            <div className="border border-graphite-border p-6 bg-carbon">
              <p className="text-[32px] mb-3">🗺️</p>
              <h3 className="font-[var(--font-chivo-mono)] text-[14px] text-ember-orange uppercase">2. Discover</h3>
              <p className="text-[14px] text-fog-light mt-2">See matching varieties on the map. View provenance chains showing who grew it, where it thrived, and how long it survived. Check the grower's reputation score.</p>
            </div>
            <div className="border border-graphite-border p-6 bg-carbon">
              <p className="text-[32px] mb-3">🤝</p>
              <h3 className="font-[var(--font-chivo-mono)] text-[14px] text-ember-orange uppercase">3. Exchange</h3>
              <p className="text-[14px] text-fog-light mt-2">Request seeds from a grower. Both parties confirm the exchange happened. Rate the experience. Build trust in the network.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-[900px]">
            <div className="border border-graphite-border p-6 bg-carbon">
              <h3 className="font-[var(--font-chivo-mono)] text-[14px] text-ember-orange uppercase">📱 Feature Phone Access</h3>
              <p className="text-[14px] text-fog-light mt-2">No smartphone needed. Dial the USSD shortcode for menu-based search, or send SMS keywords: SEED SORGHUM MACHAKOS to find growers instantly.</p>
            </div>
            <div className="border border-graphite-border p-6 bg-carbon">
              <h3 className="font-[var(--font-chivo-mono)] text-[14px] text-ember-orange uppercase">🎤 Voice Search</h3>
              <p className="text-[14px] text-fog-light mt-2">Send a voice note on WhatsApp in Swahili or Kikamba. The system transcribes, understands your need, and replies in your language.</p>
            </div>
          </div>

          <div className="mt-12 border-t border-graphite-border pt-8 max-w-[600px]">
            <h3 className="font-[var(--font-chivo-mono)] text-[14px] text-bone-white uppercase">The Problem We Solve</h3>
            <p className="text-[14px] text-fog-light mt-3">
              Kenya's High Court ruled in 2025 that sharing indigenous seeds is legal again after years of criminalization. But 90% of African seeds still flow through informal networks with no digital infrastructure.
            </p>
            <p className="text-[14px] text-fog-light mt-3">
              Farmers can't find who grows what, where it thrives, or trace a variety's history. Seed companies won't build this. We did.
            </p>
            <p className="text-[14px] text-fog-light mt-3">
              The graph database models relationships that flat databases can't. It finds "drought-tolerant sorghum grown for 20+ years in acidic soil within 30km of me" in seconds.
            </p>
          </div>

          <button
            onClick={() => { setShowHero(false); setShowHowItWorks(false); setTimeout(() => document.getElementById('search-input')?.focus(), 100) }}
            className="mt-10 bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[14px] uppercase px-6 py-3"
          >
            START SEARCHING
          </button>
        </section>
      )}

      {/* Main layout */}
      {!showHero && !showHowItWorks && (
        <div className="flex-1 flex flex-col overflow-hidden" id="search">
          {/* Feature toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-carbon border-b border-graphite-border">
            <span className="text-[10px] text-steel-mid font-[var(--font-chivo-mono)] mr-2">LAYERS:</span>
            <button onClick={() => setShowExtinctionRisk(!showExtinctionRisk)} className={`text-[10px] font-[var(--font-chivo-mono)] px-2 py-1 border ${showExtinctionRisk ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-graphite-border text-steel-mid hover:text-bone-white'}`}>⚠️ AT RISK</button>
            <button onClick={() => setShowNetworkVuln(true)} className="text-[10px] font-[var(--font-chivo-mono)] px-2 py-1 border border-graphite-border text-steel-mid hover:text-bone-white">🕸️ VULNERABILITY</button>
            <button onClick={() => setShowGapView(true)} className="text-[10px] font-[var(--font-chivo-mono)] px-2 py-1 border border-graphite-border text-steel-mid hover:text-bone-white">📊 GAPS</button>
            <button onClick={() => setShowCalendar(true)} className="text-[10px] font-[var(--font-chivo-mono)] px-2 py-1 border border-graphite-border text-steel-mid hover:text-bone-white">📅 CALENDAR</button>
          </div>

          <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside className="overflow-y-auto bg-void-black" style={{ width: `${sidebarWidth}px`, minWidth: '280px', maxWidth: '600px' }}>
            <SearchPanel
              onSearch={handleSearch}
              onAISearch={handleAISearch}
              results={results}
              onSelect={handleSelectResult}
              onProvenance={handleProvenance}
              loading={loading}
              selectedIndex={results.indexOf(selectedResult)}
            />
          </aside>

          {/* Resizable divider */}
          <div
            className="w-1 cursor-col-resize bg-graphite-border hover:bg-ember-orange active:bg-ember-orange transition-colors flex-shrink-0"
            onMouseDown={(e) => {
              e.preventDefault()
              const startX = e.clientX
              const startWidth = sidebarWidth
              const onMove = (ev) => setSidebarWidth(Math.max(280, Math.min(600, startWidth + ev.clientX - startX)))
              const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
              document.addEventListener('mousemove', onMove)
              document.addEventListener('mouseup', onUp)
            }}
          />

          {/* Main content */}
          <main className="flex-1 relative bg-carbon">
            {loading && (
              <div className="absolute inset-0 z-20 bg-void-black/80 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-graphite-border border-t-ember-orange rounded-full animate-spin" />
              </div>
            )}

            {recommendation && (
              <RecommendationCard text={recommendation} />
            )}

            {provenance && selectedResult ? (
              <div className="h-full flex flex-col">
                <div className="px-6 py-4 bg-void-black border-b border-graphite-border flex items-center gap-6">
                  <button
                    onClick={() => setProvenance(null)}
                    className="font-[var(--font-chivo-mono)] text-[14px] text-steel-mid border border-graphite-border px-3 py-2 rounded-none hover:border-bone-white hover:text-bone-white transition-colors"
                  >
                    ← BACK
                  </button>
                  <SeedDetail result={selectedResult} />
                </div>
                <div className="flex-1 bg-carbon">
                  <ProvenanceGraph data={provenance} />
                </div>
              </div>
            ) : (
              <MapContainer center={KENYA_CENTER} zoom={7} className="h-full w-full" scrollWheelZoom={true} zoomControl={true}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution="&copy; CARTO"
                />
                <FlyTo center={flyTarget} zoom={11} />
                <ExtinctionRiskLayer visible={showExtinctionRisk} />
                {results.map((r, i) => r.farmer?.lat && (
                  <CircleMarker
                    key={i}
                    center={[r.farmer.lat, r.farmer.lng]}
                    radius={8}
                    fillColor="#ff4f2b"
                    fillOpacity={0.9}
                    color="#f5f5f5"
                    weight={1.5}
                    ref={el => { markerRefs.current[i] = el }}
                  >
                    <Popup eventHandlers={{ add: () => {
                      if (r.seed?.id && !provenanceStory?.[r.seed.id]) {
                        fetch(`/api/seeds/${encodeURIComponent(r.seed.id)}/story`)
                          .then(res => res.json())
                          .then(data => setProvenanceStory(prev => ({ ...prev, [r.seed.id]: data.story })))
                          .catch(() => {})
                      }
                    }}}>
                      <div className="min-w-[220px]">
                        <p className="font-[var(--font-chivo-mono)] text-[12px] text-ember-orange uppercase">{r.seed?.crop_type}</p>
                        <p className="font-[var(--font-twk-everett)] text-[18px] font-light text-bone-white mt-1">{r.seed?.local_name}</p>
                        <p className="text-[14px] text-fog-light mt-1">👤 {r.farmer.name}</p>
                        <p className="text-[12px] text-steel-mid mt-1">{r.location?.county} · Since {r.grows_info?.since_year}</p>
                        {provenanceStory?.[r.seed?.id] && (
                          <p className="text-[11px] text-fog-light mt-2 italic border-t border-graphite-border pt-2">{provenanceStory[r.seed.id]}</p>
                        )}
                        <p className="text-[12px] text-fog-light mt-2">📞 {r.farmer.phone}</p>
                        <div className="flex gap-2 mt-3">
                          <a
                            href={`tel:${r.farmer.phone}`}
                            className="flex-1 text-center bg-ember-orange text-void-black font-[var(--font-chivo-mono)] text-[11px] uppercase px-2 py-1.5 rounded-none"
                          >
                            CONTACT
                          </a>
                          <button
                            className="flex-1 border border-graphite-border text-bone-white font-[var(--font-chivo-mono)] text-[11px] uppercase px-2 py-1.5 rounded-none hover:border-bone-white"
                            onClick={() => handleProvenance(r)}
                          >
                            PROVENANCE
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            )}

            {!provenance && results.length === 0 && !loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center max-w-[360px]">
                  <p className="text-[48px] mb-4">🌱</p>
                  <p className="font-[var(--font-chivo-mono)] text-[14px] text-steel-mid uppercase">Ready to search</p>
                  <p className="text-[14px] text-fog-light mt-2">Type a crop name, describe what you need, or use the filters in the sidebar.</p>
                </div>
              </div>
            )}
          </main>
        </div>

          {/* Overlay panels */}
          <NetworkVulnerability visible={showNetworkVuln} onClose={() => setShowNetworkVuln(false)} />
          <GapSplitView visible={showGapView} onClose={() => setShowGapView(false)} />
          <SeasonalCalendar visible={showCalendar} onClose={() => setShowCalendar(false)} />
        </div>
      )}

      {showAuth && <AuthPanel onAuth={(data) => { setUser(data); setShowAuth(false) }} onClose={() => setShowAuth(false)} />}

      {activePanel === 'listing' && (
        <div className="fixed top-14 right-4 z-[1000] w-[300px] bg-carbon border border-graphite-border shadow-2xl">
          <ListingPanel onCreated={() => setActivePanel(null)} />
        </div>
      )}
      {activePanel === 'exchanges' && (
        <div className="fixed top-14 right-4 z-[1000] w-[340px] max-h-[70vh] overflow-y-auto bg-carbon border border-graphite-border shadow-2xl">
          <ExchangePanel />
        </div>
      )}
    </div>
  )
}
