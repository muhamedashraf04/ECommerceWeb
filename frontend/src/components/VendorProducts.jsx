import { useState, useEffect } from 'react';
import { apiClient } from '../lib/axios';
import { getVendorId } from '../lib/auth';
import styles from './Vendor.module.css';

export default function VendorProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
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
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.put('/api/Product/edit', editingProduct);
            setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
            setEditingProduct(null);
            alert("Product updated successfully");
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product");
        }
    };

    if (loading) return <div>Loading products...</div>;

    return (
        <div>
            <h2 className={styles.header}>My Products</h2>
            
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
