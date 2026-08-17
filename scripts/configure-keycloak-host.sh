#!/usr/bin/env sh
set -eu
umask 077

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
ENV_FILE=${1:-"$ROOT_DIR/.env.host"}
ACTION=${2:-prepare}
COMPOSE_FILE="$ROOT_DIR/docker-compose.host.yml"

[ -f "$ENV_FILE" ] || {
  printf 'Не найден %s\n' "$ENV_FILE" >&2
  exit 1
}

set_env() {
  name=$1
  value=$2
  temporary="$ENV_FILE.tmp.$$"
  awk -v key="$name" -v val="$value" '
    BEGIN { replaced = 0 }
    index($0, key "=") == 1 {
      if (!replaced) print key "=" val
      replaced = 1
      next
    }
    { print }
    END { if (!replaced) print key "=" val }
  ' "$ENV_FILE" >"$temporary"
  mv "$temporary" "$ENV_FILE"
}

ensure_secret() {
  name=$1
  current=$(sed -n "s/^$name=//p" "$ENV_FILE" | tail -1)
  if [ -z "$current" ]; then
    set_env "$name" "$(openssl rand -hex 32)"
  fi
}

if [ "$ACTION" = "activate" ]; then
  set_env AUTH_MODE keycloak
  cd "$ROOT_DIR"
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build api web
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --force-recreate \
    api worker web proxy
  exit 0
fi

[ "$ACTION" = "prepare" ] || {
  printf 'Неизвестное действие: %s (допустимо prepare или activate)\n' "$ACTION" >&2
  exit 1
}

ensure_secret KEYCLOAK_ADMIN_PASSWORD
ensure_secret KEYCLOAK_DB_PASSWORD
ensure_secret KEYCLOAK_BACKEND_CLIENT_SECRET
set_env KEYCLOAK_ADMIN admin
set_env KEYCLOAK_DB_NAME keycloak
set_env KEYCLOAK_DB_USER keycloak
set_env KEYCLOAK_REALM femida
set_env KEYCLOAK_FRONTEND_CLIENT_ID femida-web
set_env KEYCLOAK_BACKEND_CLIENT_ID femida-api
set_env AUTH_MODE keycloak

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

case "$KEYCLOAK_DB_USER:$KEYCLOAK_DB_NAME" in
  *[!a-zA-Z0-9_:.-]*)
    printf 'Недопустимое имя базы или пользователя Keycloak\n' >&2
    exit 1
    ;;
esac

cd "$ROOT_DIR"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T postgres \
  psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 \
  -v kc_user="$KEYCLOAK_DB_USER" -v kc_db="$KEYCLOAK_DB_NAME" \
  -v kc_password="$KEYCLOAK_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE %I LOGIN', :'kc_user')
 WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'kc_user') \gexec
SELECT format(
  'ALTER ROLE %I WITH LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE',
  :'kc_user',
  :'kc_password'
) \gexec
SELECT format('CREATE DATABASE %I OWNER %I', :'kc_db', :'kc_user')
 WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = :'kc_db') \gexec
SQL

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d keycloak

ready=0
for attempt in $(seq 1 60); do
  if docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T keycloak \
    /opt/keycloak/bin/kcadm.sh config credentials \
      --server http://127.0.0.1:8080/sso \
      --realm master \
      --user "$KEYCLOAK_ADMIN" \
      --password "$KEYCLOAK_ADMIN_PASSWORD" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 3
done

[ "$ready" -eq 1 ] || {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=100 keycloak
  printf 'Keycloak не запустился за отведённое время\n' >&2
  exit 1
}

client_id=$(
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T keycloak \
    /opt/keycloak/bin/kcadm.sh get clients -r "$KEYCLOAK_REALM" \
      -q clientId="$KEYCLOAK_BACKEND_CLIENT_ID" --fields id --format csv --noquotes |
    tr -d '\r'
)
[ -n "$client_id" ] || {
  printf 'Не найден клиент %s\n' "$KEYCLOAK_BACKEND_CLIENT_ID" >&2
  exit 1
}

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T keycloak \
  /opt/keycloak/bin/kcadm.sh update "clients/$client_id" -r "$KEYCLOAK_REALM" \
    -s directAccessGrantsEnabled=true \
    -s "secret=$KEYCLOAK_BACKEND_CLIENT_SECRET" >/dev/null
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T keycloak \
  /opt/keycloak/bin/kcadm.sh update "realms/$KEYCLOAK_REALM" \
    -s accessTokenLifespan=43200 >/dev/null

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build api
printf 'Keycloak подготовлен. AUTH_MODE установлен в keycloak.\n'
