#!/bin/bash
set -e

# Run database migrations (met retry voor Neon.tech cold-start)
# Gebruik een specifieke target-revisie in plaats van `upgrade head`:
# de migratie-graaf heeft meerdere heads, waardoor `head` crasht met
# "Multiple head revisions are present". Een vaste leaf is idempotent
# (Alembic slaat over als hij al toegepast is).
LATEST_REVISION="20260715_blog_podcast_audio"
echo "Running alembic migrations (target: $LATEST_REVISION)..."
for attempt in 1 2 3; do
  python -m alembic upgrade "$LATEST_REVISION" && break
  echo "Migration poging $attempt mislukt, opnieuw proberen in 5s..."
  sleep 5
  if [ "$attempt" -eq 3 ]; then
    echo "Migrations definitief mislukt na 3 pogingen."
    exit 1
  fi
done

# Start Celery workers in background
echo "Starting Celery email worker..."
python -m celery -A app.services.email.tasks:celery_app worker --loglevel=info -Q celery --concurrency=2 &
EMAIL_WORKER_PID=$!

echo "Starting Celery Beat scheduler..."
python -m celery -A app.services.email.tasks:celery_app beat --loglevel=info &
BEAT_PID=$!

echo "Starting Celery media worker..."
python -m celery -A app.services.media.tasks:celery_app worker --loglevel=info -Q media --concurrency=2 &
MEDIA_WORKER_PID=$!

# Trap signals and kill background workers on exit
trap "kill $EMAIL_WORKER_PID $BEAT_PID $MEDIA_WORKER_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Start API server (foreground — keeps container alive)
echo "Starting API server..."
exec python -m gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:${PORT:-8000} \
  --timeout 120 \
  --keep-alive 5 \
  --workers 2 \
  --preload
