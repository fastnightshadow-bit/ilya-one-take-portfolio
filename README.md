# Портфолио Ильи

Одностраничное портфолио на Vite, TypeScript и GSAP. Сайт собирается в обычные статические файлы: отдельный сервер, база данных и CMS ему не нужны.

## Первый запуск

Нужен Node.js версии 22.13 или новее. В папке проекта выполните:

```bash
npm ci
npm run dev
```

После запуска откройте адрес, который Vite покажет в терминале (обычно `http://localhost:5173`).

`npm ci` воспроизводит точные версии из `package-lock.json`. `npm install` используйте только когда намеренно меняете зависимости и обновляете lock-файл.

## Просмотр по Wi-Fi

Команда `npm run dev` уже запускает Vite с флагом `--host 0.0.0.0`. Компьютер и телефон должны быть в одной Wi-Fi сети. Откройте на телефоне адрес `Network`, который появится в терминале, например `http://192.168.1.20:5173`.

Для просмотра именно production-сборки:

```bash
npm run build
npm run preview
```

## Проверка перед публикацией

Полный повторяемый release gate:

```bash
npm ci
npm run check
```

Он последовательно запускает Vitest и Node script-тесты, создаёт свежую production-сборку, проверяет SEO в `dist`, поднимает `vite preview` без переиспользования dev-сервера, выполняет на production-сборке тот же набор E2E/accessibility-тестов и затем mobile Lighthouse CI.

Отдельные проверки:

```bash
npm run test
npm run test:unit
npm run test:scripts
npm run typecheck
npm run build
npm run verify:dist-seo
npm run e2e
npm run e2e:prod
npm run audit
```

`npm run e2e` поднимает Vite dev-сервер для быстрой разработки. `npm run e2e:prod` тестирует уже собранную папку `dist/`; перед отдельным запуском этой команды выполните `npm run build`.

`npm run audit` — это Lighthouse CI с порогами Performance ≥ 85, Accessibility/Best Practices/SEO ≥ 95 и CLS ≤ 0.1. Для самостоятельного Lighthouse-запуска сначала выполните `npm run build`, чтобы аудитировать свежую папку `dist`.

Проверка зависимостей npm — другая команда:

```bash
npm audit
npm audit --omit=dev
```

## Готовая сборка

После `npm run build` готовые файлы находятся в папке `dist/`. Эту папку можно передать на любой статический хостинг.

## Контакт и домен

Все основные CTA ведут на проверенный Telegram-адрес: `https://t.me/girtopw`.

Публичный домен пока не настроен, поэтому canonical URL и абсолютные social URL намеренно не добавлены. Когда домен будет выбран, его нужно добавить в SEO-метаданные и JSON-LD, затем снова выполнить `npm run check`. Этот репозиторий не является подтверждением публикации или деплоя сайта.
