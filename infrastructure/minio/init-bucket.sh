#!/bin/sh
# ---------------------------------------------------------------------------
# Создание приватного bucket'а ЕИАС «Фемида» в MinIO.
# Публичная политика доступа не назначается: файлы выдаются только по
# временным ссылкам после проверки полномочий на стороне API.
# ---------------------------------------------------------------------------
set -eu

MINIO_ALIAS=femida
BUCKET="${MINIO_BUCKET:-femida-documents}"

echo "Ожидание готовности MinIO…"
until mc alias set "$MINIO_ALIAS" "http://minio:9000" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" >/dev/null 2>&1; do
  sleep 2
done

if mc ls "$MINIO_ALIAS/$BUCKET" >/dev/null 2>&1; then
  echo "Bucket «$BUCKET» уже существует."
else
  mc mb "$MINIO_ALIAS/$BUCKET"
  echo "Bucket «$BUCKET» создан."
fi

# Явно закрываем анонимный доступ.
mc anonymous set none "$MINIO_ALIAS/$BUCKET"

# Хранение версий объектов: требуется для истории версий документов.
mc version enable "$MINIO_ALIAS/$BUCKET" || echo "Версионирование недоступно в текущем режиме MinIO."

echo "Инициализация MinIO завершена."
