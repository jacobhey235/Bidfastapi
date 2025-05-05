# Сборка фронтенда
FROM node:18 AS frontend

WORKDIR /app
COPY React/bid-app/package*.json ./
RUN npm install
COPY React/bid-app ./
RUN npm run build

# Сборка бэкенда
FROM python:3.10.3-slim AS backend

# Установка зависимостей
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код бэкенда
COPY FastAPI ./FastAPI
COPY .env .

FROM python:3.10.3-slim

WORKDIR /app

# Копируем зависимости и код из бэкенда
COPY --from=backend /usr/local/lib/python3.10 /usr/local/lib/python3.10
COPY --from=backend /app /app

# Копируем собранный фронтенд
COPY --from=frontend /app/build ./FastAPI/static

# Установка Uvicorn
RUN pip install uvicorn

EXPOSE 8000

CMD ["uvicorn", "FastAPI.main:app", "--host", "0.0.0.0", "--port", "8000"]
