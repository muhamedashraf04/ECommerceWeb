import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Loader } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ProductPage.module.css'; // <--- We are using the CSS file again
import api from '../api/axiosConfig';

const ProductPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();

    // --- STATE ---
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [activeImgIndex, setActiveImgIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const loadData = async () => {
            // Safety Check: If no ID, stop loading immediately
            if (!id) {
                setLoading(false);
                setError("No Product ID found.");
                return;
            }

            try {
                setLoading(true);
                
                // Real API Call
                const response = await api.get('/api/Product/GetProductByID', {
                    params: { productId: id }
                });

                const data = response.data;

                // Robust Image Handling (from our Safe Mode test)
                let imagesArray = [];
                if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                    imagesArray = data.images;
                } else if (data.imageUrl) {
                    imagesArray = data.imageUrl.split(',').map(s => s.trim()).filter(s => s !== "");
                }
                
                // Fallback if empty
                if (imagesArray.length === 0) {
                    imagesArray = ["https://placehold.co/600x600?text=No+Image"];
                }

                setProduct({
                    id: data.id,
                    title: data.name, 
                    brand: "Nile Electronics", 
                    price: data.price,
                    description: data.description || "No description available.",
                    rating: 4,   
                    reviews: 128, 
                    images: imagesArray
                });

            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to load product details.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    // --- 2. HANDLERS ---
    const handleQuantity = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = async () => {
        if (!product) return;
        
        setAddingToCart(true);
        try {
            await api.post('/api/Cart/add', { 
                productId: product.id, 
                quantity: quantity 
            });
            
            alert(`Successfully added ${quantity} ${product.title}(s) to your bag!`);
            setQuantity(1);

        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                alert("Please login to add items.");
                navigate('/auth'); // Redirect to login if unauthorized
            } else {
                alert("Could not add item. Please try again.");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    // --- 3. RENDER ---

    if (loading) {
        return (
            <div className={styles.container}>
                <div style={{color: '#1E293B', textAlign: 'center'}}>
                    <Loader className="animate-spin" size={48} color="#00B4D8" />
                    <p style={{marginTop:'1rem', fontWeight: 'bold'}}>Loading details...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className={styles.container}>
                <div className={styles.productCard} style={{justifyContent:'center', flexDirection: 'column', alignItems: 'center', color:'#ef4444', gap: '1rem'}}>
                    <h2 style={{fontSize: '1.5rem'}}>{error || "Product not found"}</h2>
                    <button 
                        onClick={() => navigate('/')}
                        className={styles.addToCartBtn} // Reuse button style
                        style={{maxWidth: '200px'}}
                    >
                        Go Back Home
                    </button>
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
                        onError={(e) => { e.target.src = "https://placehold.co/600x600?text=Image+Error"; }}
                    />
                    <div className={styles.thumbnails}>
                        {product.images.map((img, index) => (
                            <img 
                                key={index}
                                src={img} 
                                className={`${styles.thumb} ${index === activeImgIndex ? styles.activeThumb : ''}`} 
                                alt={`View ${index + 1}`}
                                onClick={() => setActiveImgIndex(index)}
                                onError={(e) => { e.target.src = "https://placehold.co/100x100?text=Thumb"; }}
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
                        {product.price ? `EGP ${product.price.toLocaleString()}` : 'N/A'}
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