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
  Badge,
  Modal
} from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons';

const ProductInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Состояния для данных товара
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Состояния для авторизации
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Состояния для ставок
  const [isBidding, setIsBidding] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  
  // Состояния для избранного
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Состояния для загрузки
  const [isLoading, setIsLoading] = useState(true);
  
  // Состояния для редактирования
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    description: '',
    bid_date: '',
    cur_bid: 0.0
  });
  const [editFiles, setEditFiles] = useState([]);
  const [editError, setEditError] = useState('');
  
  // Состояния для удаления
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Загрузка данных товара
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setCurrentUserId(parseInt(localStorage.getItem('user_id')));
    
    const fetchData = async () => {
      try {
        const [productResponse, imagesResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/images`)
        ]);
        
        setProduct(productResponse.data);
        setImages(imagesResponse.data);
        
        if (isAuthenticated) {
          const favoriteResponse = await api.get(`/products/${id}/favorite-status`);
          setIsFavorite(favoriteResponse.data.is_favorite);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  // Инициализация формы редактирования
  useEffect(() => {
    if (product && isEditing) {
      setEditFormData({
        title: product.title,
        category: product.category,
        description: product.description,
        bid_date: product.bid_date.slice(0, 16),
        cur_bid: product.cur_bid
      });
    }
  }, [isEditing, product]);

  // Обработчики для избранного
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

  // Обработчики для ставок
  const handleBidClick = () => {
    setIsBidding(true);
    setBidAmount((product.cur_bid + 0.01).toFixed(2));
    setBidError('');
  };

  const handleBidSubmit = async () => {
    try {
      const amount = parseFloat(bidAmount);
      if (isNaN(amount) || amount <= product.cur_bid) {
        setBidError(`Ставка должна быть больше ${product.cur_bid.toFixed(2)}`);
        return;
      }
      
      await api.post(`/products/${id}/bid`, { amount });
      const updatedProduct = await api.get(`/products/${id}`);
      setProduct(updatedProduct.data);
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

  // Обработчики для редактирования
  const handleEditClick = () => {
    setIsEditing(true);
    setEditError('');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditFiles([]);
    setEditError('');
  };

  const handleEditInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditFileChange = (e) => {
    setEditFiles(Array.from(e.target.files));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', editFormData.title);
      formDataToSend.append('category', editFormData.category);
      formDataToSend.append('description', editFormData.description);
      formDataToSend.append('bid_date', editFormData.bid_date);
      formDataToSend.append('cur_bid', editFormData.cur_bid);
      
      if (editFiles.length > 0) {
        editFiles.forEach(file => {
          formDataToSend.append('files', file);
        });
      }

      const updatedProduct = await api.put(`/products/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProduct(updatedProduct.data);
      setIsEditing(false);
      setEditFiles([]);
      
      if (editFiles.length > 0) {
        const imagesResponse = await api.get(`/products/${id}/images`);
        setImages(imagesResponse.data);
      }
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Ошибка при обновлении товара');
    }
  };

  // Обработчики для удаления
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/products/${id}`);
      navigate('/account/products');
    } catch (err) {
      console.error('Error deleting product:', err);
      setEditError(err.response?.data?.detail || 'Ошибка при удалении товара');
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Вспомогательные функции
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

  const getMinDate = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  // Проверки состояния
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

      {/* Модальное окно подтверждения удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить этот товар? Это действие нельзя отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="shadow-sm">
        <Row className="g-0">
          {/* Галерея изображений */}
          <Col md={6} className="p-3">
            <Carousel activeIndex={activeIndex} onSelect={setActiveIndex}>
              {images.length > 0 ? (
                images.map((img, index) => (
                  <Carousel.Item key={index}>
                    <div className="ratio ratio-4x3">
                      <img
                        className="d-block w-100 img-fluid rounded"
                        src={`data:image/jpeg;base64,${img}`}
                        alt={`Изображение товара ${index + 1}`}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </Carousel.Item>
                ))
              ) : (
                <Carousel.Item>
                  <div className="ratio ratio-4x3 bg-light d-flex align-items-center justify-content-center">
                    <span className="text-muted">Нет изображений</span>
                  </div>
                </Carousel.Item>
              )}
            </Carousel>
            <div className="d-flex justify-content-center mt-3">
              {images.map((_, index) => (
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

          {/* Информация о товаре и действия */}
          <Col md={6}>
            <Card.Body className="h-100 d-flex flex-column p-4">
              {isEditing ? (
                // Форма редактирования
                <div className="mt-4">
                  <h4>Редактирование товара</h4>
                  {editError && <Alert variant="danger">{editError}</Alert>}
                  
                  <Form onSubmit={handleEditSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Название товара</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="title" 
                        value={editFormData.title} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Категория</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="category" 
                        value={editFormData.category} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Описание</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="description" 
                        value={editFormData.description} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Новые изображения (опционально)</Form.Label>
                      <Form.Control 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png"
                        onChange={handleEditFileChange}
                      />
                      <Form.Text muted>Оставьте пустым, чтобы сохранить текущие изображения</Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Дата и время окончания торгов</Form.Label>
                      <Form.Control 
                        type="datetime-local" 
                        name="bid_date" 
                        min={getMinDate()} 
                        value={editFormData.bid_date} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Минимальная ставка в рублях</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="cur_bid" 
                        step="0.01" 
                        min="0" 
                        value={editFormData.cur_bid} 
                        onChange={handleEditInputChange} 
                        required 
                      />
                    </Form.Group>

                    <div className="d-flex gap-2">
                      <Button variant="primary" type="submit">
                        Сохранить изменения
                      </Button>
                      <Button variant="outline-secondary" onClick={handleEditCancel}>
                        Отмена
                      </Button>
                    </div>
                  </Form>
                </div>
              ) : (
                // Просмотр информации о товаре
                <>
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

                    {/* Блок кнопок действий */}
                    <div className="d-grid gap-2">
                      {isAuthenticated ? (
                        isOwner ? (
                          // Кнопки для владельца
                          <>
                            <Button 
                              variant="danger" 
                              size="lg" 
                              onClick={() => api.patch(`/products/${id}/close`).then(() => {
                                const updatedProduct = {...product, is_active: false};
                                setProduct(updatedProduct);
                              })}
                              disabled={!product.is_active}
                            >
                              {product.is_active ? 'Закрыть торги' : 'Торги закрыты'}
                            </Button>
                            <Button 
                              variant="warning" 
                              size="lg" 
                              onClick={handleEditClick}
                              disabled={!product.is_active}
                            >
                              Изменить информацию
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="lg" 
                              onClick={handleDeleteClick}
                            >
                              Удалить товар
                            </Button>
                          </>
                        ) : isWinner ? (
                          // Кнопка для победителя
                          <Button variant="success" size="lg" onClick={handlePayClick}>
                            Оплатить
                          </Button>
                        ) : product.is_active ? (
                          // Кнопки для активных торгов
                          isBidding ? (
                            // Форма ставки
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
                            // Кнопки для неактивных торгов
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
                          // Торги завершены
                          <Button variant="secondary" size="lg" disabled>
                            Торги завершены
                          </Button>
                        )
                      ) : (
                        // Неавторизованный пользователь
                        <Button variant="primary" size="lg" onClick={handleLoginRedirect}>
                          Войдите, чтобы сделать ставку
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Col>
        </Row>
      </Card>
    </Container>
  );
};

export default ProductInfo;