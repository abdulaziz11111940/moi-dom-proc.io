#!/bin/bash
# ---------------------------------------------------------------------------
# Создание отдельной базы данных и пользователя для Keycloak.
# Скрипт выполняется один раз при первичной инициализации тома PostgreSQL.
# ---------------------------------------------------------------------------
set -euo pipefail

KEYCLOAK_DB_NAME="${KEYCLOAK_DB_NAME:-keycloak}"
KEYCLOAK_DB_USER="${KEYCLOAK_DB_USER:-keycloak}"
KEYCLOAK_DB_PASSWORD="${KEYCLOAK_DB_PASSWORD:-keycloak}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER "${KEYCLOAK_DB_USER}" WITH PASSWORD '${KEYCLOAK_DB_PASSWORD}';
  CREATE DATABASE "${KEYCLOAK_DB_NAME}" OWNER "${KEYCLOAK_DB_USER}";
  GRANT ALL PRIVILEGES ON DATABASE "${KEYCLOAK_DB_NAME}" TO "${KEYCLOAK_DB_USER}";
EOSQL

# Расширения, необходимые основной базе ЕИАС «Фемида»:
#   pg_trgm — нечёткий поиск по реестрам,
#   unaccent — поиск без учёта диакритики.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE EXTENSION IF NOT EXISTS unaccent;
EOSQL

echo "База данных Keycloak и расширения PostgreSQL созданы."
