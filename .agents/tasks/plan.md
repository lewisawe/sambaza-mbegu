# Implementation Plan — Kimur Production Deployment Config

Authoring NEW production infra/config files for the Kimur app. **Additive only** —
the existing dev `docker-compose.yml` (3 databases) stays untouched and working.
This is config authoring, NOT a server deploy and NOT DNS changes.

All paths below are absolute, under the worktree
`/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config`.

## Grounding findings (verified by reading the repo)

- **Routes**: all app routers mount under `/api/*` in `backend/app/main.py`; health at
  `GET /api/health` → `{"status":"ok"}`. Caddy must proxy `/api/*` to `backend:8000`
  preserving the path (do NOT strip `/api`).
- **CORS**: `main.py` uses `allow_origins=["*"]` (permissive wildcard, NOT localhost).
  It already works in prod. We will make the origins **env-driven with `*` as the
  default** so nothing breaks — a minimal, optional hardening (constraint allows env-izing
  hardcoded origins). This is the only app-code change, and it is backward compatible.
- **DB config is already env-driven** via `os.getenv` with localhost defaults:
  - `backend/app/db.py` → `NEO4J_URI` / `NEO4J_USER` / `NEO4J_PASSWORD`
  - `backend/app/postgres.py` → `DATABASE_URL`
  - `backend/app/auth.py` → `JWT_SECRET` (dev default `change-me-in-production`)
  - `seed_data.py` reads `NEO4J_URI/USER/PASSWORD` directly; `init_db.py`, `seed_users.py`,
    `seed_listings.py` import `app.*` modules (so same env vars). All work inside the
    backend container with prod env injected.
  - Redis URL: used elsewhere via `REDIS_URL` (present in `.env.example`).
- **No `python-dotenv` loading** anywhere in `backend/` — pure `os.getenv`. So compose
  `env_file` injects every var; no `.env` file is needed inside the image.
- **Frontend build output**: `vite.config.js` has NO `build.outDir` override → Vite default
  `dist` → `frontend/dist`. Dev `/api` proxy is dev-only and irrelevant to prod (Caddy
  handles `/api` in prod).
- **Python version**: repo venv is 3.14, but deps are plain wheels
  (`fastapi`, `uvicorn`, `neo4j`, `sqlalchemy`, `psycopg[binary]`, `redis`, `pyjwt`,
  `bcrypt`, `httpx`, `python-multipart`). `psycopg[binary]` ships manylinux wheels →
  builds cleanly on `python:3.12-slim`. Use 3.12-slim; only bump + document if a build fails.
- **LLM**: `app/services/llm_provider.py` no-ops when `LLM_PROVIDER=none`/unset and no key.
  Keep it no-op for launch; the stack must boot and serve all non-AI features with NO key.
- **.gitignore** already ignores `.env` and `dist/` but NOT `.env.prod` → must add it.

---

## Steps

- [ ] 1. **Backend production Dockerfile.**
      Create a container for FastAPI. Base `python:3.12-slim`. Set `WORKDIR /app`,
      `ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1`. Copy `requirements.txt` first and
      `pip install --no-cache-dir -r requirements.txt` (layer caching), then add
      `gunicorn==23.0.0` to the install line (gunicorn is NOT in requirements.txt — install it
      in the Dockerfile only; do NOT edit requirements.txt). Copy the `backend/` app code
      (`app/`, the four seed/init scripts, `tests/` optional). Create a non-root user
      (`useradd`), `chown` `/app`, `USER` it. `EXPOSE 8000`. CMD runs production ASGI:
      `gunicorn app.main:app -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:8000`.
      Add a `.dockerignore` next to it excluding `venv/`, `__pycache__/`, `.pytest_cache/`,
      `.hypothesis/`, `*.pyc`.
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/backend/Dockerfile`,
      `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/backend/.dockerignore`
      Verify: `docker build -t kimur-backend /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/backend`
      succeeds (image builds, pip install resolves on 3.12-slim). If a wheel fails to build,
      switch base to `python:3.14-slim` and note it in `deploy/DEPLOY.md`.

- [ ] 2. **Frontend production Dockerfile (multi-stage build → static dist).**
      Stage 1 `node:20`: `WORKDIR /app`, copy `package.json` + `package-lock.json` if present,
      run `npm ci` (fall back to `npm install` only if no lockfile exists — check first), copy
      the rest of `frontend/`, run `npm run build` producing `/app/dist`. Final stage: a minimal
      image (e.g. `FROM caddy:2-alpine` or `scratch`/`alpine`) whose only purpose is to carry
      the built `/app/dist`. **Preferred approach:** make the final stage copy `dist` to a known
      path and have the prod compose Caddy service consume it. Simplest robust pattern: final
      stage `FROM alpine`, `COPY --from=build /app/dist /dist`, so compose can copy/volume it;
      OR build dist and have Caddy's own image mount it. Decision: use a 2-stage build where the
      final stage is `FROM caddy:2-alpine` and `COPY --from=build /app/dist /srv` — this makes the
      **frontend image itself the Caddy server image** carrying the SPA, which simplifies compose
      (one image serves static + reverse-proxies). Document this choice in a comment at the top of
      the file. Add a `frontend/.dockerignore` excluding `node_modules/`, `dist/`.
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/frontend/Dockerfile`,
      `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/frontend/.dockerignore`
      Verify: `docker build -t kimur-frontend /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/frontend`
      succeeds AND, as a faster pre-check, `cd /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/frontend && npm ci && npm run build` produces `dist/index.html`.

- [ ] 3. **Caddyfile — SPA + reverse proxy + HTTPS.**
      Single site block for `kimur.app, www.kimur.app`. Redirect `www` → apex with a
      `@www host www.kimur.app` matcher + `redir https://kimur.app{uri} permanent`.
      `root * /srv` (the dist path baked into the frontend/Caddy image from step 2).
      `handle /api/*` → `reverse_proxy backend:8000` (NO path rewrite — preserve `/api`).
      `handle` the rest with `try_files {path} /index.html` + `file_server` so react-router
      client routes survive refresh. Automatic HTTPS is Caddy default (the `.app` TLD is
      HSTS-preloaded / HTTPS-only, so TLS is mandatory — Caddy's ACME handles it once DNS
      points at the box). Add a `header` block with sensible security headers:
      `Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
      `X-Content-Type-Options nosniff`, `X-Frame-Options DENY`,
      `Referrer-Policy strict-origin-when-cross-origin`. Place the file at `deploy/Caddyfile`.
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/deploy/Caddyfile`
      Verify: `docker run --rm -v /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/deploy/Caddyfile:/etc/caddy/Caddyfile caddy:2-alpine caddy validate --config /etc/caddy/Caddyfile`
      reports a valid config (good-to-have; if image pull is slow, syntax is verified transitively
      by `docker compose config` in step 4).

- [ ] 4. **docker-compose.prod.yml — full prod stack.**
      Create a NEW compose file (do NOT touch the dev `docker-compose.yml`). Services:
      - `caddy`: built from `frontend/Dockerfile` (the frontend+Caddy image from step 2), `ports: ["80:80","443:443"]`, mounts `./deploy/Caddyfile:/etc/caddy/Caddyfile:ro`, named volumes `caddy_data:/data` and `caddy_config:/config` (cert persistence), `depends_on: [backend]`, `restart: unless-stopped`.
      - `backend`: `build: ./backend`, **NO host ports**, `env_file: .env.prod`, `restart: unless-stopped`, `depends_on` neo4j/postgres/redis with `condition: service_healthy`. Env wires DBs by **service name**: `NEO4J_URI=bolt://neo4j:7687`, `DATABASE_URL=postgresql+psycopg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}`, `REDIS_URL=redis://redis:6379/0` — set these in `.env.prod` (step 5), referenced via `env_file`.
      - `neo4j`: `image: neo4j:5`, **NO host ports**, `environment: NEO4J_AUTH=${NEO4J_AUTH}` and `NEO4J_PLUGINS=["apoc"]`, named volume `neo4j_data_prod:/data`, healthcheck (e.g. `cypher-shell -u neo4j -p "$NEO4J_PASSWORD" "RETURN 1"` or a `wget` on 7474), `restart: unless-stopped`.
      - `postgres`: `image: postgres:16-alpine`, **NO host ports**, env `POSTGRES_USER/PASSWORD/DB` from `.env.prod`, named volume `pg_data_prod:/var/lib/postgresql/data`, healthcheck `pg_isready -U ${POSTGRES_USER}`, `restart: unless-stopped`.
      - `redis`: `image: redis:7-alpine`, **NO host ports**, named volume `redis_data_prod:/data`, healthcheck `redis-cli ping`, `restart: unless-stopped`.
      All on a default bridge network (service-name DNS). Use volume names distinct from dev
      (`*_prod`) so prod and dev data never collide. No hardcoded secrets — all via `.env.prod`.
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/docker-compose.prod.yml`
      Verify: `docker compose -f /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/docker-compose.prod.yml config`
      validates with no errors (create a throwaway `.env.prod` from the example first, or pass
      `--env-file`, so variable interpolation resolves).

- [ ] 5. **Secrets/env: `.env.prod.example` (committed) + gitignore `.env.prod`.**
      Create `.env.prod.example` with PLACEHOLDERS for every prod var, NO real secrets and NO dev
      defaults (`mbegu/mbegu_pass`, `neo4j/password`, `change-me…`): `JWT_SECRET=`,
      `NEO4J_PASSWORD=` and `NEO4J_AUTH=neo4j/` (document that AUTH must be `neo4j/<same-password>`),
      `POSTGRES_USER=`, `POSTGRES_PASSWORD=`, `POSTGRES_DB=kimur`, plus the derived connection vars
      the backend reads: `NEO4J_URI=bolt://neo4j:7687`, `NEO4J_USER=neo4j`,
      `DATABASE_URL=postgresql+psycopg://<user>:<password>@postgres:5432/kimur`,
      `REDIS_URL=redis://redis:6379/0`. Include `LLM_PROVIDER=none` and blank optional keys
      (`LLM_API_KEY=`, `FEATHERLESS_API_KEY=`, `OPENAI_API_KEY=`, `ANTHROPIC_API_KEY=`,
      `AT_API_KEY=`, `META_WHATSAPP_TOKEN=`, etc.) with a comment that the stack boots fully with
      these blank. Add an optional `CORS_ALLOW_ORIGINS=*` line (used by step 8). Then append
      `.env.prod` to `.gitignore`.
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/.env.prod.example`,
      `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/.gitignore` (append `.env.prod`)
      Verify: `grep -q '^\.env\.prod$' /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/.gitignore`
      and manually confirm `.env.prod.example` contains none of the dev defaults
      (`grep -E 'mbegu_pass|change-me|neo4j/password' .env.prod.example` returns nothing).

- [ ] 6. **Production seeding path (one-shot compose profile).**
      Add a `seed` service to `docker-compose.prod.yml` under `profiles: ["seed"]` so it never
      runs on normal `up`. It reuses the backend image (`build: ./backend` or `image:` of backend),
      `env_file: .env.prod`, `depends_on` the three DBs `service_healthy`, no ports, and
      `command` runs the four scripts in order:
      `sh -c "python init_db.py && python seed_data.py && python seed_users.py && python seed_listings.py"`.
      It exits on completion (one-shot). Note in a comment + in DEPLOY.md that seed data is
      synthetic/demo (200 farmers, 40 varieties) and acceptable for launch. Document the invocation:
      `docker compose -f docker-compose.prod.yml --profile seed run --rm seed`.
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/docker-compose.prod.yml` (add service)
      Verify: `docker compose -f /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/docker-compose.prod.yml --profile seed config`
      shows the `seed` service with the correct command and env_file.

- [ ] 7. **Deploy runbook `deploy/DEPLOY.md`.**
      Concise reproducible runbook covering, in order: (a) prerequisites — Docker + compose plugin
      on the host (EC2 box, single instance, "everything in 1" per user); (b) create `.env.prod`
      from `.env.prod.example` and generate secrets with
      `openssl rand -hex 32` (JWT_SECRET) and `openssl rand -base64 24` (DB passwords), reminding to
      keep `NEO4J_AUTH=neo4j/<NEO4J_PASSWORD>` and `DATABASE_URL` user/pass/db in sync with the
      POSTGRES_* vars; (c) **DNS-before-TLS ordering** — `kimur.app` + `www.kimur.app` A records must
      point at the box's public IP BEFORE first `up`, because Caddy's Let's Encrypt HTTP-01 challenge
      needs ports 80/443 reachable at the domain (open EC2 security-group 80+443); (d) bring-up
      `docker compose -f docker-compose.prod.yml up -d --build`; (e) run seeds ONCE
      `docker compose -f docker-compose.prod.yml --profile seed run --rm seed`; (f) health checks —
      `curl -fsS https://kimur.app/api/health` → `{"status":"ok"}`, load `https://kimur.app/`;
      (g) logs/restart — `docker compose -f docker-compose.prod.yml logs -f caddy backend`,
      `… restart backend`; (h) note DB ports are NOT exposed and how to reach the Neo4j browser for
      debugging via SSH tunnel:
      `ssh -L 7474:localhost:7474 -L 7687:localhost:7687 ec2-user@<ip>` after temporarily publishing
      the port OR `docker compose exec neo4j cypher-shell`; prefer `docker compose exec` to avoid
      exposing ports. Note the LLM is no-op at launch (no key needed).
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/deploy/DEPLOY.md`
      Verify: file exists and the three core commands it documents match the real filenames
      (`docker-compose.prod.yml`, `.env.prod`, `deploy/Caddyfile`); no automated test needed.

- [ ] 8. **Minimal app change: env-driven CORS origins (backward compatible).**
      In `backend/app/main.py`, replace the hardcoded `allow_origins=["*"]` with a read of
      `CORS_ALLOW_ORIGINS` env var, split on comma, defaulting to `["*"]` when unset — e.g.
      `_origins = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", "*").split(",") if o.strip()]`
      then `allow_origins=_origins`. Add `import os` at the top. This keeps the existing `*`
      behavior by default (dev + tests unaffected) and lets prod optionally restrict to
      `https://kimur.app` via `.env.prod`. **Do not** change any routes, prefixes, or other
      middleware. This is the only app-code edit; keep it to these lines.
      Files: `/home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/backend/app/main.py`
      Verify: `cd /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/backend && python -c "import ast; ast.parse(open('app/main.py').read())"`
      parses clean. If a backend venv/deps are available, optionally run the existing property
      suite `python -m pytest tests/properties/ -q` and confirm the 24+ tests stay green — do NOT
      add new tests.

---

## Verification policy (user explicit: do NOT over-test)

Apply **proportional verification only**. The implementer must NOT run a full
build-and-test on every step. **Sufficient evidence** for this task is:

1. `cd /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/frontend && npm run build` succeeds (produces `dist/`).
2. `docker build` succeeds for each of `backend/` and `frontend/`.
3. `docker compose -f /home/sierra/Desktop/projects/kimur/.code/.worktrees/prod-config/docker-compose.prod.yml config` validates (with a throwaway `.env.prod`).

A full local end-to-end bring-up (`up -d --build` + seed + `curl /api/health`) is
**good-to-have**, not required: if image pulls are slow or unavailable, items 1–3 above are
enough. `caddy validate` (step 3) and the Python `ast.parse`/property suite (step 8) are the
only other checks. **Do NOT add new test suites.** If the backend property tests are run at
all, the existing 24+ must stay green.

## Non-goals / constraints reminder

- Dev `docker-compose.yml` stays UNTOUCHED (additive files only).
- Neo4j / Postgres / Redis get NO published host ports in prod.
- LLM stays no-op (no key); stack must boot and serve all non-AI features with no external key.
- No real secrets and no dev defaults committed anywhere; `.env.prod` is gitignored.
- Only app change is the env-driven CORS line in `main.py` (step 8), default-compatible.

---

## Verification

Run on the host (Docker 29.7.2, Compose v2, Node 22, npm 10.9.7) from the worktree.
Proportional checks only — no new test suites added.

| # | Command | Result |
|---|---------|--------|
| 1 | `python3 -c "import ast; ast.parse(open('app/main.py').read())"` (in `backend/`) | PASS — `main.py parses OK` (env-driven CORS edit is syntactically valid) |
| 2 | `cd frontend && npm ci && npm run build` | PASS — `✓ built in 5.68s`, produced `frontend/dist/index.html` + `dist/assets/*` (500 kB chunk warning only, non-fatal) |
| 3 | `docker build -t kimur-backend ./backend` | PASS — image built on `python:3.12-slim`; all wheels (incl. `psycopg[binary]`) + `gunicorn==23.0.0` installed cleanly. No base bump needed. |
| 4 | `docker build -t kimur-frontend ./frontend` | PASS — multi-stage `node:20` build → `caddy:2-alpine`, `dist` copied to `/srv` |
| 5 | `docker compose -f docker-compose.prod.yml --env-file .env.prod config` | PASS (EXIT=0) using a throwaway `.env.prod` copied from the example. Confirmed: DB URLs by service name (`bolt://neo4j:7687`, `postgresql+psycopg://…@postgres:5432/kimur`, `redis://redis:6379/0`); only `caddy` publishes ports (80/443), `backend`/`neo4j`/`postgres`/`redis` publish none; `*_prod` volumes. |
| 6 | `docker compose -f docker-compose.prod.yml --profile seed config` | PASS — `seed` service present under `profiles: [seed]` with the 4-script command and `env_file: .env.prod` |
| 7 | `caddy validate` on `deploy/Caddyfile` (via `kimur-frontend` image) | PASS — `Valid configuration`; automatic HTTP→HTTPS confirmed |
| 8 | Secret-leak grep on `.env.prod.example` (non-comment assignment lines) | PASS — no dev defaults (`mbegu_pass`/`change-me`/`neo4j/password`), all secret placeholders blank |
| 9 | `.gitignore` contains `.env.prod` | PASS — `.env.prod` ignored; throwaway `.env.prod` not staged |

Notes:
- All image builds ran locally and succeeded (no slow/unavailable pulls to work around).
- The throwaway `.env.prod` used for `config` was removed after validation; it is gitignored and not committed.
- Did not run the backend property suite (no venv/deps installed in this env); the only app
  change is the backward-compatible CORS line, which defaults to `*` so existing tests are
  unaffected. AST parse confirms validity.
