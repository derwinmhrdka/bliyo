#!/usr/bin/env bash
set -euo pipefail

COMPOSE="${COMPOSE_CMD:-docker compose}"

if [ ! -f .env ]; then
  echo "ERROR: .env not found in $(pwd). Create it from .env.example before deploying." >&2
  exit 1
fi

# Jangan pakai source: nilai berisi spasi (mis. nama "Super Admin") akan dianggap perintah.
set -a
while IFS= read -r line || [ -n "$line" ]; do
  line="${line%$'\r'}"
  case "$line" in
    ''|\#*) continue ;;
  esac
  key="${line%%=*}"
  value="${line#*=}"
  case "$key" in
    ''|*[!A-Za-z0-9_]*) continue ;;
  esac
  if [ "${value#\"}" != "$value" ] && [ "${value%\"}" != "$value" ]; then
    value="${value#\"}"
    value="${value%\"}"
  elif [ "${value#\'}" != "$value" ] && [ "${value%\'}" != "$value" ]; then
    value="${value#\'}"
    value="${value%\'}"
  fi
  printf -v "$key" '%s' "$value"
  export "$key"
done < .env
set +a

APP_HOST_PORT="${APP_HOST_PORT:-13003}"
DOMAIN="${DOMAIN:-bliyo.teknodika.com}"

echo "==> Freeing Docker disk (dangling images/build cache)..."
docker builder prune -f >/dev/null 2>&1 || true
docker image prune -f >/dev/null 2>&1 || true

echo "==> Building and starting containers on 127.0.0.1:${APP_HOST_PORT}..."
echo "    HTTPS is handled by host nginx — see deploy/nginx-bliyo.conf.example"
$COMPOSE up -d --build --remove-orphans

echo "==> Container status:"
$COMPOSE ps -a

echo "==> Waiting for app on 127.0.0.1:${APP_HOST_PORT}..."
APP_READY=false
for i in $(seq 1 30); do
  if curl -fsS -o /dev/null "http://127.0.0.1:${APP_HOST_PORT}/" 2>/dev/null; then
    echo "==> App OK on http://127.0.0.1:${APP_HOST_PORT}/"
    APP_READY=true
    break
  fi
  echo "Attempt $i: app not ready, waiting 3s..."
  sleep 3
done

if [ "$APP_READY" = false ]; then
  echo "ERROR: App not responding on http://127.0.0.1:${APP_HOST_PORT}/" >&2
  $COMPOSE logs web --tail 40
  exit 1
fi

if [ -n "$DOMAIN" ]; then
  echo "==> Checking public HTTPS..."
  if curl -fsS -o /dev/null "https://${DOMAIN}" 2>/dev/null; then
    echo "==> Deploy finished OK — https://${DOMAIN}"
  else
    echo "==> Containers OK. HTTPS not reachable yet at https://${DOMAIN}" >&2
    echo "    Configure host nginx: deploy/nginx-bliyo.conf.example" >&2
    echo "    Then: sudo certbot --nginx -d ${DOMAIN}" >&2
  fi
else
  echo "==> Deploy finished OK (set DOMAIN in .env to verify public HTTPS)"
fi
