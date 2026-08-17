# Памятка администратору для размещения ЕИАС «Фемида»

Архив содержит исходники проекта и конфигурацию Docker Compose для размещения на Linux-хосте. База данных создается с нуля при первом запуске.

## Быстрый запуск

1. Распаковать архив на сервере.
2. Установить Docker Engine и Docker Compose.
3. Создать конфигурацию:

   ```sh
   cp .env.host.example .env.host
   chmod 600 .env.host
   ```

4. В `.env.host` заменить все `CHANGE_ME...`, указать `PUBLIC_URL` и `SITE_ADDRESS`.
5. Запустить:

   ```sh
   chmod +x scripts/deploy-test-host.sh scripts/backup-test-host.sh
   ./scripts/deploy-test-host.sh
   ```

## Проверка

```sh
docker compose --env-file .env.host -f docker-compose.host.yml ps
docker compose --env-file .env.host -f docker-compose.host.yml logs --tail=200 api
```

Публичная проверка после запуска:

```sh
curl -i "$PUBLIC_URL/api/v1/health"
```

## Важное

- Не передавать и не хранить в репозитории реальные `.env`, webhook URL, пароли и ключи.
- Для чистой БД оставить `RUN_SEED=false`; для тестового наполнения можно временно поставить `RUN_SEED=true`.
- PostgreSQL, Redis и MinIO не публикуются наружу, наружу выходит только Caddy/proxy.
- Основная инструкция: `docs/test-hosting.md`.
