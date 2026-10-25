# Inventory

Учёт приходов и продуктов.

Демо-вход: `demo` / `demo`.

## Локально

Нужны Node.js 20+ и npm.

```bash
npm install
npm run wasm:build
npm run dev
```

Откройте http://localhost:3000. Данные пишутся в `data/inventory.json`.

Переменные: `.env.example`. JWT сессии — httpOnly cookie. Секрет демо: `inventory-demo-secret`; для публикации задайте свой `JWT_SECRET`.

## Docker (полная версия по ТЗ)

```bash
docker compose up --build
```

- Сайт: http://localhost:8080
- Оболочка напрямую (только localhost): http://127.0.0.1:3002
- MySQL Workbench (только localhost): `127.0.0.1:3306`, пароль `inventory`
- Socket.io: тот же `:8080`, путь `/socket.io/`
- Внутренние сервисы с хоста не публикуются

Схема: `schema/inventory.sql` (Workbench: File → Open SQL Script). При `DATABASE_URL=mysql://...` тот же SQL применяется при старте.

## Проверки

```bash
npm test
npm run build
npx playwright install chromium
BASE_URL=http://localhost:8080 npm run test:e2e
```

## Vercel

Витрина без MySQL и микросервисов: https://dzen-code-test.vercel.app  
Полная проверка — Docker.
