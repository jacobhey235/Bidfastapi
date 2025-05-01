import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api';
import '../App.css'

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();

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

    const fetchProducts = async () => {
        const response = await api.get('/products/');
        setProducts(response.data);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    return (
        <div className="container mt-4">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                {products.map((product) => (
                    <div key={product.id} className="col">
                        <div 
                            className="card h-100 shadow-sm hover-shadow"
                            onClick={() => handleProductClick(product.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Заглушка для изображения */}
                            <div className="card-img-top bg-light d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                                <span className="text-muted">Изображение товара</span>
                            </div>
                            
                            <div className="card-body">
                                <h5 className="card-title">{product.title}</h5>
                                <span className="badge bg-secondary mb-2">{product.category}</span>
                                <p className="card-text text-truncate">{product.description}</p>
                            </div>
                            
                            <div className="card-footer bg-white">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <small className="text-muted">Текущая ставка:</small>
                                    <strong className="text-danger">{product.cur_bid} руб.</strong>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <small className="text-muted">Окончание:</small>
                                    <small>{formatToCustomDate(product.bid_date)}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;