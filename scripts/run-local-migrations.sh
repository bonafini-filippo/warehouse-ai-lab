#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATIONS_PATH="${PROJECT_ROOT}/db/migrations"

cd "$PROJECT_ROOT"

if [ ! -f ".env" ]; then
  echo "Errore: file .env non trovato nella root del progetto."
  echo "Crea il file con:"
  echo "cp .env.local.example .env"
  exit 1
fi

set -a
source .env
set +a

if [ -z "${POSTGRES_DEV_USER:-}" ] || [ -z "${POSTGRES_DEV_PASSWORD:-}" ] || [ -z "${POSTGRES_DEV_DB:-}" ] || [ -z "${POSTGRES_DEV_PORT:-}" ]; then
  echo "Errore: variabili POSTGRES_DEV_* mancanti nel .env"
  exit 1
fi

MIGRATION_DATABASE_URL="postgres://${POSTGRES_DEV_USER}:${POSTGRES_DEV_PASSWORD}@host.docker.internal:${POSTGRES_DEV_PORT}/${POSTGRES_DEV_DB}?sslmode=disable"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Local database migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Migrations path: ${MIGRATIONS_PATH}"
echo "Database: ${POSTGRES_DEV_DB}"
echo

docker run --rm \
  -v "${MIGRATIONS_PATH}:/migrations" \
  migrate/migrate:v4.17.1 \
  -path=/migrations \
  -database="${MIGRATION_DATABASE_URL}" \
  up

echo
echo "Migration locali completate."
