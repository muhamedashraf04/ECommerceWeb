import { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // Renamed for consistency
import styles from './Vendor.module.css';

export default function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Uses the configured Axios client (Base URL + Auth Token)
            const response = await api.get('/api/Order/GetAllOrdersForVendor');
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await api.patch(`/api/Order/AcceptOrder/${orderId}`);
            alert("Order accepted successfully");
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error("Error accepting order:", error);
            alert("Failed to accept order.");
        }
    };

    const handleReject = async (orderId) => {
        if (!window.confirm("Are you sure you want to reject (cancel) this order?")) return;
        try {
            await api.patch(`/api/Order/RejectOrder/${orderId}`);
            alert("Order rejected.");
            fetchOrders(); 
        } catch (error) {
            console.error("Error rejecting order:", error);
            alert("Failed to reject order.");
        }
    };

    // Helper for EGP Currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-EG', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    if (loading) return (
        <div style={{textAlign: 'center', padding: '2rem'}}>
            Loading pending orders...
        </div>
    );

    return (
        <div>
            <h2 className={styles.header}>Pending Orders</h2>
            {orders.length === 0 ? (
                <div style={{textAlign: 'center', padding: '2rem', color: '#64748b'}}>
                    <p>No pending orders found.</p>
                </div>
            ) : (
                <div className={styles.grid} style={{gridTemplateColumns: '1fr'}}>
                    {orders.map(order => (
                        <div key={order.id} className={styles.card}>
                            <div className={styles.orderItem}>
                                <div style={{flex: 1}}>
                                    <div style={{display:'flex', justifyContent:'space-between'}}>
                                        <h3 className={styles.cardTitle}>Order #{order.id}</h3>
                                        <span style={{fontSize:'0.9rem', color:'#64748b'}}>
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className={styles.price} style={{margin: '0.5rem 0'}}>
                                        Total: {formatCurrency(order.totalAmount)}
                                    </p>
                                    
                                    <div style={{marginTop: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '4px'}}>
                                        <h4 className={styles.label} style={{marginBottom: '0.25rem'}}>Items:</h4>
                                        <ul className={styles.orderList} style={{margin: 0, paddingLeft: '1.2rem'}}>
                                            {order.orderItems?.map((item, idx) => (
                                                <li key={idx} style={{color: '#334155'}}>
                                                    {item.productName} (x{item.quantity})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className={styles.actions} style={{flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem'}}>
                                    <button 
                                        onClick={() => handleAccept(order.id)}
                                        className={`${styles.btn} ${styles.btnAccept}`}
                                        style={{width: '100%'}}
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleReject(order.id)}
                                        className={`${styles.btn} ${styles.btnCancel}`}
                                        style={{width: '100%'}}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}