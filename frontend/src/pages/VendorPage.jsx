import { useState } from 'react';
import VendorProducts from '../components/VendorProducts';
import VendorOrders from '../components/VendorOrders';
import styles from './VendorPage.module.css';

export default function VendorPage() {
    const [activeTab, setActiveTab] = useState('products');

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Vendor Dashboard</h1>
            
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    My Products
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Pending Orders
                </button>
            </div>

            <div>
                {activeTab === 'products' ? <VendorProducts /> : <VendorOrders />}
            </div>
        </div>
    );
}
