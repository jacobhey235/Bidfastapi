import React, { useState, useEffect } from "react"
import api from '../api'

const AddProduct = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        bid_date: '',
        cur_bid: 0.0
    });

    const fetchProducts = async () => {
        const response = await api.get('/products/');
        setProducts(response.data);
    }

    useEffect(() => {
        fetchProducts();
    }, [])
    const handleInputChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        await api.post('/products/', formData);
        fetchProducts();
        setFormData({
            title: '',
            category: '',
            description: '',
            bid_date: '',
            cur_bid: 0.0
        });
    };

    const getMinDate = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 2);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow.toISOString().slice(0, 16);
      };

    return (
        <div>
            <form onSubmit={handleFormSubmit}>
                <div className='mb-3 mt-3'>
                    <label htmlFor='title' className='form-label'>
                        Название товара
                    </label>
                    <input type='text' className='form-control' id='title' name='title' onChange={handleInputChange} value={formData.title} />
                </div>

                <div className='mb-3'>
                    <label htmlFor='category' className='form-label'>
                        Категория
                    </label>
                    <input type='text' className='form-control' id='category' name='category' onChange={handleInputChange} value={formData.category} />
                </div>

                <div className='mb-3'>
                    <label htmlFor='description' className='form-label'>
                        Описание
                    </label>
                    <input type='text' className='form-control' id='description' name='description' onChange={handleInputChange} value={formData.description} />
                </div>

                <div className='mb-3'>
                    <label htmlFor='bid_date' className='form-label'>
                        Дата и время окончания торгов
                    </label>
                    <input type='datetime-local' className='form-control' id='bid_date' name='bid_date' min={getMinDate()} onChange={handleInputChange} value={formData.bid_date} />
                </div>

                <div className='mb-3'>
                    <label htmlFor='cur_bid' className='form-label'>
                        Минимальная ставка в рублях
                    </label>
                    <input type='number' className='form-control' id='cur_bid' name='cur_bid' step='any' onChange={handleInputChange} value={formData.cur_bid} />
                </div>

                <button type='submit' className='btn btn-primary'>
                    Submit
                </button>

            </form>
        </div>
    )
}

export default AddProduct;