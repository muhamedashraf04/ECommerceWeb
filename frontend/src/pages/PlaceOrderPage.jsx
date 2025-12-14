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
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
    
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

    // ==========================================
    //  PHASE 4: API HANDLERS
    // ==========================================

    // --- OPTION A: FAKE BACKEND (CURRENTLY ACTIVE) ---
    const api = {
        fetchCartSummary: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([
                        { 
                            id: 1, 
                            name: "Nile Smart Watch", 
                            price: 2500, 
                            qty: 1, 
                            image: "https://via.placeholder.com/100" 
                        },
                        { 
                            id: 2, 
                            name: "Wireless Earbuds", 
                            price: 850, 
                            qty: 2, 
                            image: "https://via.placeholder.com/100" 
                        }
                    ]);
                }, 1000);
            });
        },
        placeOrder: (orderData) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, orderId: "ORD-12345-NILE" });
                }, 2000);
            });
        }
    };

    // --- LOAD DATA ---
    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await api.fetchCartSummary();
                setCartItems(data);
            } catch (err) {
                console.error("Failed to load cart", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // --- CALCULATIONS ---
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shippingCost = 50; // Flat rate
    const tax = subtotal * 0.14; // 14% Tax
    const total = subtotal + shippingCost + tax;

    // --- HANDLERS ---
    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        setCardInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true);
        try {
            const orderData = {
                items: cartItems,
                shipping: shippingInfo,
                payment: paymentMethod,
                total: total
            };
            
            const response = await api.placeOrder(orderData);
            
            if (response.success) {
                alert(`Order Placed Successfully! Order ID: ${response.orderId}`);
                navigate('/'); // Redirect to Home or Order Success Page
            }
        } catch (err) {
            alert("Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

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
                                    <input 
                                        type="text" 
                                        name="address" 
                                        value={shippingInfo.address} 
                                        onChange={handleShippingChange} 
                                        placeholder="123 Nile St, Cairo"
                                    />
                                </div>
                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>City</label>
                                        <input 
                                            type="text" 
                                            name="city" 
                                            value={shippingInfo.city} 
                                            onChange={handleShippingChange} 
                                            placeholder="Cairo"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Postal Code</label>
                                        <input 
                                            type="text" 
                                            name="postalCode" 
                                            value={shippingInfo.postalCode} 
                                            onChange={handleShippingChange} 
                                            placeholder="11511"
                                        />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Country</label>
                                    <input 
                                        type="text" 
                                        name="country" 
                                        value={shippingInfo.country} 
                                        onChange={handleShippingChange} 
                                        placeholder="Egypt"
                                    />
                                </div>
                                <button className={styles.nextBtn} onClick={() => setStep(2)}>
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
                                        className={`${styles.paymentOption} ${paymentMethod === 'Credit Card' ? styles.selectedPayment : ''}`}
                                        onClick={() => setPaymentMethod('Credit Card')}
                                    >
                                        <CreditCard size={24} />
                                        <span>Credit Card</span>
                                    </div>
                                    <div 
                                        className={`${styles.paymentOption} ${paymentMethod === 'Cash on Delivery' ? styles.selectedPayment : ''}`}
                                        onClick={() => setPaymentMethod('Cash on Delivery')}
                                    >
                                        <Truck size={24} />
                                        <span>Cash on Delivery</span>
                                    </div>
                                </div>

                                {paymentMethod === 'Credit Card' && (
                                    <div className={styles.cardDetails}>
                                        <div className={styles.formGroup}>
                                            <label>Card Holder Name</label>
                                            <input 
                                                type="text" 
                                                name="cardHolder" 
                                                value={cardInfo.cardHolder} 
                                                onChange={handleCardChange} 
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Card Number</label>
                                            <input 
                                                type="text" 
                                                name="cardNumber" 
                                                value={cardInfo.cardNumber} 
                                                onChange={handleCardChange} 
                                                placeholder="0000 0000 0000 0000"
                                            />
                                        </div>
                                        <div className={styles.row}>
                                            <div className={styles.formGroup}>
                                                <label>Expire Date</label>
                                                <input 
                                                    type="text" 
                                                    name="expiryDate" 
                                                    value={cardInfo.expiryDate} 
                                                    onChange={handleCardChange} 
                                                    placeholder="MM/YY"
                                                />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label>CVV</label>
                                                <input 
                                                    type="text" 
                                                    name="cvv" 
                                                    value={cardInfo.cvv} 
                                                    onChange={handleCardChange} 
                                                    placeholder="123"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

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
                                            <img src={item.image} alt={item.name} />
                                            <div className={styles.reviewDetails}>
                                                <h4>{item.name}</h4>
                                                <p>{item.qty} x {item.price} EGP</p>
                                            </div>
                                            <div className={styles.reviewPrice}>
                                                {item.qty * item.price} EGP
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT SIDE: ORDER SUMMARY */}
                <div className={styles.summarySection}>
                    <div className={styles.summaryCard}>
                        <h3>Order Summary</h3>
                        <div className={styles.summaryRow}>
                            <span>Items ({cartItems.reduce((a, c) => a + c.qty, 0)}):</span>
                            <span>{subtotal.toLocaleString()} EGP</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping:</span>
                            <span>{shippingCost} EGP</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax (14%):</span>
                            <span>{tax.toLocaleString()} EGP</span>
                        </div>
                        <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                            <span>Order Total:</span>
                            <span>{total.toLocaleString()} EGP</span>
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
