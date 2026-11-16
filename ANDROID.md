# Усьтон — первый офлайн Android APK

Ветка: android-test. Веб-источники и main не изменяются.

Capacitor 8.0.0, package ID ru.uston.portal, Android 7+.
GitHub Actions создаёт нативный проект из закреплённой версии Capacitor,
копирует весь отслеживаемый веб-контент с прежними путями и собирает debug APK.
Нативный каталог android и dist-android генерируются, не редактируются вручную.

Локально: Node 22+, pnpm 11.25.0, JDK 21, Android SDK.
`pnpm install --frozen-lockfile`, `pnpm run android:prepare`,
затем `cd android && ./gradlew assembleDebug`.
Повторная синхронизация: `pnpm run build:android-web && pnpm exec cap sync android`.

Артефакт Actions: uston-offline-debug-apk (30 дней).
Это тестовая сборка с debug-подписью, для установки вручную, не для Google Play.
Прогресс хранится локально в WebView; аккаунтов и синхронизации нет.
Ссылки на внешние источники требуют интернет; учебный контент упакован локально.
Три архивные фотографии Мултана из Wikimedia Commons включены в APK;
подписи, авторство и ссылки на условия использования сохранены.

Проверки Actions: существующие проверки контента, браузерные проверки всех
13 модулей с блокировкой внешних запросов, побайтовая проверка файлов APK,
установка и запуск в Android-эмуляторе при выключенных Wi-Fi и мобильной сети.
Результаты, журнал и скриншот: android-verification.
