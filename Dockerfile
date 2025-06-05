# Stage 1 — сборка React
FROM node:18-alpine AS frontend

WORKDIR /app
COPY React/bid-app/package*.json ./
RUN npm ci --silent
COPY React/bid-app ./
RUN npm run build

# Stage 2 — финальный образ
FROM python:3.10-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir uvicorn

# Копирование бэкенда
COPY FastAPI ./FastAPI

# Копирование статики фронтенда
COPY --from=frontend /app/build ./FastAPI/static

EXPOSE 8000
CMD ["uvicorn", "FastAPI.main:app", "--host", "0.0.0.0", "--port", "8000"]