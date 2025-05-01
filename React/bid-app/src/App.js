import React, { useState, useEffect } from "react";
import api from './api';
import ProductList from "./components/ProductList";
import ProductInfo from "./components/ProductInfo";
import Login from "./components/Login";
import Account from "./components/Account";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';

const AppContent = () => {
  const [products, setProducts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Здесь можно добавить запрос для получения имени пользователя
      // Пока используем заглушку
      setUsername('Пользователь');
    }
  };

  const handleAccountClick = () => {
    if (location.pathname !== '/account') {
      navigate('/account');
    }
  };

  const handleLogout = () => {
    if (location.pathname === '/account') {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUsername('');
      navigate('/login');
    }
  };

  const handleLoginClick = () => {
    navigate('/login', { state: { from: location.pathname } });
  };

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">Auction App</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              {isAuthenticated ? (
                location.pathname === '/account' ? (
                  <Button variant="outline-light" onClick={handleLogout}>
                    Выйти
                  </Button>
                ) : (
                  <Button variant="outline-light" onClick={handleAccountClick}>
                    {username}
                  </Button>
                )
              ) : (
                <Nav.Link onClick={() => navigate('/login', { state: { from: location.pathname } })} className="text-light">
                  Войти / Регистрация
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className='container'>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductInfo />} />
          <Route path="/login" element={<Login onLogin={(username) => {
            setIsAuthenticated(true);
            setUsername(username);
          }} />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;