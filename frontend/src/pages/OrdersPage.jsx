import React, { useEffect, useState } from 'react';
import { Loader, XCircle } from 'lucide-react';
import styles from './OrdersPage.module.css';
import api from '../api/axiosConfig';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/Order/ShowOrder', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let data = res.data;
      if (!data) data = [];
      else if (!Array.isArray(data)) data = [data];

      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('Could not load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.delete('/api/Order/CancelOrder', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.status === 200) {
        setOrders(prev =>
          prev.map(o =>
            o.orderId === orderId ? { ...o, orderStatus: 'Cancelled' } : o
          )
        );
      } else {
        alert('Failed to cancel order.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not cancel order.');
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#facc15';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#10b981';
      case 'delivered': return '#64748b';
      case 'cancelled': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  if (isLoading) return (
    <div className={styles.loaderContainer}>
      <Loader className="animate-spin" size={48} />
      <p>Loading your orders...</p>
    </div>
  );

  if (error) return <div className={styles.errorContainer}>{error}</div>;

  if (!orders || orders.length === 0) return (
    <div className={styles.noResults}>
      <h3>No orders found.</h3>
    </div>
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.pageTitle}>My Orders</h2>
      <ul className={styles.ordersList}>
        {orders.map(order => (
          <li key={order.orderId} className={styles.orderItem}>
            {/* Order ID at the top */}
            <div className={styles.orderHeader}>
              <h3>Order #{order.orderId}</h3>
              <span
                className={styles.statusBadge}
                style={{ backgroundColor: getStatusColor(order.orderStatus) }}
              >
                {order.orderStatus}
              </span>
            </div>

            {/* Product Items under the order */}
            <ul className={styles.itemsList}>
              {order.items.map(item => (
                <li key={item.productId} className={styles.itemRow}>
                  <span>Product ID: {item.productId}</span>
                  <span>Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>

            {/* Cancel button for pending orders */}
            {order.orderStatus.toLowerCase() === 'pending' && (
              <button
                className={styles.cancelBtn}
                onClick={() => handleCancel(order.orderId)}
              >
                <XCircle size={16} style={{ marginRight: '0.25rem' }} />
                Cancel Order
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersPage;
