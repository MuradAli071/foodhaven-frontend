import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        <span className="eyebrow">🔥 Welcome to FoodHaven</span>
        <h1>Crafted dining experiences for every appetite.</h1>
        <p>Order premium restaurant dishes online, browse curated menus, and manage your account — all in one seamless experience.</p>
        <div className="hero-actions">
          <Link className="button primary" to="/menu">Explore Menu →</Link>
          <Link className="button secondary" to="/order">🛒 View Cart</Link>
        </div>
      </div>
      <div className="hero-visual">
        <div className="hero-card">
          <h2>🍕 Flavors You'll Love</h2>
          <p>Fast online ordering, secure account management, and live kitchen updates for every guest. Experience the future of dining.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(249,115,22,0.1)', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>🚀</span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Fast Delivery</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>⭐</span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Premium Quality</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>🔒</span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Secure Payment</p>
            </div>
            <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', textAlign: 'center' }}>
              <span style={{ fontSize: '1.5rem' }}>📱</span>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Track Orders</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
