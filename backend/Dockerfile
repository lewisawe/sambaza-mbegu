# Kimur backend — production image.
#
# Base: python:3.12-slim. All runtime deps are plain manylinux wheels
# (fastapi, uvicorn, neo4j, sqlalchemy, psycopg[binary], redis, pyjwt, bcrypt,
# httpx, python-multipart) so they install cleanly on 3.12 with no compiler.
# If a wheel ever fails to build here, bump the base minimally (e.g.
# python:3.14-slim) and note it in deploy/DEPLOY.md.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Copy requirements first for Docker layer caching: the pip layer is only
# rebuilt when requirements.txt changes, not on every app-code edit.
COPY requirements.txt ./
# gunicorn is the production process manager; it is NOT in requirements.txt
# (which is used for dev/test too) so it is installed here only.
RUN pip install --no-cache-dir -r requirements.txt gunicorn==23.0.0

# Copy application code and the init/seed scripts.
COPY app ./app
COPY init_db.py seed_data.py seed_users.py seed_listings.py ./

# Run as a non-root user.
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Production ASGI: gunicorn managing uvicorn workers.
# -w 2 keeps it light for the single-instance EC2 box ("something simple").
CMD ["gunicorn", "app.main:app", \
     "-k", "uvicorn.workers.UvicornWorker", \
     "-w", "2", \
     "-b", "0.0.0.0:8000"]
