import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Layout({ user, cartCount, logout, children }) {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('foodhavenTheme') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('foodhavenTheme', theme);
    } catch (e) {
      // Ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const isActive = (path) => location.pathname === path;

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Link to="/">🍽️ FoodHaven</Link>
        </div>
        
        <div className="topbar-actions">
          <button className="button-link theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {!isMenuOpen && (
            <button className="menu-toggle" onClick={toggleMenu} aria-label="Open menu">
              ☰
            </button>
          )}
        </div>

        <nav className={isMenuOpen ? 'nav-open' : ''}>
          <button className="menu-close" onClick={toggleMenu} aria-label="Close menu">✕</button>
          <div className="nav-links">
            <Link to="/menu" style={isActive('/menu') ? { color: '#f97316' } : {}}>Menu</Link>
            <Link to="/order" style={isActive('/order') ? { color: '#f97316' } : {}}>
              🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            {user && <Link to="/orders" style={isActive('/orders') ? { color: '#f97316' } : {}}>My Orders</Link>}
            {user ? (
              <>
                <Link to="/profile" style={isActive('/profile') ? { color: '#f97316' } : {}}>👤 Profile</Link>
                {String(user.role).toLowerCase() === 'admin' && (
                  <Link to="/admin" style={isActive('/admin') ? { color: '#f97316' } : {}}>⚙️ Admin Panel</Link>
                )}
                <button 
                  className="button-link logout-btn" 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to logout?')) {
                      logout();
                    }
                  }}
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={isActive('/login') ? { color: '#f97316' } : {}}>Login</Link>
                <Link to="/register" className="button primary register-btn">Register</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <p>© 2026 FoodHaven Restaurant — Serving fresh local favorites with modern hospitality.</p>
      </footer>
    </div>
  );
}

export default Layout;
