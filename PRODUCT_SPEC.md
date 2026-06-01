# Sambaza Mbegu — Product Spec

## Overview

A platform that digitizes Kenya's informal indigenous seed sharing networks. Farmers find climate-adapted varieties matched to their conditions, trace provenance, and connect with growers to exchange seeds. Built on a Neo4j knowledge graph that compounds value with every interaction.

## Users

### Primary: Smallholder Farmers
- 7M+ farming households in Kenya
- 60% in arid/semi-arid lands where indigenous varieties outperform hybrids
- Most use feature phones. ~40% have smartphones.
- Trust comes from community, not brands

### Secondary: Extension Workers
- ~7,000 nationally, 1:1000 farmer ratio
- Visit farms regularly, already collect informal data
- Need tools to make their limited time count

### Tertiary: Institutions
- County agriculture offices (need data for policy)
- Seed banks and agricultural NGOs (need distribution visibility)
- Research orgs like CGIAR, ICRISAT (need variety performance data)

---

## Access Channels

### 1. USSD (Primary — widest reach)

**Provider:** Africa's Talking USSD API

**Menu Tree:**
```
*384*738# (738 = "SEW" for seed)

[1] Find Seeds
    [1] By Crop
        → Select: Sorghum, Millet, Cowpea, Pigeon Pea, Green Gram, Maize
        → "3 growers near you. Reply 1-3 for contact."
    [2] By Problem
        → Select: Drought, Pests, Low Soil, Short Season
        → Returns top matches for their registered location
    [3] Near Me
        → Uses registered location
        → Shows varieties available within 20km

[2] Share Seeds
    [1] I have seeds to share
        → Select crop → confirm variety → listed for 90 days
    [2] Log an exchange
        → Select contact from recent connections
        → System records sharing event in graph

[3] My Seeds
    → List of varieties farmer has registered
    → Option to add/remove

[4] Register
    → Name, phone, county, sub-county, ward
    → What do you grow? (multi-select)
    → How long? (years)
```

**Session handling:** USSD sessions timeout at 60s. Keep menus to 3 levels max. Cache farmer profile after registration for faster subsequent sessions.

**Cost:** Free for farmer (reverse-billed to platform). ~KES 1 per session to us.

### 2. SMS (Fallback — any phone, no session)

**Inbound keywords:**
```
SEED SORGHUM MACHAKOS → top 3 matches with phone numbers
SHARE COWPEA → register availability
STOP → unsubscribe
```

**Outbound notifications:**
```
"2 farmers near Wote have millet ready to share this month. Reply YES for contacts."
"Your seed listing expires in 7 days. Reply RENEW to keep it active."
```

**Provider:** Africa's Talking SMS. Cost: KES 0.8/outbound SMS.

### 3. WhatsApp Bot (Smartphone users)

**Flow:**
- Farmer sends text or voice note: "I need something drought-resistant for my shamba in Kitui, sandy soil"
- LLM interprets → graph query → returns results with photos
- Farmer taps "Connect" → direct WhatsApp link to grower
- Can send photos of their farm for better matching

**Provider:** WhatsApp Business API via 360dialog or Meta Cloud API.

**Voice note handling:** Whisper API for transcription → LLM for intent extraction → Cypher query.

### 4. Web Dashboard (Extension workers + institutions)

The current React app, extended with:
- Login/roles (farmer, extension worker, admin, institution)
- Bulk data entry for extension workers
- Analytics dashboards for institutions
- Export functionality (CSV, PDF reports)

---

## Data Pipeline

### Onboarding Sources

| Source | Data | Volume | Method |
|--------|------|--------|--------|
| Farmer self-registration | Name, location, varieties grown, years | Target: 10,000 Y1 | USSD/SMS/WhatsApp |
| Seed Savers Network Kenya | Cataloged varieties, traits, seed bank locations | ~500 varieties | Partnership, bulk import |
| KARI/KALRO databases | Variety performance trials, soil suitability | Public data | Scrape/API/manual |
| Extension worker reports | Farm visits, observed varieties, conditions | ~7,000 workers | Mobile form |
| Kenya Met Department | Rainfall, temperature by station | Historical + live | API integration |
| County agriculture offices | Registered farmers, acreage, crop data | Per-county | Data sharing agreements |

### Data Model (Extended)

```
// Core (exists now)
(Farmer)-[:GROWS {since_year, success_rating, verified}]->(SeedVariety)
(Farmer)-[:LOCATED_IN]->(Location)
(SeedVariety)-[:HAS_TRAIT]->(Trait)
(SeedVariety)-[:THRIVES_IN]->(SoilType)
(SeedVariety)-[:SUITED_FOR]->(ClimateZone)
(Farmer)-[:RECEIVED_FROM {year, source_type}]->(Farmer)
(Farmer)-[:SHARED_WITH {year, quantity_kg}]->(Farmer)

// New — Verification
(Farmer)-[:VERIFIED_BY]->(ExtensionWorker)
(SeedVariety)-[:CONFIRMED_AT {date, photo_url}]->(Farm)
(Farm)-[:OWNED_BY]->(Farmer)

// New — Performance
(GrowingRecord)-[:ON_FARM]->(Farm)
(GrowingRecord)-[:OF_VARIETY]->(SeedVariety)
(GrowingRecord)-[:IN_SEASON]->(Season {year, rainfall_mm, type: 'long_rains'|'short_rains'})
(GrowingRecord {yield_kg, rating, notes})

// New — Community
(Farmer)-[:MEMBER_OF]->(SeedGroup)  // informal seed sharing groups
(SeedGroup)-[:LOCATED_IN]->(Location)
(SeedChampion)-[:LEADS]->(SeedGroup)

// New — Availability
(SeedListing)-[:OFFERED_BY]->(Farmer)
(SeedListing)-[:OF_VARIETY]->(SeedVariety)
(SeedListing {quantity_kg, expires_at, status: 'available'|'claimed'|'expired'})

// New — Weather
(WeatherStation)-[:COVERS]->(Location)
(WeatherReading)-[:FROM_STATION]->(WeatherStation)
(WeatherReading {date, rainfall_mm, temp_max, temp_min})
```

### Verification Tiers

| Tier | Requirement | Badge |
|------|-------------|-------|
| Unverified | Self-registered | None |
| Confirmed | Extension worker visited farm | ✓ |
| Champion | 5+ successful shares, 3+ positive ratings | ⭐ |
| Seed Bank | Institutional partner | 🏛 |

---

## Trust System

### Reputation Scoring

```
reputation_score = (
    successful_shares * 3 +
    positive_ratings * 2 +
    years_growing * 1 +
    verification_tier * 5 +
    photo_evidence * 2
) / normalization_factor
```

Higher reputation = appears first in search results.

### Exchange Flow

1. Searcher finds variety → sees grower profile with reputation
2. Taps "Request Exchange" → SMS/WhatsApp sent to grower
3. Grower accepts/declines
4. Both confirm exchange happened (mutual confirmation prevents gaming)
5. Searcher rates: Did the seeds match description? Quality?
6. Rating updates reputation graph

### Anti-Gaming

- Can't rate without mutual exchange confirmation
- New accounts weighted lower in search for first 30 days
- Suspicious patterns flagged: 50 shares in a week from one farmer, identical ratings from same network

---

## Seasonal Intelligence

### Alert Types

| Alert | Trigger | Channel |
|-------|---------|---------|
| Availability alert | Farmer near you lists a variety you searched for before | SMS |
| Planting window | Season start detected via rainfall + your registered crops | SMS |
| Sharing reminder | Your crop approaching harvest, remind to list surplus seeds | USSD push |
| Weather risk | Drought probability >60% in your zone, suggest resistant varieties | SMS |

### Calendar Integration

Short rains (Oct-Dec) and long rains (Mar-May) drive everything. The system knows:
- When to prompt "list your surplus" (post-harvest)
- When to surface "find seeds" (pre-planting)
- Which varieties to recommend based on upcoming season forecast

---

## Analytics Dashboard (Institutional)

### County Agriculture Office View

- Coverage map: which indigenous varieties are present/absent per ward
- Trend: are indigenous varieties increasing or declining?
- Risk: which zones have low diversity (vulnerable to single-crop failure)?
- Performance: which varieties consistently outperform in which conditions?

### Seed Bank View

- Distribution reach: how far have their varieties spread?
- Demand signals: what are farmers searching for that nobody grows nearby?
- Gap analysis: which agro-ecological zones lack access to suitable varieties?

### Research Organization View

- Anonymized variety performance data across micro-climates
- Adoption patterns: how do varieties spread through social networks?
- Climate adaptation evidence: which varieties maintain yield under changing rainfall?

**Pricing:**
- County government: KES 50,000/year per county dashboard
- NGO/research: KES 100,000/year for national analytics API
- Custom reports: KES 20,000 per report

---

## Revenue Model

| Stream | Year 1 | Year 3 |
|--------|--------|--------|
| County dashboards (3 counties) | KES 150,000 | KES 1,200,000 (24 counties) |
| NGO/research subscriptions (2) | KES 200,000 | KES 800,000 |
| Bulk exchange facilitation fees | KES 0 | KES 500,000 |
| Grant funding (Mercy Corps, AGRA, etc.) | KES 2,000,000 | KES 3,000,000 |
| **Total** | **KES 2,350,000** | **KES 5,500,000** |

Farmer access is always free. Revenue comes from the data layer institutions need.

---

## Technical Architecture (Production)

```
┌────────────────────────────────────────────────────────┐
│                    Access Layer                          │
├──────────┬──────────┬───────────────┬──────────────────┤
│  USSD    │   SMS    │  WhatsApp Bot │   Web Dashboard  │
│ (AT API) │ (AT API) │ (360dialog)   │   (React)        │
└────┬─────┴────┬─────┴───────┬───────┴────────┬─────────┘
     │          │             │                │
     ▼          ▼             ▼                ▼
┌────────────────────────────────────────────────────────┐
│                   API Gateway (FastAPI)                  │
│   - Auth (JWT + API keys for institutions)              │
│   - Rate limiting                                       │
│   - Request routing                                     │
└────────────────────────┬───────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Neo4j      │ │  PostgreSQL  │ │    Redis     │
│  (Graph)     │ │  (Users,     │ │  (Sessions,  │
│  Seeds,      │ │   auth,      │ │   cache,     │
│  relations,  │ │   listings,  │ │   USSD state)│
│  provenance  │ │   payments)  │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌──────────────┐
│  LLM Layer   │
│ (Featherless)│
│  NL → Cypher │
│  Voice → Text│
└──────────────┘
```

### Infrastructure

- **Hosting:** Railway (backend + Neo4j) or Hetzner (cheaper for Africa latency)
- **CDN:** Cloudflare (free tier)
- **SMS/USSD:** Africa's Talking (Kenyan company, KES billing)
- **Monitoring:** Uptime Robot + Sentry
- **Backups:** Daily Neo4j dump to S3-compatible storage

---

## Rollout Plan

### Phase 1: Hackathon → Pilot (June-September 2026)
- Win the hackathon prize money for runway
- Sign one county agriculture office (Machakos)
- Partner with Seed Savers Network Kenya for initial data
- Target: 500 registered farmers, 50 verified exchanges

### Phase 2: Single County Deep (October 2026 - March 2027)
- Full USSD/SMS deployment in Machakos
- 5 extension workers onboarded as data collectors
- 10 seed champions identified and verified
- Target: 3,000 farmers, 500 exchanges, first institutional customer paying

### Phase 3: Multi-County (April - December 2027)
- Expand to Kitui, Makueni (similar agro-ecology, adjacent)
- WhatsApp bot live
- Analytics API for research orgs
- Target: 15,000 farmers, 6 county dashboards

### Phase 4: National (2028)
- 20+ counties
- Integration with county government agriculture systems
- Research partnerships with CGIAR centers
- Target: 100,000 farmers

---

## Risks

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Farmers don't trust digital platform | High | Partner with existing trusted orgs. Champions are known community members. |
| Data quality from self-reporting | High | Verification tiers. Extension worker spot-checks. Reputation weighting. |
| Seed companies lobby against it | Medium | Position as complementary (indigenous fills gaps commercial seed doesn't cover). Get legal backing from 2025 ruling. |
| Low engagement after registration | High | Seasonal push notifications. Only contact when relevant (pre-planting). |
| Copycat from larger org | Low | Graph data is the moat. Early mover with community trust compounds. |
| USSD costs unsustainable | Medium | Institutional revenue covers operational costs. Explore USSD sponsorship from agricultural input companies. |

---

## Metrics That Matter

- **Exchanges completed** (not just registrations)
- **Variety survival rate** (did seeds from exchange grow successfully?)
- **Network density** (average connections per farmer in graph)
- **Time to first exchange** (how fast from registration to value)
- **Repeat usage** (monthly active users on USSD/SMS)
- **Data freshness** (% of listings updated in last 90 days)
