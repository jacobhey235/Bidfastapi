import React, { useState } from "react";
import { Button, Form, Alert } from 'react-bootstrap';
import api from '../api';

const AddProduct = ({ onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        bid_date: '',
        cur_bid: 0.0
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    const handleInputChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('bid_date', formData.bid_date);
            formDataToSend.append('cur_bid', formData.cur_bid);
            
            files.forEach(file => {
                formDataToSend.append('files', file);
            });

            await api.post('/products/', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.detail || 'Ошибка при добавлении товара');
        }
    };

    const getMinDate = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return tomorrow.toISOString().slice(0, 16);
    };

    return (
        <div className="border p-4 rounded mb-4">
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Название товара</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Категория</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="category" 
                        value={formData.category} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Описание</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="description" 
                        value={formData.description} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Изображения товара (макс. 2MB)</Form.Label>
                    <Form.Control 
                        type="file" 
                        multiple 
                        accept="image/jpeg, image/png"
                        onChange={handleFileChange}
                        required
                    />
                    <Form.Text muted>Первое изображение будет основным</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Дата и время окончания торгов</Form.Label>
                    <Form.Control 
                        type="datetime-local" 
                        name="bid_date" 
                        min={getMinDate()} 
                        value={formData.bid_date} 
                        onChange={handleInputChange} 
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
                        value={formData.cur_bid} 
                        onChange={handleInputChange} 
                        required 
                    />
                </Form.Group>

                <div className="d-flex justify-content-end gap-2">
                    <Button variant="secondary" onClick={onCancel}>
                        Отмена
                    </Button>
                    <Button variant="primary" type="submit">
                        Добавить товар
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default AddProduct;