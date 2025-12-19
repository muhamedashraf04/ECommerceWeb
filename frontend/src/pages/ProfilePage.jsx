import React, { useState, useEffect } from 'react';
import { User, Package, Settings, LogOut, ShoppingBag, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';
const ProfilePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- MOCK API ---
    const api = {
        fetchProfile: () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        name: "Samaa Sadek",
                        email: "samaa@example.com",
                        phone: "+20 100 123 4567",
                        role: "vendor", // Even if this says vendor, the UI will now ignore it.
                    });
                }, 800);
            });
        }
    };

    useEffect(() => {

        const loadData = async () => {

            try {

                setIsLoading(true);

                const data = await api.fetchProfile();

                setUser(data);

            } catch (err) {

                setError("Failed to load profile.");

            } finally {

                setIsLoading(false);

            }

        };

        loadData();

    }, []);



    const renderContent = () => {

        switch (activeTab) {

            case 'profile':

                return (

                    <div>

                        <h2 className={styles.sectionTitle}>Profile Settings</h2>

                        <p className={styles.sectionSubtitle}>Manage your account details</p>

                        <div className={styles.formGrid}>

                            <div className={styles.inputGroup}>

                                <label className={styles.label}>Full Name</label>

                                <input type="text" className={styles.input} defaultValue={user.name} />

                            </div>

                            <div className={styles.inputGroup}>

                                <label className={styles.label}>Email Address</label>

                                <input type="email" className={styles.input} defaultValue={user.email} disabled />

                            </div>

                            <div className={styles.inputGroup}>

                                <label className={styles.label}>Phone Number</label>

                                <input type="text" className={styles.input} defaultValue={user.phone} />

                            </div>

                            <div className={styles.inputGroup}>

                                <label className={styles.label}>City</label>

                                <input type="text" className={styles.input} defaultValue={user.city} />

                            </div>

                        </div>

                        <button className={styles.saveBtn}>Save Changes</button>

                    </div>

                );



            case 'orders':

                return (

                    <div>

                        <h2 className={styles.sectionTitle}>My Orders</h2>

                        <p className={styles.sectionSubtitle}>Track your recent purchases</p>

                        <div className={styles.emptyState}>

                            <Package size={48} style={{marginBottom: '1rem', opacity: 0.5}} />

                            <p>No orders found yet.</p>

                            <button className={styles.linkBtn} onClick={() => navigate('/')}>

                                Start Shopping

                            </button>

                        </div>

                    </div>

                );



            default: return null;

        }

    };



    if (isLoading) return <div className={styles.container}><Loader className="animate-spin" color="white" /></div>;

    if (error) return <div className={styles.container}>{error}</div>;



    return (

        <div className={styles.container}>

            <div className={styles.profileCard}>
                {/* SIDEBAR */}
                <div className={styles.sidebar}>
                    <div className={styles.userHeader}>
                        <div className={styles.avatar}><User size={40} /></div>
                        <h3 className={styles.userName}>{user.name}</h3>
                        {/* We hardcode this to Customer Account since we are ignoring the vendor part */}
                        <span className={styles.userRole}>Customer Account</span>
                    </div>
                    <nav className={styles.navMenu}>
                        <button
                            className={`${styles.navItem} ${activeTab === 'profile' ? styles.activeNav : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <Settings size={20} /> Settings
                        </button>
                        <button
                            className={`${styles.navItem} ${activeTab === 'orders' ? styles.activeNav : ''}`}
                            onClick={() => setActiveTab('orders')}
                        >
                            <ShoppingBag size={20} /> My Orders
                        </button>



                        {/* VENDOR BUTTON IS GONE. */}



                        <button className={`${styles.navItem} ${styles.logoutBtn}`} onClick={() => navigate('/auth')}>

                            <LogOut size={20} /> Sign Out
                        </button>
                    </nav>
                </div>
                {/* MAIN CONTENT */}
                <div className={styles.contentArea}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
export default ProfilePage;