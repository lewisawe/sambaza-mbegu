# Kimur — Production Deploy Runbook

Single-instance deploy ("everything in 1"): one EC2 box runs the whole stack
via `docker-compose.prod.yml` — Caddy (TLS + SPA + API proxy), the FastAPI
backend, and Neo4j + Postgres + Redis. No managed databases, no load balancer.
Keep it simple; scale later if needed.

All commands run from the repository root on the host (the directory containing
`docker-compose.prod.yml`).

---

## 1. Prerequisites

- An EC2 instance (Amazon Linux 2023 or Ubuntu) with a public IP.
- **Docker Engine + the Compose v2 plugin** installed:
  - `docker --version` and `docker compose version` must both work.
- Security group inbound rules:
  - **80/tcp** and **443/tcp** open to the world (Caddy + ACME HTTP-01).
  - **22/tcp** open to your IP only (SSH / debugging tunnels).
  - Do **not** open 5432 / 6379 / 7474 / 7687 — the databases are internal.
- DNS control for `kimur.app` (see step 4 — must be set before first bring-up).

---

## 2. Configure secrets (.env.prod)

Copy the template and fill in real values:

```bash
cp .env.prod.example .env.prod
```

Generate strong secrets on the host:

```bash
openssl rand -hex 32        # -> JWT_SECRET
openssl rand -base64 24     # -> POSTGRES_PASSWORD
openssl rand -base64 24     # -> NEO4J_PASSWORD
```

Then edit `.env.prod` and keep these **in sync**:

- `NEO4J_PASSWORD=<pw>` and `NEO4J_AUTH=neo4j/<same pw>` (user stays `neo4j`,
  matching `NEO4J_USER=neo4j`).
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` and the matching
  `DATABASE_URL=postgresql+psycopg://<user>:<password>@postgres:5432/<db>`.
- Leave `LLM_PROVIDER=none` and all LLM/channel keys blank for launch — the
  stack boots and serves every non-AI feature with no external key. Set
  `CORS_ALLOW_ORIGINS=https://kimur.app` if you want to lock CORS down (default
  `*` keeps current behavior).

`.env.prod` is gitignored — never commit it.

---

## 3. Verify config before bring-up (optional but recommended)

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod config
```

A clean render means service wiring and variable interpolation are valid.

---

## 4. DNS before TLS (ordering matters)

Caddy obtains a Let's Encrypt certificate on first start using the HTTP-01
challenge, which requires the domain to resolve to this box **before** you bring
the stack up. Create these records first and wait for propagation:

- `kimur.app`        A -> `<EC2 public IP>`
- `www.kimur.app`    A -> `<EC2 public IP>`

(The `.app` TLD is HTTPS-only / HSTS-preloaded, so TLS is mandatory — there is
no plain-HTTP fallback. `www` 301-redirects to the apex.)

If you bring the stack up before DNS resolves, Caddy will retry; just ensure DNS
is correct and `docker compose -f docker-compose.prod.yml restart caddy`.

---

## 5. Bring up the stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This builds the backend and frontend/Caddy images, starts the databases, waits
for their healthchecks, then starts the backend and Caddy. Watch startup:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy backend
```

---

## 6. Seed the databases — ONCE

The seed service is behind the `seed` profile so it never runs on a normal
`up`. Run it a single time after the first bring-up:

```bash
docker compose -f docker-compose.prod.yml --profile seed run --rm seed
```

It runs, in order, inside the backend container against the containerized DBs
with prod creds:

1. `init_db.py`      — creates Postgres tables.
2. `seed_data.py`    — populates Neo4j (synthetic Kenyan farmers + varieties).
3. `seed_users.py`   — creates demo users (login password `test1234`).
4. `seed_listings.py`— creates sample seed listings from the graph.

Seed data is synthetic/demo and acceptable for launch. Do not re-run unless you
intend to add duplicates (the scripts are not fully idempotent across all data).

---

## 7. Health checks

```bash
curl -fsS https://kimur.app/api/health      # -> {"status":"ok"}
```

Then open `https://kimur.app/` in a browser — the SPA should load, and a hard
refresh on a client-side route (e.g. `https://kimur.app/map`) should still serve
the app (SPA fallback to index.html).

---

## 8. Logs, restart, updates

```bash
# Tail logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f caddy

# Restart a single service
docker compose -f docker-compose.prod.yml restart backend

# Deploy new code (rebuild changed images, recreate)
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy certificates persist in the `caddy_data` named volume, so restarts and
redeploys do not re-trigger ACME.

---

## 9. Databases are not exposed — how to reach them for debugging

None of Neo4j / Postgres / Redis publish host ports. To inspect them:

Preferred — exec straight into the container (no ports opened):

```bash
docker compose -f docker-compose.prod.yml exec neo4j \
  cypher-shell -u neo4j -p "<NEO4J_PASSWORD>"

docker compose -f docker-compose.prod.yml exec postgres \
  psql -U "<POSTGRES_USER>" -d "<POSTGRES_DB>"

docker compose -f docker-compose.prod.yml exec redis redis-cli
```

If you specifically want the Neo4j browser UI locally, tunnel over SSH and
temporarily publish the port inside the tunnel session — do **not** add host
ports to the compose file. One approach: run a throwaway `cypher-shell` as
above, or forward via SSH if you temporarily expose the port on the box:

```bash
ssh -L 7474:localhost:7474 -L 7687:localhost:7687 <user>@<ec2-ip>
```

(Only forward while actively debugging; keep the security group closed to those
ports.)

---

## Notes

- **LLM is a no-op at launch.** `LLM_PROVIDER=none` (or unset) means AI features
  fall back to deterministic output; no API key is required for the stack to run
  and serve all non-AI features.
- **Base image note:** the backend builds on `python:3.12-slim`. All deps are
  prebuilt wheels, so no compiler is needed. If a future dependency fails to
  build there, bump to `python:3.14-slim` in `backend/Dockerfile`.
