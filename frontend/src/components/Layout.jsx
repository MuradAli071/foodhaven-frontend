import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Layout({ user, cartCount, logout, children }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <div className="app-shell">
      {/* Overlay for mobile drawer */}
      <div 
        className={`drawer-overlay ${isMenuOpen ? 'open' : ''}`} 
        onClick={() => setIsMenuOpen(false)}
      ></div>

      <header className={`topbar-premium ${scrolled ? 'scrolled' : ''}`}>
        <div className="topbar-container">
          <div className="brand">
            <Link to="/">FOODHAVEN</Link>
          </div>
          
          <nav className="nav-desktop">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            <Link to="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`}>Menu</Link>
            <Link to="/order" className={`nav-link ${isActive('/order') ? 'active' : ''}`}>
              Cart {cartCount > 0 && <span className="cart-badge-dot">{cartCount}</span>}
            </Link>
            {user && <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>My Orders</Link>}
            
            {user ? (
              <div className="user-actions">
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>Profile</Link>
                {String(user.role).toLowerCase() === 'admin' && (
                  <Link to="/admin" className="admin-pill">Admin Panel</Link>
                )}
                <button className="btn-logout" onClick={() => window.confirm('Logout?') && logout()}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-premium-sm">Login</Link>
            )}
          </nav>

          <button className="mobile-toggle" onClick={() => setIsMenuOpen(true)} aria-label="Open Menu">
            ☰
          </button>
        </div>
      </header>

      {/* Right Side Drawer for Mobile */}
      <aside className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="brand">FOODHAVEN</div>
          <button className="close-drawer" onClick={() => setIsMenuOpen(false)} aria-label="Close Menu">
            ✕
          </button>
        </div>
        <div className="drawer-content">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/menu" className={isActive('/menu') ? 'active' : ''}>Menu</Link>
          <Link to="/order" className={isActive('/order') ? 'active' : ''}>
            Cart {cartCount > 0 && <span className="cart-badge-inline">{cartCount}</span>}
          </Link>
          {user && <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>My Orders</Link>}
          
          <div className="drawer-divider"></div>
          
          {user ? (
            <>
              <Link to="/profile" className={isActive('/profile') ? 'active' : ''}>Profile</Link>
              {String(user.role).toLowerCase() === 'admin' && (
                <Link to="/admin" className="admin-link">Admin Panel</Link>
              )}
              <button className="btn-logout-mobile" onClick={() => {
                if(window.confirm('Logout?')) {
                  logout();
                  setIsMenuOpen(false);
                }
              }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-premium-drawer">Login</Link>
          )}
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer-premium">
        <div className="container footer-grid">
          <div className="footer-col brand-col">
            <h3>FOODHAVEN</h3>
            <p>Elevating the art of dining through professional culinary excellence and seamless digital experiences.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/menu">Menu</Link>
            <Link to="#">About</Link>
            <Link to="#">Contact</Link>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <Link to="/order">Online Ordering</Link>
            <Link to="#">Reservations</Link>
            <Link to="#">Catering</Link>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
            <a href="#">TikTok</a>
            <a href="mailto:hello@foodhaven.com">Email Us</a>
          </div>
        </div>
        <div className="footer-bottom container">
          <p>© 2026 FoodHaven Restaurant Group. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
