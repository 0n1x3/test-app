# Базовый образ
FROM node:18-alpine AS builder

# Установка pnpm
RUN npm install -g pnpm

# Рабочая директория
WORKDIR /app

# Копируем файлы package.json
COPY package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Устанавливаем зависимости
RUN pnpm install

# Копируем исходный код
COPY . .

# Собираем приложения
RUN pnpm build

# Продакшн образ
FROM node:18-alpine AS runner

WORKDIR /app

# Копируем собранные файлы из builder
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/frontend/.next ./packages/frontend/.next
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Копируем package.json файлы
COPY package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Устанавливаем только production зависимости
RUN npm install -g pnpm && pnpm install --prod

# Открываем порты
EXPOSE 3000 3005

# Запускаем приложение
CMD ["pnpm", "start"]