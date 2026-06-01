#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Errore: DATABASE_URL non trovata nel .env"
  exit 1
fi

echo "Avvio API locale..."
echo "DATABASE_URL caricata"
echo

cd services/api
go run main.go
