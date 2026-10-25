# Inventory

Учёт приходов и продуктов: список, карточка прихода, фильтры, живые часы, счётчик вкладок, подтверждение удаления и сохранение данных.

Демо-вход: `demo` / `demo`.

## Запуск с нуля

Нужны Node.js 20+ и npm.

```bash
npm install
npm run wasm:build
npm run dev
```

Откройте http://localhost:3000. Данные пишутся в `data/inventory.json`. Повторный запуск сохраняет удаления и новые записи.

Проверка, которую делает тестировщик:

1. Войти `demo` / `demo`.
2. В шапке идут секунды, рядом число открытых вкладок. Вторая вкладка того же адреса увеличивает число до 2, закрытие уменьшает его в течение нескольких секунд.
3. Клик по названию прихода открывает состав справа. Крестик возвращает широкий список.
4. Сумма прихода равна сумме цен его продуктов отдельно в `$` и `uah`.
5. Удаление спрашивает подтверждение. После обновления страницы запись не возвращается.
6. На продуктах работают поиск, тип и спецификация. Число в заголовке — полное, «показано N» — после фильтра.
7. Пустой результат, пустой приход и неверная гарантия (конец раньше начала) не ломают экран.

## Проверки

```bash
npm test
npm run build
npm run start
```

`npm test` покрывает деньги, даты, валидацию, схему MySQL и сценарий «создать приход, добавить продукт, удалить, перечитать файл, две вкладки».

## Docker

MySQL и отдельные процессы: веб, микрофронт продуктов, шлюз, приходы, продукты, авторизация, Socket.io, обработчик событий.

```bash
docker compose up --build
```

- Приложение: http://localhost:3000
- Микрофронт: http://localhost:3001/mfe
- Шлюз: http://localhost:4000/health
- Приходы: http://localhost:4101/orders
- Продукты: http://localhost:4102/products
- Вход сервиса: http://localhost:4103/login
- Socket.io: http://localhost:4001

В контейнерах та же схема, что в `schema/inventory.sql`. Пароль базы в compose — учебный `inventory`.

## Схема базы

Файл `schema/inventory.sql` открывается в MySQL Workbench: File → Open SQL Script. Таблицы приложения создаются этим же SQL при старте с `DATABASE_URL=mysql://...`.

## Vercel

Продакшен: https://dzen-code-test.vercel.app

Сборка описана в `vercel.json`: зависимости ставятся в корне, Next.js собирается в `apps/web`, результат берётся из `apps/web/.next`.

На Vercel включена защита деплоя (Vercel Authentication). Тестировщик без аккаунта Vercel получит страницу входа. Её нужно выключить: Project Settings → Deployment Protection → отключить Vercel Authentication для Production.

Без `BLOB_READ_WRITE_TOKEN` или `DATABASE_URL` данные на Vercel живут в файле экземпляра функции. Локально и в Docker удаления сохраняются надёжно. Для проверки чек-листа с перезагрузкой страницы надёжнее `npm run dev` или `docker compose up`.

Переменные смотрите в `.env.example`. Секрет демо-токена: `inventory-demo-secret`. Для публикации задайте свой `JWT_SECRET`.

## Что закрывает матрицу

| Требование | Где |
| --- | --- |
| React, Next.js SSR, TypeScript | `apps/web` |
| Redux | `apps/web/src/store.ts` |
| БЭМ и Bootstrap grid | `packages/ui/src/styles/app.css` |
| REST через Axios | `apps/web/src/api.ts`, `app/api` |
| GraphQL | `POST /api/graphql`, сервис gateway |
| Формы и валидация | `packages/domain/src/validation.ts` |
| JWT и Web Storage | cookie + `localStorage` (`inventory.token`, язык, id вкладки) |
| i18n | русский по умолчанию, английский в Настройках |
| Lazy loading | график, карта и граф грузятся отдельно |
| График и карта | страница приходов и Настройки |
| Граф связей | страница Группы, React Flow |
| WebSocket / Socket.io | счётчик вкладок; в Docker сервис `realtime` |
| Web Worker и WASM | `public/totals.worker.js`, `packages/wasm/sum.wat` |
| PWA | `manifest.ts`, `public/sw.js` |
| События | таблица `outbox`, сервис `worker` |
| Микросервисы | `services/*` |
| Микрофронт | `apps/products`, `basePath: /mfe` |
| Тесты | `npm test` |
| Адаптив | меню-ящик, карточки продуктов, панель прихода на весь экран |

Нагрузка из матрицы (100 тысяч пользователей и миллион сообщений в сутки) здесь заложена так: сервисы без состояния, присутствие вкладок в общем хранилище, а не в памяти процесса, очередь `outbox` и отдельный Socket.io. Это учебный контур, не кластер на миллион соединений.
