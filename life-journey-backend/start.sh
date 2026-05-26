#!/bin/bash
set -e

# Run database migrations
echo "Running alembic migrations..."
python -m alembic upgrade head

# Start Celery workers in background
echo "Starting Celery email worker..."
celery -A app.services.email.tasks worker --loglevel=info -Q celery --concurrency=2 &
EMAIL_WORKER_PID=$!

echo "Starting Celery Beat scheduler..."
celery -A app.services.email.tasks beat --loglevel=info &
BEAT_PID=$!

echo "Starting Celery media worker..."
celery -A app.services.media.tasks worker --loglevel=info -Q media --concurrency=2 &
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
