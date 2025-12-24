import React, { useState, useEffect } from 'react';
import { User, Package, Settings, LogOut, ShoppingBag, Loader, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
import api from '../api/axiosConfig';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    
    // --- Data State ---
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth'); 
                return;
            }

            setIsLoading(true);

            try {
                // 1. FETCH PROFILE (Server Call)
                // We are calling the endpoint exactly as you requested.
                // If you see "/api/Auth/test" in your logs, your browser is caching the OLD file.
                console.log("Fetching profile from: /api/Auth/profile-basic");
                const profileReq = api.get('/api/Auth/profile-basic');
                
                // 2. FETCH ORDERS (Server Call)
                const ordersReq = api.get('/api/Order/ShowOrder');

                // Run both requests in parallel
                const [profileRes, ordersRes] = await Promise.allSettled([profileReq, ordersReq]);

                // --- Handle Profile Response ---
                if (profileRes.status === 'fulfilled') {
                    // Success: Use the data directly from the server
                    setUser(profileRes.value.data);
                } else {
                    console.error("Profile fetch failed:", profileRes.reason);
                    setError("Failed to load profile data.");
                }

                // --- Handle Orders Response ---
                if (ordersRes.status === 'fulfilled') {
                    let data = ordersRes.value.data;
                    if (!data) data = [];
                    else if (!Array.isArray(data)) data = [data]; 
                    setOrders(data);
                } else {
                    console.warn("Orders fetch failed or user has no orders.");
                    setOrders([]);
                }

            } catch (err) {
                console.error("Critical Dashboard error:", err);
                setError("An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    // --- HELPER FUNCTIONS ---
    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        try {
            const res = await api.delete('/api/Order/CancelOrder');
            if (res.status === 200) {
                alert("Order cancelled successfully");
                setOrders(prev => prev.map(o => 
                    o.orderId === orderId ? { ...o, orderStatus: 'Cancelled' } : o
                ));
            }
        } catch (err) {
            alert("Failed to cancel order.");
        }
    };

    const getStatusColor = (status) => {
        const s = status ? status.toLowerCase() : '';
        switch (s) {
            case 'pending': return '#facc15';
            case 'processing': return '#3b82f6';
            case 'accepted': return '#10b981';
            case 'delivered': return '#64748b';
            case 'cancelled': return '#ef4444';
            default: return '#94a3b8';
        }
    };

    // --- RENDER CONTENT ---
    const renderContent = () => {
        if (activeTab === 'profile') {
            return (
                <div>
                    <h2 className={styles.sectionTitle}>Profile Settings</h2>
                    <p className={styles.sectionSubtitle}>Manage your account details</p>
                    
                    {user ? (
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Full Name</label>
                                {/* We check both lowercase and Uppercase keys just in case */}
                                <input type="text" className={styles.input} defaultValue={user.name || user.Name} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Email Address</label>
                                <input type="email" className={styles.input} defaultValue={user.email || user.Email} disabled />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Phone Number</label>
                                <input type="text" className={styles.input} defaultValue={user.phone || user.Phone} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Address</label>
                                <input type="text" className={styles.input} defaultValue={user.address || user.Address} />
                            </div>
                            <button className={styles.saveBtn}>Save Changes</button>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p style={{color: 'red'}}>{error || "Loading..."}</p>
                        </div>
                    )}
                </div>
            );
        }

        if (activeTab === 'orders') {
            return (
                <div>
                    <h2 className={styles.sectionTitle}>My Orders</h2>
                    <p className={styles.sectionSubtitle}>Track your recent purchases</p>

                    {orders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>No orders found yet.</p>
                            <button className={styles.linkBtn} onClick={() => navigate('/')}>
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className={styles.ordersList}>
                            {orders.map(order => (
                                <div key={order.orderId} className={styles.orderCard}>
                                    <div className={styles.orderHeader}>
                                        <h3>Order #{order.orderId}</h3>
                                        <span className={styles.statusBadge} style={{ backgroundColor: getStatusColor(order.orderStatus) }}>
                                            {order.orderStatus || 'Pending'}
                                        </span>
                                    </div>
                                    <div className={styles.itemsList}>
                                        {order.items && order.items.map((item, idx) => (
                                            <div key={idx} className={styles.itemRow}>
                                                <span>Product ID: {item.productId}</span>
                                                <span>Qty: {item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {order.orderStatus?.toLowerCase() === 'pending' && (
                                        <div className={styles.orderFooter}>
                                            <button className={styles.cancelBtn} onClick={() => handleCancelOrder(order.orderId)}>
                                                <XCircle size={16} style={{marginRight:'5px'}}/> Cancel Order
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
    };

    if (isLoading) return <div className={styles.loaderContainer}><Loader className="animate-spin" size={48} /></div>;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.sidebar}>
                    <div className={styles.userHeader}>
                        <div className={styles.avatar}><User size={40} /></div>
                        <h3 className={styles.userName}>{user?.name || user?.Name || 'Customer'}</h3>
                        <span className={styles.userRole}>Customer Account</span>
                    </div>
                    <nav className={styles.navMenu}>
                        <button className={`${styles.navItem} ${activeTab === 'profile' ? styles.activeNav : ''}`} onClick={() => setActiveTab('profile')}>
                            <Settings size={20} /> Settings
                        </button>
                        <button className={`${styles.navItem} ${activeTab === 'orders' ? styles.activeNav : ''}`} onClick={() => setActiveTab('orders')}>
                            <ShoppingBag size={20} /> My Orders
                        </button>
                        <button className={`${styles.navItem} ${styles.logoutBtn}`} onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/auth');
                        }}>
                            <LogOut size={20} /> Sign Out
                        </button>
                    </nav>
                </div>
                <div className={styles.contentArea}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;