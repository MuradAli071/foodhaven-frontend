import { Link, useLocation } from 'react-router-dom';

function Layout({ user, cartCount, logout, children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <Link to="/">🍽️ FoodHaven</Link>
        </div>
        <nav>
          <Link to="/menu" style={isActive('/menu') ? { color: '#f97316', background: 'rgba(249,115,22,0.1)' } : {}}>Menu</Link>
          <Link to="/order" style={isActive('/order') ? { color: '#f97316', background: 'rgba(249,115,22,0.1)' } : {}}>
            🛒 Cart {cartCount > 0 && <span style={{ background: '#f97316', color: '#fff', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', marginLeft: '0.25rem' }}>{cartCount}</span>}
          </Link>
          {user && <Link to="/orders" style={isActive('/orders') ? { color: '#f97316', background: 'rgba(249,115,22,0.1)' } : {}}>My Orders</Link>}
          {user ? (
            <>
              <Link to="/profile" style={isActive('/profile') ? { color: '#f97316', background: 'rgba(249,115,22,0.1)' } : {}}>Profile</Link>
              {String(user.role).toLowerCase() === 'admin' && (
                <Link to="/admin" style={isActive('/admin') ? { color: '#f97316', background: 'rgba(249,115,22,0.1)' } : {}}>⚙️ Admin</Link>
              )}
              <button className="button-link" onClick={logout} style={{ color: '#ef4444' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={isActive('/login') ? { color: '#f97316', background: 'rgba(249,115,22,0.1)' } : {}}>Login</Link>
              <Link to="/register" className="button primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Register</Link>
            </>
          )}
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
