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
    <div className="container mt-4 mb-4">
      <h2 className="section-title">Finalize Your Order</h2>
      
      <div className="checkout-grid">
        <div className="order-items-column">
          <h3 className="mb-4">Selected Items</h3>
          {cart.map((item) => (
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
            <h3 className="mb-4">Delivery Details</h3>
            
            <div className="form-group mb-4">
              <label>Delivery Address</label>
              <textarea 
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Where should we deliver your feast?"
                rows="4"
              />
              <button type="button" className="btn-location" onClick={handleLocation}>
                📍 Use My Exact Location
              </button>
            </div>

            <div className="form-group mb-4">
              <label>Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Cash">Cash on Delivery</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Online">Online Banking</option>
              </select>
            </div>

            <hr className="divider" />
            
            <div className="total-row mb-4">
              <span>Grand Total</span>
              <span className="price">Rs. {total.toLocaleString()}</span>
            </div>

            {user?.role === 'admin' ? (
              <div className="admin-notice">
                Admins cannot place orders. Please use a customer account.
              </div>
            ) : (
              <button 
                className="btn-premium w-100" 
                onClick={handleSubmit} 
                disabled={loading || !address.trim()}
              >
                {loading ? 'CONFIRMING...' : 'PLACE ORDER NOW'}
              </button>
            )}

            {status && (
              <div className={`mt-4 status-text ${status.includes('SUCCESS') ? 'success' : 'info'}`}>
                {status}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }
        .checkout-item-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          animation: fadeInUp 0.5s ease forwards;
        }
        .qty-control {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #0b1121;
          padding: 5px 12px;
          border-radius: 20px;
          margin-bottom: 10px;
        }
        .qty-control button {
          background: transparent;
          border: none;
          color: var(--primary);
          font-size: 1.2rem;
          cursor: pointer;
          width: 30px;
        }
        .btn-remove {
          background: transparent;
          border: none;
          color: #ef4444;
          font-size: 0.8rem;
          cursor: pointer;
          text-decoration: underline;
        }
        .summary-glass-card {
          background: var(--bg-card);
          border: 1px solid var(--primary);
          padding: 2.5rem;
          border-radius: 24px;
          position: sticky;
          top: 100px;
          box-shadow: var(--shadow-gold);
        }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: var(--text-muted); }
        .form-group textarea, .form-group select {
          width: 100%;
          background: #0b1121;
          border: 1px solid var(--border);
          color: #fff;
          padding: 12px;
          border-radius: 8px;
          font-family: inherit;
        }
        .btn-location {
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid var(--primary);
          color: var(--primary);
          padding: 8px 12px;
          border-radius: 6px;
          margin-top: 10px;
          font-size: 0.85rem;
          cursor: pointer;
          width: 100%;
          transition: all 0.3s;
        }
        .btn-location:hover { background: var(--primary); color: #000; }
        .divider { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
        .total-row { display: flex; justify-content: space-between; font-size: 1.5rem; font-weight: 700; }
        .admin-notice { background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 1rem; border-radius: 8px; font-size: 0.9rem; text-align: center; }
        .status-text { padding: 10px; border-radius: 6px; font-size: 0.9rem; text-align: center; }
        .status-text.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
        .status-text.info { background: rgba(251, 191, 36, 0.05); color: var(--primary); }
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
