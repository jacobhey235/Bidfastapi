import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Убедитесь, что совпадает с вашим бэкендом
  timeout: 5000,
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // Сервер ответил с кодом ошибки
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Запрос был сделан, но нет ответа
      return Promise.reject({ message: 'Нет ответа от сервера' });
    } else {
      // Ошибка при настройке запроса
      return Promise.reject({ message: 'Ошибка настройки запроса' });
    }
  }
);

const checkFavoriteStatus = (productId) => api.get(`/products/${productId}/favorite-status`);
const addFavorite = (productId) => api.post(`/products/${productId}/favorite`);
const removeFavorite = (productId) => api.delete(`/products/${productId}/favorite`);
const getFavorites = () => api.get('/users/me/favorites');
const getUserProducts = () => api.get('/users/me/products');

export {
  checkFavoriteStatus,
  addFavorite,
  removeFavorite,
  getFavorites,
  getUserProducts
};

export default api;