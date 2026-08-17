#!/usr/bin/env sh
set -eu
umask 077

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE=${1:-"$ROOT_DIR/.env.host"}
COMPOSE_FILE="$ROOT_DIR/docker-compose.host.yml"
BACKUP_DIR=${2:-"$ROOT_DIR/backups"}

[ -f "$ENV_FILE" ] || {
  printf 'Не найден %s\n' "$ENV_FILE" >&2
  exit 1
}

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

mkdir -p "$BACKUP_DIR"
timestamp=$(date -u +'%Y%m%dT%H%M%SZ')
database_archive="$BACKUP_DIR/femida-postgres-$timestamp.dump"
keycloak_archive="$BACKUP_DIR/femida-keycloak-$timestamp.dump"
documents_archive="$BACKUP_DIR/femida-minio-$timestamp.tar.gz"

cd "$ROOT_DIR"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc >"$database_archive"
if [ -n "${KEYCLOAK_DB_NAME:-}" ]; then
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
    pg_dump -U "$POSTGRES_USER" -d "$KEYCLOAK_DB_NAME" -Fc >"$keycloak_archive"
fi
minio_container=$(
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps -q minio
)
[ -n "$minio_container" ] || {
  printf 'MinIO container is not running\n' >&2
  exit 1
}
docker run --rm --network none --volumes-from "$minio_container:ro" \
  caddy:2.8-alpine tar -C /data -czf - . >"$documents_archive"

printf 'Резервная копия базы: %s\n' "$database_archive"
if [ -s "$keycloak_archive" ]; then
  printf 'Резервная копия Keycloak: %s\n' "$keycloak_archive"
fi
printf 'Резервная копия документов: %s\n' "$documents_archive"
