import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Truck, CheckCircle, Loader } from 'lucide-react';
import styles from './PlaceOrderPage.module.css';

const PlaceOrderPage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [cartItems, setCartItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [step, setStep] = useState(1); 
    
    const [shippingInfo, setShippingInfo] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [cardInfo, setCardInfo] = useState({
        cardHolder: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });
    const api = {
        fetchCartSummary: async () => {
            const token = localStorage.getItem('token');
            if (!token) return [];
            try {
                const response = await fetch('/api/Cart/ShowCart', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) return [];
                const data = await response.json();
                const rawItems = Array.isArray(data) ? data : (data.cartItems || data.items || []);
                const hydratedItems = await Promise.all(rawItems.map(async (item) => {
                    const id = item.productId || item.ProductId || item.id;
                    const qty = item.quantity || item.Quantity || 1;
                    
                    try {
                        const productRes = await fetch(`/api/Product/GetProductByID?productId=${id}`);
                        
                        if (!productRes.ok) throw new Error("Failed");

                        const productDetails = await productRes.json();
                        
                        return {
                            id: id,
                            qty: qty,
                            name: productDetails.Name || productDetails.name || "Unknown Product",
                            price: productDetails.Price || productDetails.price || 0,
                            image: productDetails.ImageUrl || productDetails.imageUrl || productDetails.image || ""
                        };

                    } catch (e) {
                        console.error(`Failed to load product ${id}`, e);
                        return { 
                            id, 
                            qty, 
                            name: "Product Unavailable", 
                            price: 0, 
                            image: "" 
                        };
                    }
                }));

                return hydratedItems;

            } catch (err) {
                console.error(err);
                return [];
            }
        },

        // 2. PLACE ORDER
        placeOrder: async (fullAddress) => {
            const token = localStorage.getItem('token');
            
            const response = await fetch('/api/Order/PlaceOrder', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    address: fullAddress 
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to place order");
            }
            
            return true; 
        }
    };

    // --- LOAD DATA ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.fetchCartSummary();
                if (data.length === 0) {
                    // Optional: You can uncomment this if you want to force redirect empty carts
                    // alert("Your cart is empty!");
                    // navigate('/'); 
                }
                setCartItems(data);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [navigate]);

    // --- HANDLERS ---
    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true);
        try {
            const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.postalCode}, ${shippingInfo.country}`;

            await api.placeOrder(fullAddress);
            
            alert(`Order Placed Successfully!`);
            navigate('/'); 
            
        } catch (err) {
            console.error(err);
            alert("Failed to place order. " + err.message);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // --- CALCULATIONS ---
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shippingCost = 50; 
    const tax = subtotal * 0.14; 
    const total = subtotal + shippingCost + tax;

    // Helper for Image URL
    const getImageUrl = (img) => {
        if (!img) return "https://via.placeholder.com/100";
        if (img.startsWith('http')) return img;
        return `http://localhost:5193/${img}`; 
    };

    // Formatter
    const formatCurrency = (val) => new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(val);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader className={styles.spinner} size={48} />
                <p>Loading Checkout...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>Checkout</h1>

            <div className={styles.contentWrapper}>
                
                {/* LEFT SIDE: STEPS */}
                <div className={styles.stepsSection}>
                    
                    {/* STEP 1: SHIPPING */}
                    <div className={`${styles.stepCard} ${step >= 1 ? styles.activeStep : ''}`}>
                        <div className={styles.stepHeader} onClick={() => setStep(1)}>
                            <div className={styles.stepIcon}><MapPin size={20} /></div>
                            <h2>1. Shipping Address</h2>
                        </div>
                        
                        {step === 1 && (
                            <div className={styles.stepBody}>
                                <div className={styles.formGroup}>
                                    <label>Address</label>
                                    <input type="text" name="address" value={shippingInfo.address} onChange={handleShippingChange} placeholder="123 Nile St, Cairo" />
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>City</label>
                                        <input type="text" name="city" value={shippingInfo.city} onChange={handleShippingChange} placeholder="Cairo" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Postal Code</label>
                                        <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleShippingChange} placeholder="11511" />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Country</label>
                                    <input type="text" name="country" value={shippingInfo.country} onChange={handleShippingChange} placeholder="Egypt" />
                                </div>
                                <button 
                                    className={styles.nextBtn} 
                                    onClick={() => {
                                        if(!shippingInfo.address) return alert("Please enter an address");
                                        setStep(2);
                                    }}
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        )}
                    </div>

                    {/* STEP 2: PAYMENT */}
                    <div className={`${styles.stepCard} ${step >= 2 ? styles.activeStep : ''}`}>
                        <div className={styles.stepHeader} onClick={() => setStep(2)}>
                            <div className={styles.stepIcon}><CreditCard size={20} /></div>
                            <h2>2. Payment Method</h2>
                        </div>

                        {step === 2 && (
                            <div className={styles.stepBody}>
                                <div className={styles.paymentOptions}>
                                    <div 
                                        className={`${styles.paymentOption} ${paymentMethod === 'Cash on Delivery' ? styles.selectedPayment : ''}`}
                                        onClick={() => setPaymentMethod('Cash on Delivery')}
                                    >
                                        <Truck size={24} />
                                        <span>Cash on Delivery</span>
                                    </div>
                                    <div 
                                        className={`${styles.paymentOption} ${paymentMethod === 'Credit Card' ? styles.selectedPayment : ''}`}
                                        onClick={() => setPaymentMethod('Credit Card')}
                                    >
                                        <CreditCard size={24} />
                                        <span>Credit Card</span>
                                    </div>
                                </div>
                                <button className={styles.nextBtn} onClick={() => setStep(3)}>
                                    Review Order
                                </button>
                            </div>
                        )}
                    </div>

                    {/* STEP 3: REVIEW */}
                    <div className={`${styles.stepCard} ${step >= 3 ? styles.activeStep : ''}`}>
                        <div className={styles.stepHeader} onClick={() => setStep(3)}>
                            <div className={styles.stepIcon}><CheckCircle size={20} /></div>
                            <h2>3. Review & Place Order</h2>
                        </div>

                        {step === 3 && (
                            <div className={styles.stepBody}>
                                <div className={styles.reviewItems}>
                                    {cartItems.map(item => (
                                        <div key={item.id} className={styles.reviewItem}>
                                            <img 
                                                src={getImageUrl(item.image)} 
                                                alt={item.name} 
                                                onError={(e) => e.target.src = "https://via.placeholder.com/100"}
                                            />
                                            <div className={styles.reviewDetails}>
                                                <h4>{item.name}</h4>
                                                <p>{item.qty} x {formatCurrency(item.price)}</p>
                                            </div>
                                            <div className={styles.reviewPrice}>
                                                {formatCurrency(item.qty * item.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.summarySection}>
                    <div className={styles.summaryCard}>
                        <h3>Order Summary</h3>
                        <div className={styles.summaryRow}>
                            <span>Items:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping:</span>
                            <span>{formatCurrency(shippingCost)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax (14%):</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Order Total:</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <button 
                            className={styles.placeOrderBtn}
                            onClick={handlePlaceOrder}
                            disabled={isPlacingOrder || step < 3}
                        >
                            {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaceOrderPage;