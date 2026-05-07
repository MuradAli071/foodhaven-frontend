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
    const stored = localStorage.getItem('foodhavenUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem('foodhavenCart');
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('foodhavenToken');
    if (token) {
      api.get('/auth/me')
        .then((response) => {
          setUser(response.data.user);
          localStorage.setItem('foodhavenUser', JSON.stringify(response.data.user));
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('foodhavenCart', JSON.stringify(cart));
  }, [cart]);

  const login = (token, userData) => {
    localStorage.setItem('foodhavenToken', token);
    localStorage.setItem('foodhavenUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('foodhavenToken');
    localStorage.removeItem('foodhavenUser');
    localStorage.removeItem('foodhavenCart');
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
          <Route path="/order" element={<Order cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} placeOrder={placeOrder} loading={loading} />} />
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
