import { useState } from 'react';
import { Link } from 'react-router-dom';

function Order({ cart, removeFromCart, updateQuantity, placeOrder, loading, user }) {
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [status, setStatus] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await placeOrder(address, paymentMethod);
    if (response.success) {
      setAddress('');
      setStatus('SUCCESS: Your order has been placed!');
    } else {
      setStatus(`ERROR: ${response.message}`);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation not supported');
      return;
    }

    setStatus('Locating your exact position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`)
          .then(res => res.json())
          .then(data => {
            if (data.display_name) {
              setAddress(data.display_name);
              setStatus('Location verified successfully.');
            } else {
              setAddress(`${latitude}, ${longitude}`);
              setStatus('Coordinates captured.');
            }
          })
          .catch(() => {
            setAddress(`${latitude}, ${longitude}`);
            setStatus('Network error fetching address.');
          });
      },
      (err) => setStatus(`Location Error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!cart.length) {
    return (
      <div className="container text-center" style={{ padding: '8rem 2rem' }}>
        <h2 className="section-title">Your Cart is Empty</h2>
        <p className="text-muted mb-4">It looks like you haven't added any delicacies yet.</p>
        <Link to="/menu" className="btn-premium">EXPLORE THE MENU</Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-4" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="form-icon">🛒</div>
        <h2>Your Cart</h2>
        <p>Review your items and complete your order</p>
      </div>

      <div className="checkout-grid">
        <div className="order-items-column">
          <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Selected Items ({cart.length})</h3>
          {cart.map((item, index) => (
            <div key={item.menuItem} className="checkout-item-card">
              <div className="item-info">
                <h4>{item.title}</h4>
                <p className="text-muted">Rs. {item.price.toLocaleString()} × {item.quantity}</p>
              </div>
              <div className="item-actions">
                <div className="qty-control">
                  <button onClick={() => updateQuantity(item.menuItem, Math.max(1, item.quantity - 1))}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}>+</button>
                </div>
                <button className="btn-remove" onClick={() => removeFromCart(item.menuItem)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="order-summary-column">
          <div className="summary-glass-card">
            <h3 style={{ marginBottom: '2rem', fontSize: '1.3rem' }}>Delivery Details</h3>

            <div className="form-group mb-4">
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Delivery Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address..."
                rows="4"
                style={{
                  width: '100%',
                  background: '#0b1121',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
              />
              <button type="button" className="btn-location" onClick={handleLocation}>
                📍 Use My Current Location
              </button>
            </div>

            <div className="form-group mb-4">
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0b1121',
                  border: '1px solid var(--border)',
                  color: '#fff',
                  padding: '14px',
                  borderRadius: '12px',
                  fontFamily: 'inherit',
                  fontSize: '1rem'
                }}
              >
                <option value="Cash">💵 Cash on Delivery</option>
                <option value="Card">💳 Credit/Debit Card</option>
                <option value="Online">🏦 Online Banking</option>
              </select>
            </div>

            <hr className="divider" style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

            <div className="total-row mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Grand Total</span>
              <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>Rs. {total.toLocaleString()}</span>
            </div>

            {user?.role === 'admin' ? (
              <div className="admin-notice" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1.25rem', borderRadius: '12px', fontSize: '0.95rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                ⚠️ Admins cannot place orders. Please use a customer account.
              </div>
            ) : (
              <button
                className="btn-premium w-100"
                onClick={handleSubmit}
                disabled={loading || !address.trim()}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  fontSize: '1.1rem'
                }}
              >
                {loading ? 'Processing...' : 'Place Order Now'}
              </button>
            )}

            {status && (
              <div
                className={`mt-4 status-text ${status.includes('SUCCESS') ? 'success' : 'info'}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  background: status.includes('SUCCESS') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.05)',
                  color: status.includes('SUCCESS') ? '#22c55e' : 'var(--primary)',
                  border: status.includes('SUCCESS') ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(251, 191, 36, 0.1)'
                }}
              >
                {status}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 3rem;
          align-items: start;
          max-width: 1100px;
          margin: 0 auto;
        }
        .checkout-item-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
          animation: fadeInUp 0.5s ease forwards;
        }
        .checkout-item-card:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.4);
        }
        .item-info h4 { font-size: 1.1rem; margin-bottom: 0.25rem; font-family: 'Inter', sans-serif; }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #0b1121;
          padding: 6px 14px;
          border-radius: 25px;
          margin-bottom: 10px;
        }
        .qty-control button {
          background: transparent;
          border: none;
          color: var(--primary);
          font-size: 1.3rem;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border-radius: 50%;
        }
        .qty-control button:hover {
          background: rgba(251, 191, 36, 0.1);
        }
        .btn-remove {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-remove:hover { text-decoration: underline; }
        .summary-glass-card {
          background: var(--bg-card);
          border: 1px solid var(--primary);
          padding: 2.5rem;
          border-radius: 24px;
          position: sticky;
          top: 110px;
          box-shadow: var(--shadow-gold);
        }
        .btn-location {
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.3);
          color: var(--primary);
          padding: 10px 16px;
          border-radius: 10px;
          margin-top: 12px;
          font-size: 0.9rem;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s;
          font-weight: 500;
        }
        .btn-location:hover {
          background: var(--primary);
          color: #000;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(251, 191, 36, 0.3);
        }
        .admin-notice { border: 1px solid rgba(239, 68, 68, 0.2); }
        .w-100 { width: 100%; }

        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr; }
          .summary-glass-card { position: static; }
        }
      `}</style>
    </div>
  );
}

export default Order;
