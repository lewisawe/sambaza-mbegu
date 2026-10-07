# Kimur — Build Notes

sambaza-mbegu → full **Kimur** product. Restructure + additive; the existing
seed-exchange experience is preserved verbatim and relocated behind an auth wall,
with a public marketing site added in front of it.

## Per-phase changes

### Phase 0 — Scaffolding & design tokens
- Installed `react-router-dom` (v7).
- `frontend/src/index.css`: added the Kimur brutalist-editorial palette
  (carbon-black, paper-white, warm-canvas, mist-gray, ash, smoke, slate, graphite,
  mint-chip, voltage-yellow), display/body/mono font vars (Anton / Inter / JetBrains
  Mono), a type-scale, and radii. The original ember/void dark tokens are kept so the
  `/app` experience renders unchanged.
- `frontend/index.html`: Google Fonts (Anton, Bebas Neue, Inter, JetBrains Mono);
  `<title>` → Kimur.

### Phase 1 — Rebrand + routing split + hard auth gate
- Rebranded user-visible strings only: `package.json` name → `kimur-frontend`;
  "Sambaza Mbegu" → "Kimur" in the nav, how-it-works copy, and GapSplitView; HTML
  title. **Backend DB creds (`mbegu`/`mbegu_pass`), API paths, Neo4j labels, and
  `localStorage` keys were left untouched.**
- Moved the entire `App.jsx` experience to `frontend/src/app/AppShell.jsx` (logic
  verbatim; import paths adjusted to `../components`; `useNavigate`/`Link` added).
- `App.jsx` is now the router host (`createBrowserRouter`).
- `app/RequireAuth.jsx`: hard gate — no `localStorage.token` ⇒ `<Navigate to="/login">`.
- `AuthPanel.jsx` refactored to export a shared `AuthForm`; `pages/Login.jsx` and
  `pages/Register.jsx` are full-page auth screens. Logged-out exchange attempts and
  logout now navigate (`/login`, `/`).

### Phase 2 — Public marketing homepage (`/`)
- `pages/Home.jsx`: brutalist-editorial homepage on the warm-gray canvas — giant Anton
  hero, inverted mission block (2025 High Court ruling), how-it-works teaser, mint
  feature-phone section. Enterprise/3D-render imagery from the spec was **dropped** in
  favor of typographic/heritage treatment.
- **Live stats** from `GET /api/stats` (keys `farmers`, `seeds`, `shares`, `counties`)
  — no hardcoded numbers; pulse skeleton while loading, `—` + notice on fetch error.

### Phase 3 — Remaining public pages + shared layout + legal + 404
- `components/public/Nav.jsx` + `Footer.jsx`; `pages/PublicLayout.jsx` layout route
  (Nav + Outlet + Footer) wrapping all public pages.
- Content pages with real PRODUCT_SPEC copy: `About` (villain→turning-point→gap→
  solution + who-we-serve), `HowItWorks`, `ForInstitutions` (county/seed-bank/research
  dashboards + indicative pricing), `Channels` (USSD menu tree, SMS keywords, WhatsApp
  voice flow).
- `Privacy`, `Terms`, and a `NotFound` 404 catch-all (`path: '*'`).

### Phase 4 — Role-aware `/app` dashboards
- `app/roleConfig.js`: capability map per role (share / verification / analytics /
  calendar); unknown role falls back to farmer.
- `AppShell` gates entry points by role: farmer → SHARE + EXCHANGES; extension_worker →
  VERIFY; institution / seed_company → analytics layers (no farmer controls); admin →
  everything. Reorganization + gating only, **no new backend features**.
- `components/VerificationPanel.jsx`: new UI over the existing
  `POST /api/verification/report` endpoint.

### Phase 5 — Profile, Settings, onboarding
- `app/Profile.jsx` (`/app/profile`): user_id, role, and any local onboarding data.
- `app/Settings.jsx` (`/app/settings`): controls clearly marked **"Not yet wired"**
  (no persistence endpoint exists).
- `app/Onboarding.jsx` (`/app/onboarding`): county / sub-county / ward / crops / years
  (the USSD register field set). Register redirects new users here.
- Nested routes added under `RequireAuth`; `PROFILE` nav link in AppShell.

### Phase 6 — LLM provider abstraction
- `backend/app/services/llm_provider.py`: `complete()` / `acomplete()` dispatch on
  `LLM_PROVIDER`. All five chat-LLM touchpoints route through it, each keeping its
  existing deterministic fallback.
- `backend/tests/properties/test_props_llm_provider.py`: 5 focused dispatch tests
  (no network).

## How to run

### Prerequisites
Data stores via Docker: `docker compose up -d` (Neo4j, Postgres, Redis). Seed data as
per `README.md` (`seed_data.py`, `seed_users.py`, `seed_listings.py`).

### Backend
```bash
cd backend
venv/bin/uvicorn app.main:app --reload        # API on :8000
venv/bin/python -m pytest tests/properties/ -q # 29 property tests
```
(The repo venv is `backend/venv`, Python 3.14.)

### Frontend
```bash
cd frontend
npm install        # first time (adds react-router-dom)
npm run dev        # Vite dev server (:5173), proxies /api -> :8000
npm run build      # production build
npm run preview    # serve the built dist
```

### Routes
- Public: `/`, `/about`, `/how-it-works`, `/for-institutions`, `/channels`,
  `/privacy`, `/terms`, plus `/login`, `/register`.
- Gated (`RequireAuth`): `/app`, `/app/profile`, `/app/settings`, `/app/onboarding`.
- Test credentials: see the table in `README.md` (e.g. `+254700000001 / test1234`,
  farmer; `…004`, institution; `…005`, admin).

## LLM provider config

Set in `backend/.env` (see `backend/.env.example`; **secrets stay out of git**):

| Var | Purpose | Default |
|-----|---------|---------|
| `LLM_PROVIDER` | `featherless` \| `openai` \| `local` \| `bedrock` \| `anthropic` \| `none` | `featherless` if `FEATHERLESS_API_KEY` set, else `none` |
| `LLM_MODEL` | model id | `meta-llama/Meta-Llama-3.1-8B-Instruct` |
| `LLM_API_KEY` | generic key (falls back to `FEATHERLESS_API_KEY` / `OPENAI_API_KEY`) | — |
| `LLM_BASE_URL` | OpenAI-compatible base for `provider=local` | — |
| `ANTHROPIC_API_KEY` | used only for `provider=anthropic` | — |

**No-op default:** with no provider and no key, `complete()`/`acomplete()` return `""`
and never raise. Every AI touchpoint then falls back to deterministic output, so all
non-AI features work with **no key**. Featherless remains one option among several, not
removed.

Touchpoints routed through the provider:
`routes/ai.py` (`acomplete`), `services/gap_detection_service.py`,
`services/provenance_story_service.py`, `services/whatsapp_service.py`,
`services/voice_service.py` (`extract_intent`, `translate_response`).

## Tagline

Chosen default (in `Home.jsx`): **"Seeds your grandmother grew, findable again."**

Alternates:
1. "Kenya's indigenous seed network, made visible."
2. "Share the seed. Keep the variety alive."

## TODOs / stubs left for follow-up

- **Onboarding has no backend write endpoint.** `auth/register` takes only
  phone/password/role; the farmers route has no profile POST (only the USSD flow writes
  county/ward/crops). `Onboarding.jsx` stores to `localStorage` with an explicit `TODO`;
  replace the submit handler with a real `fetch` when an endpoint lands.
- **Settings controls are not wired** — no persistence endpoint exists; they are labeled
  "Not yet wired".
- **Bedrock provider is best-effort** — uses `boto3` if installed, else safe no-op
  (`TODO` in `llm_provider.py`). The env switch and dispatch exist regardless.
- **Whisper transcription (`voice_service.transcribe`)** is intentionally left **outside**
  the chat-LLM abstraction — it's audio transcription keyed on `OPENAI_API_KEY`, not a
  chat completion.
- Deployment to **kimur.app is out of scope** for this build.
- Vite emits a >500 kB chunk-size warning (leaflet + force-graph). Non-blocking; a future
  `manualChunks` split would quiet it.

## Production deployment

Single-instance EC2 deploy ("everything in 1"): one box runs the whole stack via
`docker-compose.prod.yml` — Caddy (TLS + SPA + `/api` proxy) in front of the FastAPI
backend plus containerized Neo4j + Postgres + Redis. No managed DBs, no load balancer.
Full runbook: [`deploy/DEPLOY.md`](deploy/DEPLOY.md).

New files authored for prod (additive — the dev `docker-compose.yml` is untouched):

- `backend/Dockerfile` — backend image (`python:3.12-slim`, prebuilt wheels).
- `backend/.dockerignore`
- `frontend/Dockerfile` — builds the SPA and bakes it into a Caddy image (the `caddy`
  service IS the frontend image).
- `frontend/.dockerignore`
- `deploy/Caddyfile` — TLS, SPA fallback, `www`→apex redirect, `/api/*` reverse proxy.
- `deploy/DEPLOY.md` — the step-by-step operator runbook.
- `docker-compose.prod.yml` — prod stack: no DB host ports, `*_prod` named volumes,
  secrets from `.env.prod`, and a one-shot `seed` service behind the `seed` profile.
- `.env.prod.example` — secrets template (`.env.prod` itself is gitignored).

Seeding is the `seed` compose service (profile `seed`), which runs `init_db.py`,
`seed_data.py`, `seed_users.py`, `seed_listings.py` in order once, then exits.

## Verification evidence (this build)

- Frontend `npm run build`: **PASS** at the end of every frontend-touching phase and
  finally.
- Headless-Chrome smoke checks: `/app` redirects to Login when unauthed; `/` and all
  public routes render with shared nav/footer; 404 catch-all works; per-role nav gating
  confirmed (farmer→SHARE/EXCHANGES, extension_worker→VERIFY, institution/seed_company→
  neither, admin→all); `/app/profile` + `/app/settings` gated; onboarding renders.
- Real stats: backend `TestClient GET /api/stats` → `200 {farmers:200, seeds:40,
  grow_links:490, shares:94, counties:6}` (keys match `Home.jsx`).
- Backend property suite: **29 passed** (24 pre-existing + 5 new LLM-provider tests);
  `import app.main` clean; no-key `complete()` → `''`.
