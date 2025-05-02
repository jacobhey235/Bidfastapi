import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Card, Container, Alert, Nav, Tab, Tabs } from 'react-bootstrap';
import api from '../api';

const Login = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({ login: '', register: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setErrors({ login: '', register: '' });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({...errors, login: ''});
    
    try {
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('username', formData.username);
      formDataEncoded.append('password', formData.password);
      
      const response = await api.post('/auth/token', formDataEncoded, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        __isRetry: true
      });
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user_id', response.data.user_id);  // Сохраняем ID
      localStorage.setItem('username', response.data.username);
      
      onLogin(response.data.username, response.data.user_id);  // Обновляем onLogin
      
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({
        ...errors,
        login: err.response?.data?.detail || 'Неверное имя пользователя или пароль'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({...errors, register: ''});
    
    try {
      await api.post('/auth/register', {
        username: formData.username,
        password: formData.password
      });
      
      // Автоматический вход после регистрации
      const formDataEncoded = new URLSearchParams();
      formDataEncoded.append('username', formData.username);
      formDataEncoded.append('password', formData.password);
      
      const loginResponse = await api.post('/auth/token', formDataEncoded, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        __isRetry: true
      });
      
      localStorage.setItem('token', loginResponse.data.access_token);
      onLogin();
      
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({
        ...errors,
        register: err.response?.data?.detail || 'Ошибка регистрации. Пользователь может уже существовать.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '500px' }}>
      <Card className="shadow">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => {
              setActiveTab(k);
              setErrors({ login: '', register: '' });
            }}
            className="mb-3"
          >
            <Tab eventKey="login" title="Вход">
              <Form onSubmit={handleLogin}>
                {errors.login && <Alert variant="danger" dismissible onClose={() => setErrors({...errors, login: ''})}>
                  {errors.login}
                </Alert>}
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    isInvalid={!!errors.login}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    isInvalid={!!errors.login}
                  />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </Form>
            </Tab>
            <Tab eventKey="register" title="Регистрация">
              <Form onSubmit={handleRegister}>
                {errors.register && <Alert variant="danger" dismissible onClose={() => setErrors({...errors, register: ''})}>
                  {errors.register}
                </Alert>}
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    isInvalid={!!errors.register}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    isInvalid={!!errors.register}
                  />
                </Form.Group>
                <Button variant="success" type="submit" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </Button>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;