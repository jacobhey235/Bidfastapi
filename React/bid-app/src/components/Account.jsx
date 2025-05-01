import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Tab, Tabs, Card, Button } from 'react-bootstrap';

const Account = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Мой профиль</h2>
      
      <Tabs defaultActiveKey="favorites" className="mb-4">
        <Tab eventKey="favorites" title="Избранное">
          <Card>
            <Card.Body>
              <Card.Text>Здесь будут отображаться избранные товары</Card.Text>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="bids" title="Мои ставки">
          <Card>
            <Card.Body>
              <Card.Text>Здесь будут товары, на которые вы делали ставки</Card.Text>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="my-products" title="Мои товары">
          <Card>
            <Card.Body>
              <Card.Text>Здесь будут товары, которые вы добавили</Card.Text>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Account;