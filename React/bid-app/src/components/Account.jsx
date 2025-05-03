import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab, Tabs, Card, Spinner, Button, Container, Badge } from 'react-bootstrap';
import api from '../api';
import AddProduct from './AddProduct';

const Account = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [wonProducts, setWonProducts] = useState([]);
  const [loading, setLoading] = useState({ 
    favorites: true, 
    products: true,
    won: true
  });
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [favs, products, won] = await Promise.all([
          api.get('/users/me/favorites'),
          api.get('/users/me/products'),
          api.get('/users/me/won')
        ]);
        
        setFavorites(favs.data);
        setMyProducts(products.data);
        setWonProducts(won.data);
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoading({ favorites: false, products: false, won: false });
      }
    };

    fetchData();
  }, []);

  const handleCloseAuction = async (productId) => {
    try {
      await api.patch(`/products/${productId}/close`);
      const [favs, products, won] = await Promise.all([
        api.get('/users/me/favorites'),
        api.get('/users/me/products'),
        api.get('/users/me/won')
      ]);
      setFavorites(favs.data);
      setMyProducts(products.data);
      setWonProducts(won.data);
    } catch (err) {
      console.error('Error closing auction:', err);
    }
  };

  const handleAddProductSuccess = () => {
    setShowAddProduct(false);
    api.get('/users/me/products').then(response => {
      setMyProducts(response.data);
    });
  };

  const ProductCard = ({ product, isOwner, isWon, onCloseAuction }) => {
    const navigate = useNavigate();

    const getFirstImage = (images) => {
      if (!images) return null;
      
      if (typeof images === 'string') {
        try {
          images = JSON.parse(images);
        } catch {
          return null;
        }
      }
      
      return Array.isArray(images) && images.length > 0 ? images[0] : null;
    };

    const firstImage = getFirstImage(product.images);

    return (
      <div className="col">
        <Card 
          className="h-100 shadow-sm hover-shadow"
          onClick={() => navigate(`/products/${product.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {firstImage ? (
            <img
              className="card-img-top"
              src={`data:image/jpeg;base64,${firstImage}`}
              alt={product.title}
              style={{ height: '200px', objectFit: 'cover' }}
            />
          ) : (
            <div className="card-img-top bg-light d-flex align-items-center justify-content-center" 
                 style={{ height: '200px' }}>
              <span className="text-muted">Нет изображения</span>
            </div>
          )}
          
          <Card.Body>
            <h5 className="card-title">{product.title}</h5>
            <Badge bg="secondary" className="mb-2">{product.category}</Badge>
            <p className="card-text text-truncate">{product.description}</p>
          </Card.Body>
          
          <div className="card-footer bg-white">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="text-muted">Текущая ставка:</small>
              <strong className="text-danger">{product.cur_bid.toFixed(2)} руб.</strong>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">Статус:</small>
              <Badge bg={product.is_active ? 'success' : 'secondary'}>
                {product.is_active ? 'Активно' : 'Завершено'}
              </Badge>
              {isWon && <Badge bg="warning" className="ms-2">Выиграно</Badge>}
            </div>
            {isOwner && product.is_active && (
              <Button 
                variant="outline-danger" 
                size="sm" 
                className="mt-2 w-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseAuction();
                }}
              >
                Закрыть торги
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Мой профиль</h2>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="favorites" title="Избранное">
          {loading.favorites ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Загрузка избранного...</p>
            </div>
          ) : favorites.length === 0 ? (
            <Card>
              <Card.Body className="text-center text-muted">
                Нет избранных товаров
              </Card.Body>
            </Card>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {favorites.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Tab>
        
        <Tab eventKey="products" title="Мои товары">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Мои лоты</h5>
            <Button 
              variant="success" 
              onClick={() => setShowAddProduct(true)}
            >
              Добавить товар
            </Button>
          </div>
          
          {showAddProduct && (
            <AddProduct 
              onSuccess={handleAddProductSuccess}
              onCancel={() => setShowAddProduct(false)}
            />
          )}

          {loading.products ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Загрузка ваших товаров...</p>
            </div>
          ) : myProducts.length === 0 ? (
            <Card>
              <Card.Body className="text-center text-muted">
                Вы еще не добавляли товары
              </Card.Body>
            </Card>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {myProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isOwner={true}
                  onCloseAuction={() => handleCloseAuction(product.id)}
                />
              ))}
            </div>
          )}
        </Tab>
        
        <Tab eventKey="won" title="Мои выигрыши">
          {loading.won ? (
            <div className="text-center">
              <Spinner animation="border" variant="primary" />
              <p>Загрузка выигранных товаров...</p>
            </div>
          ) : wonProducts.length === 0 ? (
            <Card>
              <Card.Body className="text-center text-muted">
                У вас нет выигранных товаров
              </Card.Body>
            </Card>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
              {wonProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  isWon={true}
                />
              ))}
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Account;