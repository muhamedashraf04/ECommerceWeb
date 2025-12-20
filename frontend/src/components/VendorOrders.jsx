import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import styles from './Vendor.module.css';

export default function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await apiClient.get('/api/Order/GetAllOrdersForVendor');
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (orderId) => {
        try {
            await apiClient.patch(`/api/Order/AcceptOrder/${orderId}`);
            alert("Order accepted");
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error("Error accepting order:", error);
            alert("Failed to accept order");
        }
    };

    const handleReject = async (orderId) => {
        if (!window.confirm("Are you sure you want to reject (cancel) this order?")) return;
        try {
            await apiClient.patch(`/api/Order/RejectOrder/${orderId}`);
            alert("Order rejected");
            fetchOrders(); // Refresh list
        } catch (error) {
            console.error("Error rejecting order:", error);
            alert("Failed to reject order");
        }
    };

    if (loading) return <div>Loading orders...</div>;

    return (
        <div>
            <h2 className={styles.header}>Pending Orders</h2>
            {orders.length === 0 ? (
                <p>No pending orders.</p>
            ) : (
                <div className={styles.grid} style={{gridTemplateColumns: '1fr'}}>
                    {orders.map(order => (
                        <div key={order.id} className={styles.card}>
                            <div className={styles.orderItem}>
                                <div>
                                    <h3 className={styles.cardTitle}>Order #{order.id}</h3>
                                    <p className={styles.cardText}>Date: {new Date(order.orderDate).toLocaleDateString()}</p>
                                    <p className={styles.price}>Total: ${order.totalAmount}</p>
                                    <div style={{marginTop: '0.5rem'}}>
                                        <h4 className={styles.label}>Items:</h4>
                                        <ul className={styles.orderList}>
                                            {order.orderItems?.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.productName} x {item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className={styles.actions} style={{flexDirection: 'column'}}>
                                    <button 
                                        onClick={() => handleAccept(order.id)}
                                        className={`${styles.btn} ${styles.btnAccept}`}
                                    >
                                        Accept
                                    </button>
                                    <button 
                                        onClick={() => handleReject(order.id)}
                                        className={`${styles.btn} ${styles.btnCancel}`}
                                    >
                                        Cancel
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
