# Sambaza Mbegu

A graph-powered platform that helps Kenyan farmers discover, trace, and share indigenous seed varieties. Built for the Kenya AI Challenge 2026.

## The Problem

Kenya's High Court ruled in 2025 that sharing indigenous seeds is legal again after years of criminalization. 90% of African seeds flow through informal networks. No digital infrastructure exists for farmers to find who grows what, where it thrives, or trace a variety's history.

## What This Does

Farmers search by crop, trait, or location. The Neo4j graph finds matching varieties grown by nearby farmers in similar conditions. Click a variety and see its provenance trail: who grew it, who shared it, for how long, across which regions.

The graph models relationships between farmers, seeds, soil types, climate zones, and sharing history. Graph algorithms surface matches that a flat database can't: "find drought-tolerant sorghum grown successfully for 20+ years in acidic soil within 30km of me."

## Features

- **Natural Language Search** — describe what you need in plain text, LLM extracts structured intent, graph returns matches
- **AI Recommendations** — LLM explains WHY each variety fits your conditions
- **Provenance Visualization** — force-directed graph showing seed sharing chains across decades
- **Provenance Stories** — LLM-generated narratives of a seed variety's journey across regions
- **Extinction Risk Detection** — pulsing map overlay for varieties grown by ≤3 farmers
- **Network Vulnerability** — identifies single-point-of-failure farmers in sharing networks
- **Coverage Gap Analysis** — before/after split view of county-level seed coverage
- **Seasonal Calendar** — planting windows, harvest periods, availability timeline for all crops
- **Seed Exchange** — time-bounded listings, exchange requests, mutual confirmation, and ratings
- **Reputation System** — trust scores based on sharing history, ratings, verification, and growing experience
- **Anti-Gaming Detection** — velocity and pair-frequency checks to prevent reputation manipulation
- **Extension Worker Verification** — field visit reports upgrade farmer trust tiers
- **Institutional Analytics** — anonymized county summaries, gap reports, extinction risk data
- **USSD Access** — feature phone menu-based seed search and listing via Africa's Talking
- **SMS Keywords** — SEED/SHARE/STOP/RENEW commands for any phone
- **WhatsApp Bot** — text and voice note search with Swahili/Kikamba support
- **Seasonal Alerts** — availability matches, planting windows, harvest reminders, drought warnings
- **Dark Map Interface** — CARTO dark tiles with ember-orange markers, resizable panels

## Tech

- **Neo4j** — graph DB for seed-farmer-condition relationships and provenance traversal
- **PostgreSQL** — auth, search logs, alert queue, audit trail
- **Redis** — USSD session state, caching
- **FastAPI** — Python backend with Cypher queries + LLM integration
- **React + Tailwind CSS v4** — frontend with Leaflet maps and force-directed provenance visualization
- **Featherless API** — LLM for natural language search, recommendations, provenance stories
- **Africa's Talking** — SMS and USSD callbacks for feature phone access
- **Meta Cloud API** — WhatsApp bot with voice note support
- **Whisper** — voice transcription for Swahili/Kikamba voice notes

## Setup

### Prerequisites

- Docker and Docker Compose
- Python 3.12+ (tested on 3.14)
- Node.js 18+

### 1. Start databases

```bash
docker compose up -d
```

This starts Neo4j (7474/7687), PostgreSQL (5432), and Redis (6379).

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env`:

```bash
cp .env.example .env
# Edit .env with your Featherless API key
```

### 3. Initialize data

```bash
python init_db.py          # Create PostgreSQL tables
python seed_data.py        # Seed Neo4j with 200 farmers, 40 varieties
python seed_users.py       # Create test user accounts
python seed_listings.py    # Create sample seed listings
```

### 4. Run the API

```bash
uvicorn app.main:app --reload
```

### 5. Frontend (separate terminal)

```bash
cd frontend
npm install
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Web App | http://localhost:5173 |
| API Docs | http://localhost:8000/docs |
| Neo4j Browser | http://localhost:7474 (neo4j/password) |

### Test Credentials

| Phone | Password | Role |
|-------|----------|------|
| +254700000001 | test1234 | farmer |
| +254700000002 | test1234 | farmer |
| +254700000003 | test1234 | extension_worker |
| +254700000004 | test1234 | institution |
| +254700000005 | test1234 | admin |

## API Endpoints

### Search & Discovery

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/seeds/search` | GET | Filter seeds by crop, trait, county, location |
| `/api/seeds/ai-search` | POST | Natural language search with LLM extraction |
| `/api/seeds/{id}/provenance` | GET | Provenance chain for a seed variety |
| `/api/seeds/{id}/story` | GET | LLM-generated provenance narrative |
| `/api/seeds/recommend` | GET | Recommend seeds by soil, climate, county |
| `/api/farmers/{id}/network` | GET | Farmer's sharing network |
| `/api/stats` | GET | Platform stats |
| `/api/stats/extinction-risk` | GET | Varieties at risk of disappearing |
| `/api/stats/network-hubs` | GET | Key farmers in sharing network |

### Auth

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register (phone, password, role) |
| `/api/auth/login` | POST | Login, returns JWT |

### Seed Exchange

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/listings` | POST | Create seed listing (farmer) |
| `/api/listings/{id}` | DELETE | Remove own listing (farmer) |
| `/api/listings/search` | GET | Search listings by location/crop |
| `/api/exchanges` | POST | Request exchange (farmer) |
| `/api/exchanges/{id}/accept` | PUT | Accept request (listing owner) |
| `/api/exchanges/{id}/decline` | PUT | Decline request (listing owner) |
| `/api/exchanges/{id}/confirm` | PUT | Confirm exchange occurred (both) |
| `/api/exchanges/{id}/rate` | POST | Rate completed exchange (requester) |
| `/api/exchanges/history` | GET | Farmer's exchange history |

### Verification (Extension Workers)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/verification/report` | POST | Submit field visit report |
| `/api/verification/bulk` | POST | Bulk verification submission |
| `/api/verification/growing-record` | POST | Submit growing observation |

### Analytics (Institutions)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/county/{county}` | GET | County-level summary |
| `/api/analytics/gaps/{county}` | GET | Coverage gap report |
| `/api/analytics/extinction-risk` | GET | At-risk varieties |
| `/api/analytics/performance` | GET | Variety performance data |
| `/api/analytics/topology` | GET | Anonymized network topology |
| `/api/analytics/demand` | GET | Demand signals (seed companies) |

### Access Channels

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/sms/callback` | POST | Africa's Talking SMS webhook |
| `/api/ussd/callback` | POST | Africa's Talking USSD webhook |
| `/api/whatsapp/webhook` | GET/POST | Meta WhatsApp webhook |

## Roles

| Role | Access |
|------|--------|
| `farmer` | Listings, exchanges, history, search |
| `extension_worker` | Verification reports, growing records |
| `institution` | County analytics, gap reports, extinction risk |
| `seed_company` | Demand signals, coverage gaps (read-only, anonymized) |
| `admin` | All endpoints |

## Testing

Run all 24 property-based tests (Hypothesis, 100 iterations each):

```bash
cd backend
source venv/bin/activate
python -m pytest tests/properties/ -v
```

## Data

Synthetic dataset: 200 farmers across 6 counties (Machakos, Kitui, Makueni, Tharaka-Nithi, Meru, Embu), 40 indigenous varieties (sorghum, millet, cowpea, pigeon pea, green gram, maize), provenance chains going back decades, and seed-sharing events between neighbors.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Access Channels                          │
│  Web (React)  │  USSD (AT)  │  SMS (AT)  │  WhatsApp (Meta)│
└───────┬───────────────┬───────────┬──────────────┬──────────┘
        │               │           │              │
┌───────▼───────────────▼───────────▼──────────────▼──────────┐
│                    FastAPI Backend                            │
│  Auth │ Listings │ Exchanges │ Verification │ Analytics      │
│  SMS  │ USSD    │ WhatsApp  │ Alerts       │ Voice          │
└──┬──────────┬──────────┬────────────────────────────────────┘
   │          │          │
┌──▼──┐  ┌───▼───┐  ┌───▼──┐
│Neo4j│  │Postgres│  │Redis │
│Graph│  │Auth/Log│  │State │
└─────┘  └───────┘  └──────┘
```
