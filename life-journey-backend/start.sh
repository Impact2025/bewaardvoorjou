#!/bin/bash
set -e

# Run database migrations (met retry voor Neon.tech cold-start)
# Gebruik de huidige merge-head als target. Alembic `upgrade head` kan nog steeds
# crashen als er tijdelijk meerdere heads zijn; een vaste leaf is idempotent
# (Alembic slaat over als hij al toegepast is) en garandeert dat alle kolommen
# (o.a. mediaasset.is_current) bestaan voordat de app opstart.
LATEST_REVISION="20260717_merge_heads"
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
