import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Layout({ user, cartCount, logout, children }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Link to="/">FOODHAVEN</Link>
        </div>
        
        <nav className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/menu" className={isActive('/menu') ? 'active' : ''}>Menu</Link>
          <Link to="/order" className={isActive('/order') ? 'active' : ''}>
            Cart {cartCount > 0 && <span className="cart-badge-dot">{cartCount}</span>}
          </Link>
          {user && <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>My Orders</Link>}
          
          {user ? (
            <div className="user-nav">
              <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>Profile</Link>
              {String(user.role).toLowerCase() === 'admin' && (
                <Link to="/admin" className="admin-pill">Admin Panel</Link>
              )}
              <button className="btn-logout" onClick={() => window.confirm('Logout?') && logout()}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">Login</Link>
          )}
        </nav>

        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer-v2">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h3>FOODHAVEN</h3>
            <p>Elevating the art of dining through professional culinary excellence and seamless digital experiences.</p>
          </div>
          <div className="footer-info">
            <p>© 2026 FoodHaven Restaurant Group. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .cart-badge-dot {
          background: var(--primary);
          color: #000;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 5px;
          font-weight: 700;
        }
        .admin-pill {
          background: rgba(251, 191, 36, 0.1);
          color: var(--primary) !important;
          padding: 4px 12px !important;
          border-radius: 20px;
          border: 1px solid var(--primary);
        }
        .btn-logout {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--text-muted);
          padding: 5px 15px;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-logout:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
        .btn-login {
          background: var(--primary);
          color: #000 !important;
          padding: 8px 20px !important;
          border-radius: 5px;
          font-weight: 600;
        }
        .mobile-toggle {
          display: none;
          background: none;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .footer-v2 {
          background: #0b1121;
          padding: 4rem 0;
          border-top: 1px solid var(--border);
          margin-top: auto;
        }
        .footer-grid {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        .footer-brand h3 { margin-bottom: 1rem; color: var(--primary); }
        .footer-brand p { color: var(--text-muted); max-width: 400px; }
        
        @media (max-width: 768px) {
          .mobile-toggle { display: block; }
          .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            height: 0;
            background: var(--bg-main);
            flex-direction: column;
            overflow: hidden;
            transition: height 0.4s var(--transition);
            padding: 0;
          }
          .nav-links.mobile-active {
            height: calc(100vh - 70px);
            padding: 2rem;
          }
          .user-nav {
            flex-direction: column;
            gap: 1rem;
            width: 100%;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;
