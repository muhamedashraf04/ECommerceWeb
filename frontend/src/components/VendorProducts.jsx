import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { getVendorId } from '../lib/auth';
import styles from './Vendor.module.css';

export default function VendorProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // New state for adding products
    const [isAdding, setIsAdding] = useState(false);
    const [categories, setCategories] = useState([]);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        categoryId: '',
        images: []
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        const vendorId = getVendorId();
        if (!vendorId) {
            alert("Vendor ID not found. Please login.");
            setLoading(false);
            return;
        }
        try {
            const response = await apiClient.get(`/api/Product/GetProductByVendor?vendorId=${vendorId}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/api/Category');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await apiClient.delete(`/api/Product/delete?id=${id}`);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product");
        }
    };

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        setIsAdding(false);
    };

    const handleAddClick = () => {
        setIsAdding(true);
        setEditingProduct(null);
        setNewProduct({
            name: '',
            description: '',
            price: '',
            quantity: '',
            categoryId: categories.length > 0 ? categories[0].id : '',
            images: []
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('Name', newProduct.name);
        formData.append('Description', newProduct.description);
        formData.append('Price', newProduct.price);
        formData.append('CategoryId', newProduct.categoryId);
        formData.append('Quantity', newProduct.quantity);
        
        if (newProduct.images) {
            for (let i = 0; i < newProduct.images.length; i++) {
                formData.append('Images', newProduct.images[i]);
            }
        }

        try {
            await apiClient.post('/api/Product/create', formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Product added successfully");
            setIsAdding(false);
            fetchProducts();
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product");
        }
    };

   const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Create FormData instead of a plain object
    const formData = new FormData();
    formData.append('Id', editingProduct.id);
    formData.append('Name', editingProduct.name);
    formData.append('Description', editingProduct.description);
    formData.append('Price', editingProduct.price);
    formData.append('CategoryId', editingProduct.categoryId);
    formData.append('Quantity', editingProduct.quantity);

    if (editingProduct.images) {
        for (let i = 0; i < editingProduct.images.length; i++) {
            formData.append('Images', editingProduct.images[i]);
        }
    }

    try {
        // multipart/form-data is required for IFormFile/Images
        await apiClient.put('/api/Product/edit', formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        
        setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
        setEditingProduct(null);
        alert("Product updated successfully");
    } catch (error) {
        console.error("Error updating product:", error);
        alert("Failed to update product. Check if the CategoryId is valid.");
    }
};

    if (loading) return <div>Loading products...</div>;

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h2 className={styles.header} style={{marginBottom: 0}}>My Products</h2>
                <button onClick={handleAddClick} className={`${styles.btn} ${styles.btnAccept}`}>
                    Add Product
                </button>
            </div>
            
            {isAdding && (
                <div className={styles.formContainer}>
                    <h3 className={styles.cardTitle}>Add New Product</h3>
                    <form onSubmit={handleAddSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input 
                                type="text" 
                                value={newProduct.name} 
                                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description</label>
                            <textarea 
                                value={newProduct.description} 
                                onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                                className={styles.textarea}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Price</label>
                            <input 
                                type="number" 
                                value={newProduct.price} 
                                onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Quantity</label>
                            <input 
                                type="number" 
                                value={newProduct.quantity} 
                                onChange={e => setNewProduct({...newProduct, quantity: e.target.value})}
                                className={styles.input}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Category</label>
                            <select 
                                value={newProduct.categoryId} 
                                onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}
                                className={styles.input}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Images</label>
                            <input 
                                type="file" 
                                multiple
                                onChange={e => setNewProduct({...newProduct, images: e.target.files})}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.actions}>
                            <button type="submit" className={`${styles.btn} ${styles.btnAccept}`}>Add</button>
                            <button type="button" onClick={() => setIsAdding(false)} className={`${styles.btn} ${styles.btnCancel}`} style={{backgroundColor: '#9ca3af'}}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {editingProduct && (
                <div className={styles.formContainer}>
                    <h3 className={styles.cardTitle}>Edit Product</h3>
                    <form onSubmit={handleEditSubmit}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name</label>
                            <input 
                                type="text" 
                                value={editingProduct.name} 
                                onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Description</label>
                            <textarea 
                                value={editingProduct.description} 
                                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                                className={styles.textarea}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Price</label>
                            <input 
                                type="number" 
                                value={editingProduct.price} 
                                onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Quantity</label>
                            <input 
                                type="number" 
                                value={editingProduct.quantity} 
                                onChange={e => setEditingProduct({...editingProduct, quantity: parseInt(e.target.value)})}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Images</label>
                            <input 
                                type="file" 
                                multiple
                                onChange={e => setEditingProduct({...editingProduct, images: e.target.files})}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.actions}>
                            <button type="submit" className={`${styles.btn} ${styles.btnAccept}`}>Save</button>
                            <button type="button" onClick={() => setEditingProduct(null)} className={`${styles.btn} ${styles.btnCancel}`} style={{backgroundColor: '#9ca3af'}}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className={styles.grid}>
                {products.map(product => (
                    <div key={product.id} className={styles.card}>
                        <h3 className={styles.cardTitle}>{product.name}</h3>
                        <p className={styles.cardText}>{product.description}</p>
                        <p className={styles.price}>${product.price}</p>
                        <p className={styles.cardText}>Qty: {product.quantity}</p>
                        <div className={styles.actions}>
                            <button 
                                onClick={() => handleEditClick(product)}
                                className={`${styles.btn} ${styles.btnEdit}`}
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDelete(product.id)}
                                className={`${styles.btn} ${styles.btnDelete}`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

