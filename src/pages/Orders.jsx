import { useEffect, useState } from 'react';
import api from '../api/api';
import { io } from 'socket.io-client';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    const socket = io();
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(current => current.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => socket.disconnect();
  }, []);

  const getStatusClass = (status) => {
    const map = { Pending: 'status-pending', Preparing: 'status-preparing', Ready: 'status-ready', 'On The Way': 'status-on-the-way', Delivered: 'status-delivered', Cancelled: 'status-cancelled' };
    return `status-badge ${map[status] || ''}`;
  };

  const getPaymentClass = (status) => {
    const map = { Pending: 'payment-pending', Paid: 'payment-paid', Failed: 'payment-failed' };
    return `status-badge ${map[status] || ''}`;
  };

  if (loading) {
    return (
      <section className="section">
        <p className="loading-text">Loading your orders...</p>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="page-header">
        <h2>📦 My Orders</h2>
        <p>Track your order status and history.</p>
      </div>
      {orders.length ? (
        <div className="my-orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
              <div className="order-card-header">
                <div>
                  <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span className={getStatusClass(order.status)}>{order.status}</span>
                    <span className={getPaymentClass(order.paymentStatus)}>{order.paymentStatus}</span>
                  </div>
                </div>
              </div>
              <div className="order-details">
                <p><strong>Address:</strong> {order.deliveryAddress}</p>
                <p><strong>Method:</strong> {order.paymentMethod || 'Cash'}</p>
                <div className="order-items-list">
                  {order.items.map((item, idx) => (
                    <div key={item.menuItem?._id || idx} className="order-item-row" style={{ alignItems: 'center' }}>
                      {item.menuItem?.imageUrl && (
                        <img src={item.menuItem.imageUrl} alt={item.menuItem?.title || 'Item'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                      )}
                      <span style={{ flex: 1 }}>{item.menuItem?.title || 'Unknown Item'}</span>
                      <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>× {item.quantity}</span>
                    </div>
                  ))}
                </div>
                <p className="order-total">Total: Rs. {order.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📭</p>
          <p>No orders found. Start by adding items from the menu!</p>
        </div>
      )}
    </section>
  );
}

export default Orders;