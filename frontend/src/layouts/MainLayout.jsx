import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Store } from 'lucide-react'; 
import styles from './MainLayout.module.css';
import { getUserRole } from '../lib/auth';

const MainLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = getUserRole();
    const isVendor = role === 'Vendor';

    return (
        <div className={styles.container}>
            {/* --- NAV SECTION START --- */}
            <nav className={styles.navbar}>
                <div className={styles.logo} onClick={() => navigate('/')}>
                    NILE
                </div>
                <div className={styles.actions}>
                    {isVendor && (
                        <Link to="/vendor" className={styles.iconLink} title="Vendor Panel">
                            <Store size={24} />
                        </Link>
                    )}
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