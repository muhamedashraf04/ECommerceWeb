import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const HomePage = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [products, setProducts] = useState([]); // Empty start
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // ==========================================
    //  PHASE 4: API HANDLERS
    // ==========================================

    // --- OPTION A: FAKE BACKEND (CURRENTLY ACTIVE) ---
    const api = {
        fetchProducts: () => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simulate a successful DB response
                    resolve([
                        { id: 1, name: "Nile Smart Watch", price: 2500, category: "Electronics", image: "https://via.placeholder.com/300" },
                        { id: 2, name: "Wireless Earbuds", price: 850, category: "Audio", image: "https://via.placeholder.com/300" },
                        { id: 3, name: "Running Shoes", price: 1200, category: "Fashion", image: "https://via.placeholder.com/300" },
                        { id: 4, name: "Gaming Mouse", price: 450, category: "Gaming", image: "https://via.placeholder.com/300" },
                        { id: 5, name: "Mechanical Keyboard", price: 1800, category: "Gaming", image: "https://via.placeholder.com/300" },
                        { id: 6, name: "Leather Jacket", price: 3500, category: "Fashion", image: "https://via.placeholder.com/300" },
                        { id: 7, name: "4K Monitor", price: 8000, category: "Electronics", image: "https://via.placeholder.com/300" },
                        { id: 8, name: "Bluetooth Speaker", price: 1500, category: "Audio", image: "https://via.placeholder.com/300" },
                        { id: 9, name: "USB-C Hub", price: 600, category: "Electronics", image: "https://via.placeholder.com/300" },
                        { id: 10, name: "Denim Jeans", price: 900, category: "Fashion", image: "https://via.placeholder.com/300" },
                    ]);
                    // To test error state, uncomment next line:
                    // reject("Server timed out");
                }, 1000); // 1 second delay
            });
        }
    };

    /* // --- OPTION B: REAL BACKEND (ENABLE LATER) ---
    import axios from 'axios';
    const api = {
        fetchProducts: async () => {
            try {
                // Replace with your actual backend URL
                const response = await axios.get('http://localhost:5000/api/products');
                return response.data; 
            } catch (err) {
                throw new Error("Failed to connect to server");
            }
        }
    };
    */

    // --- EFFECT: LOAD DATA ---
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const data = await api.fetchProducts();
                setProducts(data);
            } catch (err) {
                setError("Failed to load products. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // --- LOGIC: FILTERING (Same as Phase 3) ---
    // Get unique categories dynamically from the fetched data
    const categories = ["All", ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory]);


    // --- RENDER ---
    return (
        <div className={styles.container}>
            
            {/* NAVBAR */}
            <nav className={styles.navbar}>
                <div className={styles.logo} onClick={() => navigate('/')}>NILE</div>
                <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for products..." 
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className={styles.navIcons}>
                    <button className={styles.iconBtn} onClick={() => navigate('/cart')}>
                        <ShoppingCart size={24} />
                        <span className={styles.badge}>2</span>
                    </button>
                    <button className={styles.iconBtn} onClick={() => navigate('/auth')}>
                        <User size={24} />
                    </button>
                </div>
            </nav>

            {/* HERO */}
            <header className={styles.hero}>
                <h1 className={styles.heroTitle}>End of Season Super Sale</h1>
                <p className={styles.heroSubtitle}>Get up to 50% off on all electronics.</p>
            </header>

            {/* MAIN SECTION */}
            <section className={styles.gridSection}>
                
                {/* 1. LOADING STATE */}
                {isLoading && (
                    <div style={{textAlign: 'center', padding: '4rem', color: '#94a3b8'}}>
                        <Loader className="animate-spin" size={48} style={{margin: '0 auto 1rem'}}/>
                        <p>Loading best deals...</p>
                    </div>
                )}

                {/* 2. ERROR STATE */}
                {error && (
                    <div style={{textAlign: 'center', padding: '4rem', color: '#ef4444'}}>
                        <h3>Oops!</h3>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} style={{marginTop:'1rem', padding:'8px 16px', cursor:'pointer'}}>Try Again</button>
                    </div>
                )}

                {/* 3. DATA LOADED */}
                {!isLoading && !error && (
                    <>
                        <div className={styles.controlsHeader}>
                            <h2 className={styles.sectionTitle}>Featured Products</h2>
                            <div className={styles.categoryFilters}>
                                {categories.map(cat => (
                                    <button 
                                        key={cat}
                                        className={`${styles.catBtn} ${selectedCategory === cat ? styles.activeCat : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        {currentProducts.length > 0 ? (
                            <div className={styles.productsGrid}>
                                {currentProducts.map((product) => (
                                    <div 
                                        key={product.id} 
                                        className={styles.card}
                                        onClick={() => navigate(`/product`)}
                                    >
                                        <img src={product.image} alt={product.name} className={styles.cardImage} />
                                        <div className={styles.cardBody}>
                                            <div className={styles.cardCategory}>{product.category}</div>
                                            <div className={styles.cardTitle}>{product.name}</div>
                                            <div className={styles.cardPrice}>EGP {product.price.toLocaleString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.noResults}>
                                <p>No products found matching "{searchQuery}".</p>
                            </div>
                        )}

                        {filteredProducts.length > itemsPerPage && (
                            <div className={styles.pagination}>
                                <button 
                                    className={styles.pageBtn} 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <span className={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
                                <button 
                                    className={styles.pageBtn} 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default HomePage;