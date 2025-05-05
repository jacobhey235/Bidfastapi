# BidFastAPI

Full-stack CRUD-приложение для управления товарами и ставками, созданное с использованием **React**, **FastAPI** и **PostgreSQL**.

## 📁 Структура проекта

bidfastapi/
│
├── FastAPI/ # Бэкенд FastAPI
│ ├── auth.py # Логика авторизации
│ ├── database.py # Подключение к PostgreSQL
│ ├── main.py # Главный файл API и маршруты
│ ├── models.py # SQLAlchemy модели
│
├── React/
│ └── bid-app/ # Фронтенд React
│ ├── public/ # Статические файлы
│ ├── src/
│ │ ├── components/ # React-компоненты
│ │ │ ├── Account.jsx
│ │ │ ├── AddProduct.jsx
│ │ │ ├── Login.jsx
│ │ │ ├── ProductInfo.jsx
│ │ │ └── ProductList.jsx
│ │ └── api.js # API-интерфейс для общения с бэкендом
│ ├── package.json # Зависимости проекта
│
├── .env # Переменные окружения
├── .gitignore
├── requirements.txt # Зависимости Python
├── Dockerfile # Dockerfile для сборки всего проекта
└── venv/ # Виртуальное окружение Python (игнорируется в Docker)

## 🚀 Как запустить

1. **Создайте `.env` файл** в корне проекта:

DATABASE_URL=(ссылка на подключение к базе данных)
SECRET_KEY=(секретный ключ для шифрования)
ALGORITHM=(алгоритм хеширования)

2. **Соберите и запустите Docker-контейнер:**

```bash
docker build -t bidfastapi .
docker run -p 8000:8000 bidfastapi
Откройте в браузере:

Фронтенд: http://localhost:8000

Бэкенд Swagger UI: http://localhost:8000/docs

🛠 Технологии
🧠 Backend: FastAPI, SQLAlchemy, JWT, PostgreSQL

🎨 Frontend: React, Axios

🐳 Docker: мультистейдж-сборка

📌 Заметки
Фронтенд собирается и обслуживается как статика через FastAPI.

PostgreSQL должен быть запущен отдельно (например, через Docker Compose, если необходимо).

🔗 Лицензия
Проект создан в учебных целях.
