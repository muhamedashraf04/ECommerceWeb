import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader, ShoppingCart } from 'lucide-react';
import styles from './CartPage.module.css';
// 1. IMPORT YOUR AXIOS INSTANCE
import api from '../api/axiosConfig';

const CartPage = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==========================================
    //  API HANDLERS (UPDATED TO USE AXIOS)
    // ==========================================
    const cartApi = {
        // 1. GET CART + HYDRATE PRODUCT DETAILS
        fetchCart: async () => {
            // Note: We don't need to manually get 'token' here, 
            // because api/axiosConfig.js handles the interceptor automatically.

            try {
                // STEP A: Get the list of IDs from the Cart
                // Using api.get() instead of fetch() ensures we hit the Azure Backend
                const cartResponse = await api.get('/api/Cart/ShowCart');
                
                // Axios returns data in .data, not need for .json()
                const cartData = cartResponse.data; 
                
                // Handle different array structures
                const rawItems = Array.isArray(cartData) ? cartData : (cartData.cartItems || cartData.items || []);

                // STEP B: Fetch details for every product ID found
                const hydratedItems = await Promise.all(rawItems.map(async (item) => {
                    // Handle naming mismatch (productId vs productID vs id)
                    const id = item.productId || item.ProductId || item.id;
                    const qty = item.quantity || item.Quantity || 1;

                    try {
                        // Use api.get for the product details
                        const productRes = await api.get(`/api/Product/GetProductByID?productId=${id}`);
                        const productDetails = productRes.data;

                        // Image Logic (Matching HomePage logic)
                        let displayImage = "https://placehold.co/300x200?text=No+Image";
                        if (productDetails.images && productDetails.images.length > 0) {
                            displayImage = productDetails.images[0];
                        } else if (productDetails.imageUrl) {
                            displayImage = productDetails.imageUrl.split(',')[0].trim();
                        }

                        // MERGE: Combine Cart Qty with Product Name/Price
                        return {
                            id: id,
                            qty: qty,
                            name: productDetails.Name || productDetails.name || "Unknown Product",
                            price: productDetails.Price || productDetails.price || 0,
                            image: displayImage,
                            category: productDetails.Category || productDetails.category || "General"
                        };

                    } catch (err) {
                        console.error(`Failed to load product ${id}`, err);
                        return {
                            id: id,
                            qty: qty,
                            name: "Product Unavailable",
                            price: 0,
                            image: "",
                            category: "Error"
                        };
                    }
                }));

                return hydratedItems;
            } catch (err) {
                // Check for 404 (Cart empty/not found)
                if (err.response && err.response.status === 404) {
                    return [];
                }
                throw err;
            }
        },

        // 2. REMOVE ITEM
        removeItem: async (id) => {
            // using api.delete automatically adds the token
            await api.delete(`/api/Cart/remove/${id}`);
            return true;
        },

        // 3. CHECKOUT
        checkout: async (total) => {
            const response = await api.post('/api/Order/checkout', { 
                totalAmount: total 
            });
            return response.data;
        }
    };

    // ==========================================
    //  LOGIC
    // ==========================================

    useEffect(() => {
        const loadData = async () => {
            // We can still check token existence to avoid useless calls if user isn't logged in
            const token = localStorage.getItem('token');
            if (!token) { setIsLoading(false); return; }

            try {
                const data = await cartApi.fetchCart();
                setCartItems(data);
            } catch (err) {
                console.error(err);
                setError("Could not load cart items.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const handleQuantity = (id, delta) => {
        setCartItems(currentItems => 
            currentItems.map(item => {
                if (item.id === id) {
                    const newQty = Math.max(1, item.qty + delta);
                    return { ...item, qty: newQty };
                }
                return item;
            })
        );
    };

    const handleRemove = async (id) => {
        const originalItems = [...cartItems];
        setCartItems(items => items.filter(item => item.id !== id));
        try {
            await cartApi.removeItem(id);
        } catch (err) {
            console.error(err);
            setCartItems(originalItems);
            alert("Failed to delete item.");
        }
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        navigate('/checkout');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Helper removed: We now handle image logic inside fetchCart 
    // to match the robust logic in HomePage

    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
    const shippingCost = subtotal > 5000 ? 0 : 50; 
    const taxRate = 0.14; 
    const taxAmount = subtotal * taxRate;
    const finalTotal = subtotal + shippingCost + taxAmount;

    // ==========================================
    //  RENDER UI
    // ==========================================

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div style={{color: 'white', textAlign: 'center', marginTop: '5rem'}}>
                    <Loader className="animate-spin" size={48} />
                    <p style={{marginTop: '1rem'}}>Loading your bag...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className={styles.container} style={{color: '#ff6b6b', textAlign: 'center', padding:'2rem'}}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.cartCard}>
                
                {/* ITEMS SECTION */}
                <div className={styles.itemsSection}>
                    <div className={styles.header}>
                        <h2>Shopping Bag</h2>
                        <span className={styles.itemCount}>{cartItems.length} Items</span>
                    </div>

                    {cartItems.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                            <ShoppingCart size={48} style={{opacity: 0.2, marginBottom: '1rem'}}/>
                            <p>Your cart is empty.</p>
                            <button onClick={() => navigate('/')} style={{marginTop: '1rem', color: 'var(--primary-teal)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>
                                ← Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cartItems.map((item) => (
                            <div key={item.id} className={styles.cartItem}>
                                <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className={styles.itemImage} 
                                    onError={(e) => e.target.src = "https://placehold.co/150x150?text=No+Image"}
                                />
                                <div className={styles.itemDetails}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemCategory}>{item.category}</p>
                                </div>
                                
                                <div className={styles.quantityControls}>
                                    <button className={styles.qtyBtn} onClick={() => handleQuantity(item.id, -1)}>-</button>
                                    <span>{item.qty}</span>
                                    <button className={styles.qtyBtn} onClick={() => handleQuantity(item.id, 1)}>+</button>
                                </div>

                                <div className={styles.price}>
                                    {formatCurrency(item.price * item.qty)}
                                </div>

                                <button className={styles.removeBtn} onClick={() => handleRemove(item.id)}>
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* SUMMARY SECTION */}
                {cartItems.length > 0 && (
                    <div className={styles.summarySection}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>{shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax Estimate (14%)</span>
                            <span>{formatCurrency(taxAmount)}</span>
                        </div>
                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>{formatCurrency(finalTotal)}</span>
                        </div>
                        <button className={styles.checkoutBtn} onClick={handleCheckout}>
                            Checkout ({formatCurrency(finalTotal)})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;