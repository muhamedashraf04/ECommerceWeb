import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Store } from 'lucide-react'; // Icons
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            {/* --- PERMANENT NAVIGATION BAR --- */}
            <nav className={styles.navbar}>
                {/* 1. Logo (Clicking takes you Home) */}
                <div className={styles.logo} onClick={() => navigate('/')}>
                    <span style={{color: '#00B4D8', fontSize: '1.5rem', cursor: 'pointer'}}>Nile</span>
                </div>

                {/* 2. Navigation Links */}
                <div className={styles.navLinks}>
                    <Link to="/" className={styles.navLink}>Home</Link>
                    <Link to="/profile" className={styles.navLink}>Profile</Link>
                </div>

                {/* 3. Action Icons (Cart & Profile) */}
                <div className={styles.actions}>
                    <Link to="/cart" className={styles.iconLink}>
                        <ShoppingBag size={24} />
                        {/* Optional: Add a badge count here later */}
                    </Link>
                    
                    <Link to="/profile" className={styles.iconLink}>
                        <User size={24} />
                    </Link>
                </div>
            </nav>

            {/* --- PAGE CONTENT INJECTED HERE --- */}
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;