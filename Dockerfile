# Stage 1 — сборка React
FROM node:18 AS frontend

WORKDIR /app
COPY React/bid-app/package*.json ./
RUN npm install
COPY React/bid-app ./
RUN npm run build

# Stage 2 — сборка Python backend
FROM python:3.10.3-slim AS backend

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY FastAPI ./FastAPI
COPY .env .

# Копируем build React в FastAPI/static
COPY --from=frontend /app/build ./FastAPI/static

# Final stage — запуск
FROM python:3.10.3-slim

WORKDIR /app
COPY --from=backend /app /app

RUN pip install uvicorn

EXPOSE 8000
CMD ["uvicorn", "FastAPI.main:app", "--host", "0.0.0.0", "--port", "8000"]
