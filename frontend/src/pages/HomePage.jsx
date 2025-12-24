import React, { useState, useEffect } from 'react';
import { Loader, Search, ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';
// 1. We already have the api client imported
import api from '../api/axiosConfig';

const HomePage = () => {
    // --- Navigation Hook ---
    const navigate = useNavigate();

    // --- Data States ---
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- UI States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    // Track which product is currently being added (for loading spinner on button)
    const [addingToCartId, setAddingToCartId] = useState(null);

    // --- Derived Data (Categories) ---
    const [categories, setCategories] = useState(['All']);

    // --- 1. FETCH DATA (Products + Categories) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // These were already correct! Good job.
                const [productResponse, categoryResponse] = await Promise.all([
                    api.get('/api/Product/GetAllProducts'),
                    api.get('/api/Category') 
                ]);

                // Create a "Lookup Map" from the categories
                const categoryLookup = {};
                categoryResponse.data.forEach(cat => {
                    categoryLookup[cat.id] = cat.name;
                });

                // Process the Products
                const mappedData = productResponse.data.map(item => {
                    let displayImage = "https://placehold.co/300x200?text=No+Image";
                    if (item.images && item.images.length > 0) {
                        displayImage = item.images[0]; 
                    } else if (item.imageUrl) {
                        const splits = item.imageUrl.split(',');
                        if (splits.length > 0 && splits[0].trim() !== "") {
                            displayImage = splits[0].trim();
                        }
                    }

                    const catName = categoryLookup[item.categoryId] || 'General';

                    return {
                        ...item,
                        image: displayImage,
                        category: catName
                    };
                });

                setAllProducts(mappedData);
                const uniqueCats = ['All', ...Object.values(categoryLookup)];
                setCategories(uniqueCats);
                setLoading(false);

            } catch (err) {
                console.error("Fetch error:", err);
                setError("Could not load data.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- 2. ADD TO CART HANDLER (UPDATED) ---
    const handleAddToCart = async (e, productId) => {
        e.stopPropagation(); 
        
        // UX Check: Redirect immediately if not logged in
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to add items.");
            navigate('/auth');
            return;
        }

        setAddingToCartId(productId); 

        try {
            await api.post('/api/Cart/add', {
                ProductId: productId, 
                Quantity: 1
            });

            // If we get here, it succeeded (Axios throws on error)
            setTimeout(() => setAddingToCartId(null), 500);
            alert("Item added to bag!");

        } catch (err) {
            console.error(err);
            
            // Handle Axios Error Response
            if (err.response) {
                // Check for duplicate item message from backend
                const errorData = err.response.data;
                if (typeof errorData === 'string' && errorData.includes("Product already exists")) {
                    alert("You already have this item in your cart!");
                } else if (err.response.status === 401) {
                    alert("Session expired. Please log in again.");
                    navigate('/auth');
                } else {
                    alert("Failed to add item. Please try again.");
                }
            } else {
                alert("Network error. Check your connection.");
            }
        } finally {
            setAddingToCartId(null);
        }
    };

    // --- 3. FILTERING LOGIC ---
    const filteredProducts = allProducts.filter(product => {
        const nameMatch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
        return nameMatch && categoryMatch;
    });

    // --- 4. PAGINATION LOGIC ---
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className={styles.loaderContainer}>
            <Loader className="animate-spin" size={48} />
            <p>Loading Nile Store...</p>
        </div>
    );

    if (error) return <div className={styles.errorContainer}>{error}</div>;

    return (
        <div className={styles.container}>
            {/* HERO SECTION */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>End of Season Super Sale</h1>
                <p className={styles.heroSubtitle}>Get up to 50% off on all electronics today.</p>
            </div>

            {/* SEARCH SECTION */}
            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    placeholder="Search for products..." 
                    className={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1); 
                    }}
                />
            </div>

            {/* CATEGORIES */}
            <div className={styles.categoryTabs}>
                {categories.map((cat, index) => (
                    <button 
                        key={index}
                        className={`${styles.tabBtn} ${selectedCategory === cat ? styles.activeTab : ''}`}
                        onClick={() => {
                            setSelectedCategory(cat);
                            setCurrentPage(1);
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {/* GRID HEADER */}
            <div className={styles.sectionHeader}>
                <h3>Showing {filteredProducts.length} Results</h3>
            </div>

            {/* PRODUCT GRID */}
            <div className={styles.productGrid}>
                {currentProducts.length > 0 ? (
                    currentProducts.map(product => (
                        <div 
                            key={product.id} 
                            className={styles.productCard}
                            onClick={() => navigate(`/prod/${product.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={styles.imageWrapper}>
                                <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className={styles.productImage} 
                                    onError={(e) => { e.target.src = "https://placehold.co/300x200?text=Image+Error"; }}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <span className={styles.categoryTag}>{product.category}</span>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <p className={styles.productPrice}>
                                    {product.price ? `EGP ${product.price.toLocaleString()}` : 'N/A'}
                                </p>
                                
                                {/* Add to Cart Button */}
                                <button 
                                    className={styles.addBtn}
                                    disabled={addingToCartId === product.id} // Disable if currently adding this specific item
                                    onClick={(e) => handleAddToCart(e, product.id)}
                                >
                                    {addingToCartId === product.id ? (
                                        <>
                                            <Loader className="animate-spin" size={18} style={{ marginRight: '8px' }} /> 
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={18} style={{ marginRight: '8px' }} /> 
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.noResults}>
                        <h3>No products found.</h3>
                        <p>Try adjusting your search or category.</p>
                    </div>
                )}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className={styles.pageBtn}
                    >
                        <ChevronLeft size={18} /> Previous
                    </button>
                    
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className={styles.pageBtn}
                    >
                        Next <ChevronRight size={18} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;