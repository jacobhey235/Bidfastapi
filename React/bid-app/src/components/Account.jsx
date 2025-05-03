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
          api.get('/users/me/won')  // Используем новый эндпоинт
        ]);
        
        setFavorites(favs.data);
        setMyProducts(products.data);
        setWonProducts(won.data);  // Устанавливаем выигранные товары
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
      // После закрытия торгов обновляем все списки
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

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Мой профиль</h2>

      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
        <Tab eventKey="favorites" title="Избранное">
          {loading.favorites ? (
            <Spinner animation="border" />
          ) : favorites.length === 0 ? (
            <Card>
              <Card.Body>Нет избранных товаров</Card.Body>
            </Card>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {favorites.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Tab>
        
        <Tab eventKey="products" title="Мои товары">
          <Button 
            variant="success" 
            className="mb-3"
            onClick={() => setShowAddProduct(true)}
          >
            Добавить товар
          </Button>
          
          {showAddProduct && (
            <AddProduct 
              onSuccess={handleAddProductSuccess}
              onCancel={() => setShowAddProduct(false)}
            />
          )}

          {loading.products ? (
            <Spinner animation="border" />
          ) : myProducts.length === 0 ? (
            <Card>
              <Card.Body>Вы еще не добавляли товары</Card.Body>
            </Card>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
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
            <Spinner animation="border" />
          ) : wonProducts.length === 0 ? (
            <Card>
              <Card.Body>У вас нет выигранных товаров</Card.Body>
            </Card>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
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

const ProductCard = ({ product, isOwner, isWon, onCloseAuction }) => {
  const navigate = useNavigate();

  return (
    <div className="col">
      <Card 
        className="h-100 cursor-pointer"
        onClick={() => navigate(`/products/${product.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <Card.Img variant="top" src="https://via.placeholder.com/300x200" />
        <Card.Body>
          <Card.Title>{product.title}</Card.Title>
          <Card.Text className="text-truncate">{product.description}</Card.Text>
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-primary">{product.category}</span>
            <span className="text-muted">{product.cur_bid.toFixed(2)} руб.</span>
          </div>
          <div className="mt-2">
            <Badge bg={product.is_active ? 'success' : 'secondary'}>
              {product.is_active ? 'Активные торги' : 'Торги закрыты'}
            </Badge>
            {isWon && <Badge bg="warning" className="ms-2">Вы выиграли</Badge>}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Account;