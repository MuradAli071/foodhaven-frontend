import { useState } from 'react';

function Order({ cart, removeFromCart, updateQuantity, placeOrder, loading }) {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [message, setMessage] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await placeOrder(address, paymentMethod);
    setMessage(response.message);
    if (response.success) {
      setAddress('');
      setPaymentMethod('Cash');
    }
  };

  return (
    <section className="section">
      <div className="page-header">
        <h2>🛒 Your Order</h2>
        <p>Review your selections and complete checkout with delivery details.</p>
      </div>
      {!cart.length ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</p>
          <p style={{ fontSize: '1.1rem' }}>Your cart is empty.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add tasty items from the menu to get started!</p>
        </div>
      ) : (
        <div className="order-layout">
          <div className="order-list">
            {cart.map((item) => (
              <div key={item.menuItem} className="order-item">
                <div>
                  <h4>{item.title}</h4>
                  <span className="price">Rs. {item.price.toLocaleString()}</span>
                </div>
                <div className="order-controls">
                  <input
                    type="number"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => updateQuantity(item.menuItem, Number(e.target.value))}
                  />
                  <button className="button secondary" onClick={() => removeFromCart(item.menuItem)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.85rem' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="order-summary" style={{ display: 'grid', gap: '1rem', alignContent: 'start' }}>
            <h3>Checkout</h3>
            <p style={{ fontSize: '1.2rem' }}>Total: <strong className="price">Rs. {total.toLocaleString()}</strong></p>
            <label style={{ display: 'grid', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Delivery Address
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, city, notes"
                style={{ padding: '0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: '10px', minHeight: '80px', resize: 'vertical' }}
              />
              <button
                type="button"
                className="button secondary"
                style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setMessage('Fetching exact address...');
                        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                          .then(res => res.json())
                          .then(data => {
                            if (data && data.display_name) {
                              setAddress(data.display_name);
                              setMessage('Address found!');
                            } else {
                              setAddress(`Lat: ${latitude}, Lng: ${longitude}`);
                              setMessage('Could not resolve exact address.');
                            }
                          })
                          .catch(() => {
                            setAddress(`Lat: ${latitude}, Lng: ${longitude}`);
                            setMessage('Failed to fetch address. Using coordinates.');
                          });
                      },
                      (error) => setMessage('Unable to get location: ' + error.message),
                      { enableHighAccuracy: true }
                    );
                  } else {
                    setMessage('Geolocation not supported.');
                  }
                }}
              >
                📍 Use Current Location
              </button>
            </label>
            <label style={{ display: 'grid', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Payment Method
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ padding: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text)', borderRadius: '10px' }}
              >
                <option value="Cash">💵 Cash</option>
                <option value="Card">💳 Card</option>
                <option value="Online">🌐 Online</option>
              </select>
            </label>
            <button className="button primary" onClick={handleSubmit} disabled={loading || !address.trim()} style={{ width: '100%' }}>
              {loading ? 'Placing order...' : '🚀 Submit Order'}
            </button>
            {message && <p className="status-message">{message}</p>}
          </div>
        </div>
      )}
    </section>
  );
}

export default Order;
