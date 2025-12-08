import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Loader } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductPage.module.css';

const ProductPage = () => {
    const { id } = useParams(); // Allows accessing /product/1 in the future
    const navigate = useNavigate();

    // --- STATE ---
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    // ==========================================
    //  PHASE 4: API HANDLERS
    // ==========================================

    // --- OPTION A: FAKE BACKEND (CURRENTLY ACTIVE) ---
    const api = {
        fetchProduct: (productId) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate finding a product
                    resolve({
                        id: productId || 1,
                        title: "Nile Smart Watch Series 5",
                        brand: "Nile Electronics",
                        price: 2500,
                        description: "Experience the future on your wrist. Features an always-on Retina display, ECG app, and water resistance up to 50 meters.",
                        rating: 4,
                        reviews: 128,
                        images: [
                            "https://via.placeholder.com/400/00B4D8/ffffff?text=Main+View",
                            "https://via.placeholder.com/400/0077b6/ffffff?text=Side+View",
                            "https://via.placeholder.com/400/90e0ef/000000?text=Back+View"
                        ]
                    });
                }, 1000);
            });
        },
        addToCart: (item) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true, message: "Item added to cart" });
                }, 800);
            });
        }
    };

    /* // --- OPTION B: REAL BACKEND (ENABLE THIS LATER) ---
    const api = {
        fetchProduct: async (productId) => {
            const response = await fetch(`http://localhost:5000/api/products/${productId || 1}`);
            if (!response.ok) throw new Error("Product not found");
            return await response.json();
        },
        addToCart: async (item) => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/cart', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: item.id, qty: item.qty })
            });
            if (!response.ok) throw new Error("Failed to add to cart");
            return await response.json();
        }
    };
    */

    // ==========================================
    //  LOGIC
    // ==========================================

    // 1. Fetch Data on Load
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await api.fetchProduct(id);
                setProduct(data);
            } catch (err) {
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // 2. Handle Quantity
    const handleQuantity = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    // 3. Handle Add to Cart
    const handleAddToCart = async () => {
        if (!product) return;
        
        // Optional: Check if logged in (for Real Backend)
        // const token = localStorage.getItem('token');
        // if (!token) { navigate('/auth'); return; }

        setAddingToCart(true);
        try {
            await api.addToCart({ 
                id: product.id, 
                qty: quantity 
            });
            
            // Success Feedback
            alert(`Successfully added ${quantity} ${product.title}(s) to your bag!`);
            
            // Optional: Reset quantity or go to cart
            setQuantity(1);
            // navigate('/cart'); 

        } catch (err) {
            alert("Could not add item. Please try again.");
        } finally {
            setAddingToCart(false);
        }
    };

    // ==========================================
    //  RENDER
    // ==========================================

    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{color: 'white', textAlign: 'center'}}>
                    <Loader className="animate-spin" size={48} />
                    <p style={{marginTop:'1rem'}}>Loading details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.container}>
                <div className={styles.productCard} style={{justifyContent:'center', color:'red'}}>
                    <h2>{error || "Product not found"}</h2>
                    <button onClick={() => navigate('/')}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.productCard}>
                
                {/* LEFT: Image Gallery */}
                <div className={styles.imageSection}>
                    <img 
                        src={product.images[activeImgIndex]} 
                        alt={product.title} 
                        className={styles.mainImage} 
                    />
                    <div className={styles.thumbnails}>
                        {product.images.map((img, index) => (
                            <img 
                                key={index}
                                src={img} 
                                className={`${styles.thumb} ${index === activeImgIndex ? styles.activeThumb : ''}`} 
                                alt={`View ${index + 1}`}
                                onClick={() => setActiveImgIndex(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT: Details */}
                <div className={styles.detailsSection}>
                    <div className={styles.brandTag}>{product.brand}</div>
                    <h1 className={styles.title}>{product.title}</h1>
                    
                    <div className={styles.rating}>
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                fill={i < product.rating ? "#fbbf24" : "#e2e8f0"} 
                                color={i < product.rating ? "#fbbf24" : "#e2e8f0"} 
                                size={20} 
                            />
                        ))}
                        <span>({product.reviews} Reviews)</span>
                    </div>

                    <div className={styles.price}>
                        EGP {product.price.toLocaleString()}
                    </div>

                    <p className={styles.description}>
                        {product.description}
                    </p>

                    <div className={styles.controls}>
                        {/* Quantity */}
                        <div className={styles.qtyControl}>
                            <button 
                                className={styles.qtyBtn}
                                onClick={() => handleQuantity(-1)}
                            >-</button>
                            
                            <span>{quantity}</span>
                            
                            <button 
                                className={styles.qtyBtn}
                                onClick={() => handleQuantity(1)}
                            >+</button>
                        </div>

                        {/* Add to Cart */}
                        <button 
                            className={styles.addToCartBtn}
                            onClick={handleAddToCart}
                            disabled={addingToCart}
                            style={{ opacity: addingToCart ? 0.7 : 1, cursor: addingToCart ? 'wait' : 'pointer' }}
                        >
                            {addingToCart ? <Loader className="animate-spin" size={20}/> : <ShoppingCart size={20} />}
                            {addingToCart ? ' Adding...' : ' Add to Cart'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductPage;