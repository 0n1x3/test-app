# Базовый образ
FROM node:18-alpine AS builder

# Установка pnpm и typescript
RUN npm install -g pnpm typescript rimraf

# Рабочая директория
WORKDIR /app

# Копируем только конфигурационные файлы
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходники shared пакета
COPY packages/shared ./packages/shared

# Копируем конфигурационные файлы для frontend
COPY packages/frontend/postcss.config.js ./packages/frontend/
COPY packages/frontend/tailwind.config.js ./packages/frontend/

# Собираем shared пакет
RUN cd packages/shared && pnpm build

# Копируем остальные исходники
COPY . .

# Собираем остальные пакеты
RUN pnpm build

# Устанавливаем переменные окружения для сборки
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Продакшн образ
FROM node:18-alpine AS runner

WORKDIR /app

# Копируем собранные файлы и конфигурации
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/frontend/.next ./packages/frontend/.next
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
COPY --from=builder /app/packages/frontend/package.json ./packages/frontend/

# Устанавливаем только production зависимости
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Открываем порты
EXPOSE 3000 3005

# Запускаем приложение
CMD ["pnpm", "start"]