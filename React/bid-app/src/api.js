import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bidfastapi-backend.onrender.com:8000',
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.reject(error.response.data);
    } else if (error.request) {
      return Promise.reject({ message: 'Нет ответа от сервера' });
    } else {
      return Promise.reject({ message: 'Ошибка настройки запроса' });
    }
  }
);

const checkFavoriteStatus = (productId) => api.get(`/products/${productId}/favorite-status`);
const addFavorite = (productId) => api.post(`/products/${productId}/favorite`);
const removeFavorite = (productId) => api.delete(`/products/${productId}/favorite`);
const getFavorites = () => api.get('/users/me/favorites');
const getUserProducts = () => api.get('/users/me/products');
const closeAuction = (productId) => api.patch(`/products/${productId}/close`);
const getWonProducts = () => api.get('/users/me/won');

export {
  checkFavoriteStatus,
  addFavorite,
  removeFavorite,
  getFavorites,
  getUserProducts,
  closeAuction,
  getWonProducts
};

export default api;