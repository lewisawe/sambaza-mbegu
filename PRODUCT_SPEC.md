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


## AI Integration

Three AI layers that add real value on top of the graph, not decoration.

### 1. Natural Language Seed Search (MVP — Hackathon)

**Problem:** Farmers don't think in dropdowns. They think in problems.

**How it works:**
- Farmer types or says: "I have 2 acres in Kitui, sandy soil, need something that survives dry seasons and matures fast"
- LLM extracts structured intent: `{crop: null, traits: [drought_resistant, short_season], soil: sandy, county: Kitui}`
- Backend converts to Cypher query, graph returns results

**LLM Prompt Pattern:**
```
You are a seed search assistant for Kenyan farmers.
Extract search parameters from the farmer's message.
Return JSON only: {crop, traits[], soil, climate, county, radius_km}
Use null for anything not mentioned.

Valid traits: drought_resistant, short_season, pest_resistant, high_yield, low_input
Valid soils: acidic, sandy, loamy, clay, volcanic
Valid climates: arid, semi_arid, sub_humid, humid, highland
Valid counties: Machakos, Kitui, Makueni, Tharaka-Nithi, Meru, Embu

Farmer's message: "{input}"
```

**Channels:** Web search bar, WhatsApp text, WhatsApp voice (Whisper transcription then LLM), USSD "describe what you need" option.

**Provider:** Featherless API (Llama 3 or Mistral for fast structured extraction).

---

### 2. Seed Recommendation with Reasoning (MVP — Hackathon)

**Problem:** Raw search results (variety name, farmer name, location) don't build enough confidence to act. Farmers need to understand WHY this seed fits their situation.

**How it works:**
- Graph returns matching seeds with context (grower count, avg success rating, years grown, distance, soil/climate match)
- LLM synthesizes into natural language recommendation

**LLM Prompt Pattern:**
```
You are an agricultural advisor helping a Kenyan smallholder farmer choose seeds.
Based on the search results below, explain why each variety is a good match.
Be specific: mention distance, years grown, success ratings, and relevant conditions.
Write in simple English (or Swahili if requested). 2-3 sentences per variety.

Farmer's conditions: {soil}, {climate}, {county}, {farm_size} acres
Search results: {graph_results_json}
```

**Output example:**
"Katumani Millet has been grown within 15km of your farm by 7 farmers since 1992. It performs best in sandy, acidic soils like yours. Your neighbor Mutua Mwangi reports a 4.8/5 success rating over 12 years. It matures in 75 days, fitting your short rain season window."

---

### 3. Provenance Storytelling (Post-Hackathon)

**Problem:** A provenance graph (A then B then C then D over 30 years) is meaningful data but doesn't create the emotional trust that makes a farmer commit.

**How it works:**
- Graph returns the full provenance chain with dates, locations, and growing conditions
- LLM generates a narrative about the seed's journey and survival

**Output example:**
"This Gadam Sorghum has been cultivated in the Machakos-Kitui corridor for 38 years. It started at a community seed bank in Tseikuru, passed through 5 farmers across 3 sub-counties, and survived 4 recorded drought events. Farmers who grow it consistently rate it 4.5+ for drought tolerance."

**Why this works:** Story creates trust. "This seed survived the 2017 drought" is more persuasive than a number.

---

### 4. Variety Gap Detection (Post-Hackathon)

**Problem:** Institutions want to know where indigenous seed coverage is thin so they can intervene.

**How it works:**
- Graph identifies zones where farmers search for seeds but no growers exist nearby
- LLM generates human-readable gap reports for county agriculture officers

**Output example:**
"Makueni South has 34 searches for drought-tolerant millet in the last 90 days but zero registered growers. Nearest sources are in Kitui (47km). Recommend: seed champion placement or seed bank distribution event."

---

### 5. Swahili/Kikamba Voice Interface (Phase 2)

**Problem:** Many target farmers are older, low-literacy, and speak Kikamba or Kiswahili as primary language.

**How it works:**
- Farmer calls a number or sends WhatsApp voice note in Kikamba/Swahili
- Whisper transcribes, LLM translates and extracts intent, graph query runs, LLM generates response in same language
- Response sent as text SMS or synthesized voice

**Provider:** Whisper for transcription, Featherless for reasoning, TTS API for voice response.

---

### AI Roadmap

| Layer | Phase | Bounty |
|-------|-------|--------|
| Natural Language Search | Hackathon MVP | Featherless |
| Recommendation Reasoning | Hackathon MVP | Featherless |
| Provenance Storytelling | Post-hackathon | Featherless |
| Variety Gap Detection | Phase 2 | Featherless |
| Swahili/Kikamba Voice | Phase 2 | Featherless + Whisper |

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


## Differentiation: What Makes Judges Remember This

### The Demo Moment: Animated Seed Spread

A full-screen animated visualization showing how a single seed variety spread across Kenya over 40 years. Year by year, nodes light up as farmers receive the seed. Edges draw between them. Like watching a network grow in fast-forward.

One animation communicates the entire value proposition faster than any pitch slide. Build it using the provenance chain data already in Neo4j, rendered as a time-lapse force graph.

### Graph-Only Insights (Things No Other Tool Can Produce)

**Variety Extinction Risk:**
```cypher
MATCH (s:SeedVariety)<-[g:GROWS]-(f:Farmer)
WITH s, count(f) AS growers, avg(2026 - g.since_year) AS avg_age
WHERE growers <= 3 AND avg_age > 20
RETURN s.local_name, growers, avg_age
```
> "Tseikuru Sorghum is grown by only 3 farmers, all growing it for 25+ years. None have shared in 5 years. This variety is at risk of disappearing."

**Network Vulnerability (Single Point of Failure):**
```cypher
MATCH (f:Farmer)-[:SHARED_WITH*]->(recipients)
WITH f, count(DISTINCT recipients) AS downstream_farmers
ORDER BY downstream_farmers DESC LIMIT 5
RETURN f.name, downstream_farmers
```
> "78% of drought-resistant millet in Kitui traces back to a single farmer. If that node disappears, the whole sub-county loses access."

**Hidden Seed Corridors:**
```cypher
MATCH path = (a:Farmer)-[:SHARED_WITH*3..]->(b:Farmer)
WHERE a.county <> b.county
RETURN DISTINCT a.county, b.county, count(path) AS exchanges
```
> "Discovered: an active seed corridor between Kitui and Tharaka-Nithi that moves 12 varieties annually through 5 intermediary farmers."

These analyses are impossible without a graph database. They justify Neo4j as core infrastructure, not decoration.

### Impact Calculation

One number that makes judges lean forward:

> "If every farmer in Machakos currently buying commercial seed at KES 350/kg switched to matched indigenous varieties available within 20km for free, they'd save KES 14.2M per season in input costs while maintaining 87% of yield based on success ratings in the graph."

Calculated from: (farmers in county) × (avg seed purchase) × (% with graph-matched alternative available). Synthetic data, real methodology.

### The Story Arc (Pitch Framing)

The pitch needs a villain and a turning point:

1. **Villain:** For 12 years, Kenyan farmers faced 2-year prison sentences for sharing seeds their grandmothers grew. Commercial seed companies lobbied for this criminalization.
2. **Turning point:** In 2025, Kenya's High Court struck it down. Sharing indigenous seeds is legal again.
3. **Gap:** Legal freedom exists but practical infrastructure doesn't. 90% of seed flows through invisible informal networks. No way to discover, verify, or trace.
4. **Solution:** Sambaza Mbegu makes the invisible network visible. Graph captures who grows what, where it thrives, how it got there.
5. **Stakes:** Without this tool, varieties go extinct when elderly farmers die. With it, 40 years of agricultural knowledge becomes searchable, shareable, permanent.

### Credibility Anchors

Things that make it feel real rather than a student project:

- **One real farmer video** (30 seconds, phone recording): "I grow this sorghum my grandmother gave me, my neighbor doesn't know I have it." Even one voice from Machakos transforms the pitch.
- **The court ruling citation**: Reference the actual 2025 High Court decision. Shows you did the research.
- **Specific numbers from real sources**: 7M farming households, 7,000 extension workers, 63% arable land now acidic, KES 350/kg commercial seed cost. Grounds the project in reality.
- **Specific Kenyan seed names in Kikamba/Kiswahili**: The data model uses real variety names (Mtama wa Gadam, Nthooko ya Katumani). Shows domain knowledge.

### Before/After (One Slide)

| Without Sambaza Mbegu | With Sambaza Mbegu |
|---|---|
| Farmer asks 3 neighbors | Farmer finds 47 growers in 30km |
| No provenance, no trust | 38-year cultivation trail, verified |
| Variety dies with one elderly farmer | System detects extinction risk early |
| No data for county agriculture policy | County sees coverage gaps in real-time |
| Commercial seed: KES 350/kg | Indigenous exchange: free |

---

### Case Studies: What Happens Without Indigenous Seed Infrastructure

**Nigeria: $363M/year lost to EU bean export ban**

In 2015, the EU banned Nigerian dried bean imports due to high levels of dichlorvos (a pesticide banned in Europe). The ban persists to this day. Nigeria loses $363 million annually in foreign exchange. The root cause: farmers adopted commercial varieties that require heavy chemical pest control. Traditional cowpea varieties (like Kenya's Nthooko ya Kitui) have natural pest resistance bred over generations. They don't need dichlorvos. A tool that keeps pest-resistant indigenous varieties in circulation isn't just about farmer savings. It protects entire export markets from chemical contamination.

**Nigeria: Ginger industry collapsed to zero exports**

Nigeria was the world's third-largest ginger producer. In 2023, a fungal blight hit Kaduna State and wiped out 70% of ginger plantations across 2,500 hectares. By end of 2025, Nigeria's ginger exports fell from N26.2 billion to zero. Farmers lost N12 billion+. The government estimates 2-3 years to recover previous export volumes.

The cause: monoculture. Thousands of hectares growing the same narrow set of commercial varieties. One disease swept through all of them because they shared the same genetic vulnerability. Traditional/indigenous ginger varieties with different resistance profiles existed but weren't widely cultivated or accessible. Genetic diversity is the biological insurance against exactly this kind of wipeout. A platform that maintains variety diversity and makes resistant alternatives discoverable is infrastructure against the next blight.

**Zimbabwe: Half the national maize crop wiped out**

Zimbabwe abandoned its traditional drought-resistant maize landraces in favour of new high-yield hybrid varieties promoted by seed companies and government programs. When drought hit, the hybrids failed catastrophically. The country lost approximately half its staple food crop, triggering famine. The traditional varieties those hybrids replaced had survived centuries of drought cycles. Zimbabwe is now reversing course, with BBC reporting families "ditching maize for indigenous grains" like sorghum and millet. But the varieties are harder to find because the sharing networks broke down during the hybrid push.

**The argument for Sambaza Mbegu:**

These aren't hypotheticals. They're recent history from neighboring countries. Kenya faces the same pressures: government subsidizes DAP fertilizer and commercial seed, 63% of arable land is now acidic from that DAP, and traditional varieties are disappearing as elderly farmers die without passing them on. Sambaza Mbegu is infrastructure that prevents the Zimbabwe and Nigeria outcomes from happening here.

---


## Metrics That Matter

- **Exchanges completed** (not just registrations)
- **Variety survival rate** (did seeds from exchange grow successfully?)
- **Network density** (average connections per farmer in graph)
- **Time to first exchange** (how fast from registration to value)
- **Repeat usage** (monthly active users on USSD/SMS)
- **Data freshness** (% of listings updated in last 90 days)
