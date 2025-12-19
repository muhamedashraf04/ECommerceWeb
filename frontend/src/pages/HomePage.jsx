import React, { useState, useEffect } from 'react';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HomePage.module.css';

const HomePage = () => {
    // --- STATE ---
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    // --- PAGINATION STATE ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Adjust this number as needed

    // --- MOCK API CALL ---
    useEffect(() => {
        setTimeout(() => {
            // Generating more dummy data to test pagination
            const mockData = [
                { id: 1, name: "Nile Smart Watch", price: 2500, category: "Electronics", image: "https://placehold.co/300x200?text=Smart+Watch" },
                { id: 2, name: "Wireless Earbuds", price: 850, category: "Audio", image: "https://placehold.co/300x200?text=Earbuds" },
                { id: 3, name: "Running Shoes", price: 1200, category: "Fashion", image: "https://placehold.co/300x200?text=Shoes" },
                { id: 4, name: "Gaming Mouse", price: 450, category: "Gaming", image: "https://placehold.co/300x200?text=Mouse" },
                { id: 5, name: "HD Monitor", price: 3200, category: "Electronics", image: "https://placehold.co/300x200?text=Monitor" },
                { id: 6, name: "Mechanical Keyboard", price: 1500, category: "Gaming", image: "https://placehold.co/300x200?text=Keyboard" },
                { id: 7, name: "Yoga Mat", price: 300, category: "Fashion", image: "https://placehold.co/300x200?text=Yoga" },
                { id: 8, name: "Bluetooth Speaker", price: 900, category: "Audio", image: "https://placehold.co/300x200?text=Speaker" },
                { id: 9, name: "Laptop Stand", price: 550, category: "Electronics", image: "https://placehold.co/300x200?text=Stand" },
            ];
            setProducts(mockData);
            setFilteredProducts(mockData);
            setLoading(false);
        }, 800);
    }, []);

    // --- FILTER LOGIC ---
    useEffect(() => {
        let result = products;

        if (activeCategory !== 'All') {
            result = result.filter(product => product.category === activeCategory);
        }

        if (searchTerm) {
            result = result.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredProducts(result);
        setCurrentPage(1); // Reset to page 1 on filter change
    }, [searchTerm, activeCategory, products]);

    // --- PAGINATION LOGIC ---
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    if (loading) return <div className={styles.loaderContainer}><Loader className="animate-spin" /> Loading best deals...</div>;

    return (
        <div className={styles.container}>
            
            {/* SEARCH BAR */}
            <div className={styles.searchContainer}>
                <input 
                    type="text" 
                    placeholder="Search for products..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* HERO BANNER */}
            <div className={styles.hero}>
                <h1 className={styles.heroTitle}>End of Season Super Sale</h1>
                <p className={styles.heroSubtitle}>Get up to 50% off on all electronics.</p>
            </div>

            {/* CATEGORIES */}
            <div className={styles.categoryTabs}>
                {['All', 'Electronics', 'Audio', 'Fashion', 'Gaming'].map(cat => (
                    <button 
                        key={cat}
                        className={`${styles.tabBtn} ${activeCategory === cat ? styles.activeTab : ''}`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* PRODUCT GRID */}
            <div className={styles.sectionHeader}>
                <h2>Featured Products</h2>
            </div>

            <div className={styles.productGrid}>
                {currentItems.map(product => (
                    <div key={product.id} className={styles.productCard}>
                        <img src={product.image} alt={product.name} className={styles.productImage} />
                        <div className={styles.cardContent}>
                            <span className={styles.categoryTag}>{product.category}</span>
                            <h3 className={styles.productName}>{product.name}</h3>
                            <p className={styles.productPrice}>EGP {product.price.toLocaleString()}</p>
                            <button className={styles.addBtn}>Add to Cart</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* NO RESULTS MESSAGE */}
            {filteredProducts.length === 0 && (
                <div style={{textAlign: 'center', marginTop: '3rem', color: '#888'}}>
                    <p>No products found matching "{searchTerm}"</p>
                </div>
            )}

            {/* --- PAGINATION CONTROLS --- */}
            {filteredProducts.length > itemsPerPage && (
                <div className={styles.pagination}>
                    <button 
                        className={styles.pageBtn} 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>
                    
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button 
                        className={styles.pageBtn} 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default HomePage;