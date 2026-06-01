# Sambaza Mbegu

A graph-powered platform that helps Kenyan farmers discover, trace, and share indigenous seed varieties. Built for the Kenya AI Challenge 2026 (Mercy Corps AgriFin track).

## The Problem

Kenya's High Court ruled in 2025 that sharing indigenous seeds is legal again after years of criminalization. 90% of African seeds flow through informal networks. No digital infrastructure exists for farmers to find who grows what, where it thrives, or trace a variety's history. Seed companies won't build this. NGOs celebrated the ruling and shipped nothing.

## What This Does

Farmers search by crop, trait, or location. The Neo4j graph finds matching varieties grown by nearby farmers in similar conditions. Click a variety and see its provenance trail: who grew it, who shared it, for how long, across which regions. Connect with growers via SMS to arrange exchange.

The graph models relationships between farmers, seeds, soil types, climate zones, and sharing history. Graph algorithms surface matches that a flat database can't: "find drought-tolerant sorghum grown successfully for 20+ years in acidic soil within 30km of me."

## Tech

- **Neo4j** — graph DB for seed-farmer-condition relationships and provenance traversal
- **FastAPI** — Python backend with Cypher queries
- **React** — frontend with Leaflet maps and force-directed provenance visualization
- **Featherless** — LLM for natural language seed search

## Setup

Start Neo4j:

```bash
docker compose up -d
```

Seed the database:

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python seed_data.py
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

App runs at http://localhost:5173. API docs at http://localhost:8000/docs. Neo4j Browser at http://localhost:7474 (neo4j/password).

## Data

Synthetic dataset: 200 farmers across 6 counties (Machakos, Kitui, Makueni, Tharaka-Nithi, Meru, Embu), 40 indigenous varieties (sorghum, millet, cowpea, pigeon pea, green gram, maize), provenance chains going back decades, and seed-sharing events between neighbors.
