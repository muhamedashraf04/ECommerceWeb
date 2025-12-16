import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader } from 'lucide-react';
import styles from './CartPage.module.css';

const CartPage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [cartItems, setCartItems] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==========================================
    //  PHASE 4: API HANDLERS
    // ==========================================

    // --- OPTION A: FAKE BACKEND (CURRENTLY ACTIVE) ---
    // Simulates database delay and response
    const api = {
        fetchCart: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([
                        { 
                            id: 1, 
                            name: "Nile Smart Watch", 
                            category: "Electronics - Black", 
                            price: 2500, 
                            qty: 1, 
                            image: "https://via.placeholder.com/100" 
                        },
                        { 
                            id: 2, 
                            name: "Wireless Earbuds", 
                            category: "Audio - White", 
                            price: 850, 
                            qty: 2, 
                            image: "https://via.placeholder.com/100" 
                        }
                    ]);
                }, 1500); // 1.5s delay to show loading spinner
            });
        },
        removeItem: (id) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, message: "Item removed" });
                }, 500);
            });
        },
        checkout: (total) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, orderId: "ORD-998877" });
                }, 2000);
            });
        }
    };

    /* // --- OPTION B: REAL BACKEND (USE THIS WHEN API IS READY) ---
    const api = {
        fetchCart: async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to fetch cart");
            const data = await response.json();
            return data.items;
        },
        removeItem: async (id) => {
             const token = localStorage.getItem('token');
             await fetch(`http://localhost:5000/api/cart/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
             });
        },
        checkout: async (total) => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ total })
            });
            return await response.json();
        }
    };
    */

    // ==========================================
    //  LOGIC & EVENT HANDLERS
    // ==========================================

    // 1. Load Cart on Mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.fetchCart();
                setCartItems(data);
            } catch (err) {
                setError("Could not load your cart.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // 2. Handle Quantity (Client-side logic mostly)
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

    // 3. Handle Remove
    const handleRemove = async (id) => {
        // Optimistic update (remove from UI first)
        const originalItems = [...cartItems];
        setCartItems(items => items.filter(item => item.id !== id));

        try {
            await api.removeItem(id);
        } catch (err) {
            // Revert if server fails
            setCartItems(originalItems);
            alert("Failed to remove item");
        }
    };

    // 4. Handle Checkout
    const handleCheckout = () => {
        if (cartItems.length === 0) return;
        
        // Navigate to the checkout page
        navigate('/checkout');
    };

    // --- CALCULATIONS ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(amount);
    };

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
                <div style={{color: 'white', textAlign: 'center'}}>
                    <Loader className="animate-spin" size={48} />
                    <p style={{marginTop: '1rem'}}>Loading your bag...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.cartCard} style={{justifyContent:'center', color: 'red'}}>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.cartCard}>
                
                {/* LEFT: Items List */}
                <div className={styles.itemsSection}>
                    <div className={styles.header}>
                        <h2>Shopping Bag</h2>
                        <span className={styles.itemCount}>{cartItems.length} Items</span>
                    </div>

                    {cartItems.length === 0 ? (
                        <div style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                            <p>Your cart is empty.</p>
                            <button 
                                onClick={() => navigate('/')}
                                style={{marginTop: '1rem', color: 'var(--primary-teal)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}
                            >
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
                                />
                                <div className={styles.itemDetails}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.itemCategory}>{item.category}</p>
                                </div>
                                
                                <div className={styles.quantityControls}>
                                    <button 
                                        className={styles.qtyBtn}
                                        onClick={() => handleQuantity(item.id, -1)}
                                    >-</button>
                                    
                                    <span>{item.qty}</span>
                                    
                                    <button 
                                        className={styles.qtyBtn}
                                        onClick={() => handleQuantity(item.id, 1)}
                                    >+</button>
                                </div>

                                <div className={styles.price}>
                                    {formatCurrency(item.price * item.qty)}
                                </div>

                                <button 
                                    className={styles.removeBtn}
                                    onClick={() => handleRemove(item.id)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* RIGHT: Order Summary */}
                {cartItems.length > 0 && (
                    <div className={styles.summarySection}>
                        <h2 className={styles.summaryTitle}>Order Summary</h2>
                        
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>
                                {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                            </span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax Estimate (14%)</span>
                            <span>{formatCurrency(taxAmount)}</span>
                        </div>

                        <div className={styles.totalRow}>
                            <span>Total</span>
                            <span>{formatCurrency(finalTotal)}</span>
                        </div>

                        <button 
                            className={styles.checkoutBtn}
                            onClick={handleCheckout}
                        >
                            Checkout ({formatCurrency(finalTotal)})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;