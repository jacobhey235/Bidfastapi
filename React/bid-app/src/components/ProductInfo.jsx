import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { Button, Container, Row, Col, Card, Carousel } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  const productImages = [
    'https://via.placeholder.com/800x600?text=Основное+изображение',
    'https://via.placeholder.com/800x600?text=Дополнительный+вид',
    'https://via.placeholder.com/800x600?text=Упаковка',
  ];

  const formatToCustomDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}/`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handleBid = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Логика для ставки
    console.log('Делаем ставку на товар', product.id);
  };

  const handleLoginRedirect = () => {
    // Сохраняем текущий путь перед переходом на страницу входа
    navigate('/login', { state: { from: location.pathname } });
  };

  // Добавим состояние для избранного
  const [isFavorite, setIsFavorite] = useState(false);

  // Проверяем статус избранного при загрузке
  const checkFavoriteStatus = async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get(`/products/${id}/favorite-status`);
        setIsFavorite(response.data.is_favorite); // Обратите внимание на response.data.is_favorite
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    }
  };
  
  useEffect(() => {
    checkFavoriteStatus();
  }, [id, isAuthenticated]);

  // Обработчик для избранного
  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.delete(`/products/${id}/favorite`);
      } else {
        await api.post(`/products/${id}/favorite`);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button
        variant="outline-secondary"
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ArrowLeft className="me-2" /> Назад к списку
      </Button>

      <Card className="shadow-sm">
        <Row className="g-0">
          {/* Галерея изображений */}
          <Col md={6} className="p-3">
            <Carousel activeIndex={activeIndex} onSelect={handleSelect} variant="dark">
              {productImages.map((img, index) => (
                <Carousel.Item key={index}>
                  <div className="ratio ratio-4x3">
                    <img
                      className="d-block w-100 img-fluid rounded"
                      src={img}
                      alt={`Изображение товара ${index + 1}`}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
            <div className="d-flex justify-content-center mt-3">
              {productImages.map((_, index) => (
                <Button
                  key={index}
                  variant={activeIndex === index ? 'primary' : 'outline-secondary'}
                  size="sm"
                  className="rounded-circle mx-1"
                  style={{ width: '12px', height: '12px', padding: 0 }}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </Col>

          {/* Информация о товаре */}
          <Col md={6}>
            <Card.Body className="h-100 d-flex flex-column p-4">
              <div className="mb-4">
                <h2 className="mb-3">{product.title}</h2>
                <span className="badge bg-primary mb-3">{product.category}</span>
                <p className="text-muted">{product.description}</p>
              </div>

              <div className="mt-auto">
                <Card className="mb-4 border-primary">
                  <Card.Body>
                    <h4 className="text-danger mb-3">
                      {product.cur_bid} руб.
                      <small className="text-muted d-block">Текущая ставка</small>
                    </h4>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">Окончание торгов:</h5>
                        <p className="mb-0 text-muted">
                          {formatToCustomDate(product.bid_date)}
                        </p>
                      </div>
                      <div className="text-end">
                        <small className="d-block text-muted">До окончания:</small>
                        <span className="badge bg-warning text-dark">
                          Менее дня
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-grid gap-2">
                  {isAuthenticated ? (
                    <>
                      <Button variant="primary" size="lg" onClick={handleBid}>
                        Сделать ставку
                      </Button>
                      <Button
                        variant={isFavorite ? "danger" : "outline-secondary"}
                        onClick={handleFavorite}
                      >
                        {isFavorite ? "Удалить из избранного" : "В избранное"}
                      </Button>
                    </>
                  ) : (
                    <Button variant="primary" size="lg" onClick={handleLoginRedirect}>
                      Войдите, чтобы сделать ставку
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default ProductInfo;