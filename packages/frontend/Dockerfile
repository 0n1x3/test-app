# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы pnpm
COPY package.json ./package.json
COPY pnpm-lock.yaml ./pnpm-lock.yaml
COPY pnpm-workspace.yaml ./pnpm-workspace.yaml

# Копируем package.json из shared и frontend
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json

# Устанавливаем pnpm и зависимости
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Копируем исходный код shared и frontend
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend

# Собираем shared и frontend
RUN pnpm --filter shared build
RUN pnpm --filter frontend build

# Указываем порт
EXPOSE 3000

# Запускаем фронтенд
CMD ["pnpm", "--filter", "frontend", "start"]
