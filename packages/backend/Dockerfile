# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Создаем структуру директорий
RUN mkdir -p packages/shared packages/backend

# Копируем package.json файлы
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/

# Устанавливаем pnpm и зависимости
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile && \
    pnpm add uuid@9.0.0 -w @test-app/backend

# Копируем исходный код (исключая node_modules)
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/backend/src ./packages/backend/src
COPY packages/backend/tsconfig.json ./packages/backend/

# Собираем shared и backend
RUN pnpm --filter shared build
RUN pnpm --filter backend build

# Указываем порт
EXPOSE 3005

# Запускаем бэкенд
CMD ["pnpm", "--filter", "backend", "start:prod"]
