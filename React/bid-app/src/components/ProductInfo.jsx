import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';
import { 
  Button, 
  Container, 
  Row, 
  Col, 
  Card, 
  Carousel, 
  Form, 
  Alert, 
  Spinner,
  Badge
} from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const productImages = [
    'https://via.placeholder.com/800x600?text=Product+Image+1',
    'https://via.placeholder.com/800x600?text=Product+Image+2',
    'https://via.placeholder.com/800x600?text=Product+Package',
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setCurrentUserId(parseInt(localStorage.getItem('user_id')));
    fetchProduct();
    checkFavoriteStatus();
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    if (isAuthenticated) {
      try {
        const response = await api.get(`/products/${id}/favorite-status`);
        setIsFavorite(response.data.is_favorite);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    }
  };

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

  const handleBidClick = () => {
    setIsBidding(true);
    setBidAmount((product.cur_bid + 0.01).toFixed(2));
    setBidError('');
  };

  const handleBidSubmit = async () => {
    try {
      const amount = parseFloat(bidAmount);
      if (isNaN(amount) || amount <= 0) {
        setBidError('Ставка должна быть положительным числом');
        return;
      }
      
      await api.post(`/products/${id}/bid`, { amount });
      await fetchProduct();
      setIsBidding(false);
    } catch (err) {
      setBidError(err.response?.data?.detail || 'Ошибка при размещении ставки');
    }
  };

  const handleBidCancel = () => {
    setIsBidding(false);
    setBidAmount('');
    setBidError('');
  };

  const handlePayClick = () => {
    alert('Оплата товара будет реализована позже');
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU');
  };

  if (isLoading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5 text-center">
        <Card>
          <Card.Body>Товар не найден</Card.Body>
        </Card>
      </Container>
    );
  }

  const isOwner = product.owner_id === currentUserId;
  const isWinner = !product.is_active && product.max_bid_user_id === currentUserId;
  const minBid = product.cur_bid + 0.01;

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
          <Col md={6} className="p-3">
            <Carousel activeIndex={activeIndex} onSelect={setActiveIndex}>
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

          <Col md={6}>
            <Card.Body className="h-100 d-flex flex-column p-4">
              <div className="mb-4">
                <h2 className="mb-3">{product.title}</h2>
                <Badge bg="primary" className="mb-3">{product.category}</Badge>
                <p className="text-muted">{product.description}</p>
              </div>

              <div className="mt-auto">
                <Card className="mb-4 border-primary">
                  <Card.Body>
                    <h4 className="text-danger mb-3">
                      {product.cur_bid.toFixed(2)} руб.
                      <small className="text-muted d-block">Текущая ставка</small>
                    </h4>
                    {product.max_bid_user_id && (
                      <p className="text-muted small mb-2">
                        {isWinner ? (
                          <Badge bg="success">Вы выиграли этот товар!</Badge>
                        ) : (
                          `Текущий лидер: Пользователь #${product.max_bid_user_id}`
                        )}
                      </p>
                    )}
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">Окончание торгов:</h5>
                        <p className="mb-0 text-muted">
                          {formatDate(product.bid_date)}
                        </p>
                      </div>
                      <div className="text-end">
                        <Badge bg={product.is_active ? 'success' : 'secondary'}>
                          {product.is_active ? 'Активные торги' : 'Торги закрыты'}
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-grid gap-2">
                  {isAuthenticated ? (
                    isOwner ? (
                      <Button 
                        variant="danger" 
                        size="lg" 
                        onClick={() => api.patch(`/products/${id}/close`).then(fetchProduct)}
                        disabled={!product.is_active}
                      >
                        {product.is_active ? 'Закрыть торги' : 'Торги закрыты'}
                      </Button>
                    ) : isWinner ? (
                      <Button variant="success" size="lg" onClick={handlePayClick}>
                        Оплатить
                      </Button>
                    ) : product.is_active ? (
                      isBidding ? (
                        <>
                          <Form.Group>
                            <Form.Label>Ваша ставка (мин. {minBid.toFixed(2)} руб.)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.01"
                              min={minBid}
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                            />
                          </Form.Group>
                          {bidError && <Alert variant="danger">{bidError}</Alert>}
                          <div className="d-flex gap-2">
                            <Button variant="success" onClick={handleBidSubmit}>
                              Подтвердить ставку
                            </Button>
                            <Button variant="outline-secondary" onClick={handleBidCancel}>
                              Отмена
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <Button variant="primary" size="lg" onClick={handleBidClick}>
                            Сделать ставку
                          </Button>
                          <Button
                            variant={isFavorite ? "danger" : "outline-secondary"}
                            onClick={handleFavorite}
                          >
                            {isFavorite ? "Удалить из избранного" : "В избранное"}
                          </Button>
                        </>
                      )
                    ) : (
                      <Button variant="secondary" size="lg" disabled>
                        Торги завершены
                      </Button>
                    )
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