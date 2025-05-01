import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab, Tabs, Card, Spinner, Button, Container } from 'react-bootstrap';
import api from '../api';

const Account = () => {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState({ favorites: true, products: true });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const favs = await api.get('/users/me/favorites');
        setFavorites(favs.data);

        const products = await api.get('/users/me/products');
        setMyProducts(products.data);
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoading({ favorites: false, products: false });
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
          {loading.products ? (
            <Spinner animation="border" />
          ) : myProducts.length === 0 ? (
            <Card>
              <Card.Body>Вы еще не добавляли товары</Card.Body>
            </Card>
          ) : (
            <div className="row row-cols-1 row-cols-md-3 g-4">
              {myProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

const ProductCard = ({ product }) => {
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
            <span className="text-muted">{product.cur_bid} руб.</span>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Account;