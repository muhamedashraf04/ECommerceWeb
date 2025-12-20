import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react'; 
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            {/* --- NAV SECTION START --- */}
            <nav className={styles.navbar}>
                <div className={styles.logo} onClick={() => navigate('/')}>
                    NILE
                </div>
                <div className={styles.actions}>
                    <Link to="/cart" className={styles.iconLink}>
                        <ShoppingBag size={24} />
                    </Link>
                    <Link to="/profile" className={styles.iconLink}>
                        <User size={24} />
                    </Link>
                </div>
            </nav>
            {/* --- NAV SECTION END --- */}

            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;