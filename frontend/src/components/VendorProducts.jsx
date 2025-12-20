import { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Renamed for consistency
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
            // Optional: You could rely on the backend to know the vendor from the Token
            // But if your API requires the ID in the URL, this check is good.
            console.warn("No vendor ID found.");
            setLoading(false);
            return;
        }
        try {
            const response = await api.get(`/api/Product/GetProductByVendor?vendorId=${vendorId}`);
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/Category');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`/api/Product/delete?id=${id}`);
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
        
        // Append Images
        if (newProduct.images && newProduct.images.length > 0) {
            for (let i = 0; i < newProduct.images.length; i++) {
                formData.append('Images', newProduct.images[i]);
            }
        }

        try {
            // CRITICAL FIX: Do NOT set "Content-Type": "multipart/form-data" manually!
            // Axios detects FormData and sets the correct boundary automatically.
            await api.post('/api/Product/create', formData);
            
            alert("Product added successfully");
            setIsAdding(false);
            fetchProducts();
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Failed to add product. Ensure all fields are valid.");
        }
    };

   const handleEditSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('Id', editingProduct.id);
        formData.append('Name', editingProduct.name);
        formData.append('Description', editingProduct.description);
        formData.append('Price', editingProduct.price);
        formData.append('CategoryId', editingProduct.categoryId);
        formData.append('Quantity', editingProduct.quantity);

        // Only append new images if the user selected them
        if (editingProduct.images && editingProduct.images instanceof FileList) {
            for (let i = 0; i < editingProduct.images.length; i++) {
                formData.append('Images', editingProduct.images[i]);
            }
        }

        try {
            // CRITICAL FIX: Let Axios handle the Content-Type boundary
            await api.put('/api/Product/edit', formData);
            
            // Re-fetch to get the updated image URLs from server
            fetchProducts(); 
            setEditingProduct(null);
            alert("Product updated successfully");
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product.");
        }
    };

    if (loading) return <div style={{padding:'2rem', textAlign:'center'}}>Loading products...</div>;

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                <h2 className={styles.header} style={{marginBottom: 0}}>My Products</h2>
                <button onClick={handleAddClick} className={`${styles.btn} ${styles.btnAccept}`}>
                    Add Product
                </button>
            </div>
            
            {/* ADD FORM */}
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

            {/* EDIT FORM */}
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
                            <label className={styles.label}>New Images (Optional)</label>
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

            {/* PRODUCT GRID */}
            <div className={styles.grid}>
                {products.length === 0 && !loading && <p>No products found.</p>}
                {products.map(product => (
                    <div key={product.id} className={styles.card}>
                        <h3 className={styles.cardTitle}>{product.name}</h3>
                        <p className={styles.cardText} style={{minHeight:'40px'}}>{product.description?.substring(0, 50)}...</p>
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