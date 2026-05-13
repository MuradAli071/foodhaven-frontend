import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    const map = {
      Pending: 'status-pending',
      Preparing: 'status-preparing',
      Ready: 'status-ready',
      'On The Way': 'status-on-the-way',
      Delivered: 'status-delivered',
      Cancelled: 'status-cancelled'
    };
    return `status-badge ${map[status] || ''}`;
  };

  const getPaymentClass = (status) => {
    const map = {
      Pending: 'payment-pending',
      Paid: 'payment-paid',
      Failed: 'payment-failed'
    };
    return `status-badge ${map[status] || ''}`;
  };

  if (loading) {
    return (
      <section className="orders-section">
        <div className="page-header">
          <div className="form-icon">📦</div>
          <h2>Your Orders</h2>
          <p>Track and manage your order history</p>
        </div>
        <p className="loading-text">Loading your orders...</p>
      </section>
    );
  }

  return (
    <section className="orders-section">
      <div className="page-header">
        <div className="form-icon">📦</div>
        <h2>Your Orders</h2>
        <p>Track and manage your order history</p>
      </div>

      {orders.length > 0 ? (
        <div className="my-orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className={getStatusClass(order.status)}>{order.status}</span>
                  <span className={getPaymentClass(order.paymentStatus)}>{order.paymentStatus}</span>
                </div>
              </div>

              <div className="order-details">
                <p><strong>Delivery Address:</strong> {order.deliveryAddress}</p>
                <p><strong>Payment Method:</strong> {order.paymentMethod || 'Cash'}</p>

                <div className="order-items-list">
                  {order.items.map((item, idx) => (
                    <div key={item.menuItem?._id || idx} className="order-item-row">
                      {item.menuItem?.imageUrl && (
                        <img
                          src={item.menuItem.imageUrl.startsWith('/')
                            ? `${api.defaults.baseURL.replace('/api', '')}${item.menuItem.imageUrl}`
                            : item.menuItem.imageUrl}
                          alt={item.menuItem?.title || 'Item'}
                        />
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
        <div className="empty-orders">
          <span className="empty-orders-icon">🛒</span>
          <h3>No orders yet</h3>
          <p>Start your culinary journey by exploring our menu!</p>
          <Link to="/menu" className="btn-premium" style={{ marginTop: '1.5rem', display: 'inline-block' }}>
            Explore Menu
          </Link>
        </div>
      )}
    </section>
  );
}

export default Orders;