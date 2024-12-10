# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы pnpm
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

# Копируем package.json из shared и backend
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/backend/package.json ./packages/backend/package.json

# Устанавливаем pnpm и зависимости
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Копируем исходный код shared и backend
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

# Собираем shared и backend
RUN pnpm --filter shared build
RUN pnpm --filter backend build

# Указываем порт
EXPOSE 3005

# Запускаем бэкенд
CMD ["pnpm", "--filter", "backend", "start:prod"]
