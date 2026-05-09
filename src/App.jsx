import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api/api';
import Layout from './components/Layout';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('foodhavenUser');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('foodhavenCart');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('foodhavenToken');
      if (token) {
        api.get('/auth/me')
          .then((response) => {
            setUser(response.data.user);
            try { localStorage.setItem('foodhavenUser', JSON.stringify(response.data.user)); } catch (e) {}
          })
          .catch(() => {
            logout();
          });
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('foodhavenCart', JSON.stringify(cart)); } catch (e) {}
    
    // Warn when leaving with items in cart
    const handleBeforeUnload = (e) => {
      if (cart.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [cart]);

  // Handle Mobile Back Button for Exit Confirmation
  useEffect(() => {
    const handlePopState = (e) => {
      // If we are at the root path and trying to go back
      if (window.location.pathname === '/' || window.location.pathname === '/home') {
        if (window.confirm('Do you want to exit and logout?')) {
          logout();
          // Allow exit
        } else {
          // Stay on site by pushing the current state back
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    // Push an initial state so we have something to "pop"
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]); // Re-bind if user changes to ensure logout has correct closure

  const login = (token, userData) => {
    try {
      localStorage.setItem('foodhavenToken', token);
      localStorage.setItem('foodhavenUser', JSON.stringify(userData));
    } catch (e) {}
    setUser(userData);
  };

  const logout = () => {
    try {
      localStorage.removeItem('foodhavenToken');
      localStorage.removeItem('foodhavenUser');
      localStorage.removeItem('foodhavenCart');
    } catch (e) {}
    setUser(null);
    setCart([]);
  };

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.menuItem === item._id);
      if (existing) {
        return current.map((entry) =>
          entry.menuItem === item._id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...current, { menuItem: item._id, title: item.title, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (menuItemId) => {
    setCart((current) => current.filter((entry) => entry.menuItem !== menuItemId));
  };

  const updateQuantity = (menuItemId, quantity) => {
    setCart((current) =>
      current.map((entry) =>
        entry.menuItem === menuItemId ? { ...entry, quantity: Math.max(1, quantity) } : entry
      )
    );
  };

  const placeOrder = async (deliveryAddress, paymentMethod) => {
    if (!user) {
      return { success: false, message: 'Please log in to place your order.' };
    }
    if (String(user.role).toLowerCase() === 'admin') {
      return { success: false, message: 'Admins cannot place orders.' };
    }
    if (!cart.length) {
      return { success: false, message: 'Your cart is empty.' };
    }
    try {
      setLoading(true);
      await api.post('/orders', { items: cart, deliveryAddress, paymentMethod });
      setCart([]);
      return { success: true, message: 'Order placed successfully!' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Order failed.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrowserRouter>
      <Layout user={user} cartCount={cart.length} logout={logout}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu addToCart={addToCart} />} />
          <Route path="/order" element={<Order cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} placeOrder={placeOrder} loading={loading} user={user} />} />
          <Route path="/orders" element={user ? <Orders /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login login={login} user={user} />} />
          <Route path="/register" element={<Register login={login} user={user} />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={String(user?.role).toLowerCase() === 'admin' ? <AdminDashboard addToCart={addToCart} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
