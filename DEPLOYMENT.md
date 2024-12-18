# Руководство по деплою

## Локальная разработка

### 1. Установка зависимостей
```bash
# Установка зависимостей для frontend
pnpm --filter frontend add @orbs-network/ton-access @ton/ton @tonconnect/ui-react

# Если нужно установить зависимости для backend
pnpm --filter backend add package-name

# Если нужно установить зависимости для shared
pnpm --filter shared add package-name
```

### 2. Сборка и запуск
```bash
# Если изменения только во frontend
pnpm --filter frontend build
pnpm --filter frontend dev

# Если изменения в shared и frontend
pnpm --filter shared build
pnpm --filter frontend build

# Полная сборка всех пакетов
# Сначала собираем shared пакет
pnpm --filter shared build

# Затем собираем backend
pnpm --filter backend build

# И frontend
pnpm --filter frontend build

# Запуск в dev режиме
# В первом терминале
pnpm --filter backend dev

# Во втором терминале
pnpm --filter frontend dev
```

### 3. Чеклист проверки
- [ ] Открыть http://localhost:3000
- [ ] Проверить подключение кошелька
- [ ] Протестировать депозит и вывод средств
- [ ] Проверить консоль на ошибки
- [ ] Проверить работу WebSocket соединения

## Деплой

### 1. Создание коммита
```bash
# Проверка измененных файлов
git status

# Добавление изменений
git add .

# Создание коммита
git commit -m "feat: add TON Connect and contract integration"

# Пуш изменений
git push origin main
```

### 2. Проверка деплоя
- [ ] Проверить статус сборки в GitHub Actions
- [ ] После деплоя проверить https://test.timecommunity.xyz
- [ ] Проверить подключение кошелька
- [ ] Проверить работу с контрактом
- [ ] Проверить WebSocket соединение

### 3. Мониторинг и отладка
```bash
# Проверка логов
pm2 logs backend
pm2 logs frontend

# Перезапуск сервисов
pm2 restart backend
pm2 restart frontend

# Проверка статуса
pm2 status
```

### 4. Откат изменений (если нужно)
```bash
# Отмена последнего коммита локально
git reset --soft HEAD~1

# Откат к конкретному коммиту
git reset --hard <commit-hash>

# Принудительный пуш
git push -f origin main
```

## Полезные команды

### Очистка и пересборка
```bash
# Очистка
rm -rf packages/frontend/.next
rm -rf packages/frontend/node_modules
rm -rf node_modules
rm -rf packages/*/dist

# Установка зависимостей
pnpm install

# Полная пересборка
pnpm --filter shared build && pnpm --filter backend build && pnpm --filter frontend build
```

### Проверка зависимостей
```bash
# Проверка устаревших пакетов
pnpm outdated --recursive

# Обновление пакетов
pnpm update --recursive
```

### Решение проблем
```bash
# Ошибка импорта workspace пакетов
# 1. Проверить наличие зависимости в package.json
# "dependencies": {
#   "@test-contract": "workspace:*"
# }

# 2. Проверить workspaces в корневом package.json
# "workspaces": [
#   "packages/*",
#   "test-contract"
# ]

# 3. Пересобрать зависимости
pnpm install
``` 