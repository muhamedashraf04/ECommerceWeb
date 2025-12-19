import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Loader, ShoppingCart } from 'lucide-react';
import styles from './CartPage.module.css';

const CartPage = () => {
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // ==========================================
    //  API HANDLERS
    // ==========================================
    const api = {
        // 1. GET CART + HYDRATE PRODUCT DETAILS
        fetchCart: async () => {
            const token = localStorage.getItem('token');
            if (!token) return [];

            // STEP A: Get the list of IDs from the Cart
            // URL from CartController
            const cartResponse = await fetch('/api/Cart/ShowCart', {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!cartResponse.ok) {
                if (cartResponse.status === 404) return [];
                throw new Error("Failed to fetch cart");
            }

            const cartData = await cartResponse.json();
            
            // Handle different array structures
            const rawItems = Array.isArray(cartData) ? cartData : (cartData.cartItems || cartData.items || []);

            // STEP B: Fetch details for every product ID found
            const hydratedItems = await Promise.all(rawItems.map(async (item) => {
                // Handle naming mismatch (productId vs productID vs id)
                const id = item.productId || item.ProductId || item.id;
                const qty = item.quantity || item.Quantity || 1;

                try {
                    // --- CRITICAL FIX HERE ---
                    // OLD URL: /api/Product/${id}  <-- This was wrong
                    // NEW URL: /api/Product/GetProductByID?productId=${id} <-- Matches your Controller
                    const productRes = await fetch(`/api/Product/GetProductByID?productId=${id}`);
                    
                    if (!productRes.ok) throw new Error("Product fetch failed");
                    
                    const productDetails = await productRes.json();

                    // MERGE: Combine Cart Qty with Product Name/Price
                    return {
                        id: id,
                        qty: qty,
                        // Backend usually sends PascalCase (Name, Price)
                        name: productDetails.Name || productDetails.name || "Unknown Product",
                        price: productDetails.Price || productDetails.price || 0,
                        image: productDetails.ImageUrl || productDetails.imageUrl || productDetails.image || "",
                        category: productDetails.Category || productDetails.category || "General"
                    };

                } catch (err) {
                    console.error(`Failed to load product ${id}`, err);
                    // Fallback so the cart doesn't crash completely
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
        },

        // 2. REMOVE ITEM
        removeItem: async (id) => {
            const token = localStorage.getItem('token');
            // URL from CartController
            const response = await fetch(`/api/Cart/remove/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to remove item");
            return true;
        },

        // 3. CHECKOUT
        checkout: async (total) => {
            const token = localStorage.getItem('token');
            // Assuming you have an OrderController
            const response = await fetch('/api/Order/checkout', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ totalAmount: total })
            });

            if (!response.ok) throw new Error("Checkout failed");
            return await response.json();
        }
    };

    // ==========================================
    //  LOGIC (No changes needed here)
    // ==========================================

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('token');
            if (!token) { setIsLoading(false); return; }

            try {
                const data = await api.fetchCart();
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
            await api.removeItem(id);
        } catch (err) {
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

    const getImageUrl = (img) => {
        if (!img) return "https://via.placeholder.com/150";
        if (img.startsWith('http')) return img;
        return `http://localhost:5193/${img}`; 
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
                                    src={getImageUrl(item.image)} 
                                    alt={item.name} 
                                    className={styles.itemImage} 
                                    onError={(e) => e.target.src = "https://via.placeholder.com/150"}
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