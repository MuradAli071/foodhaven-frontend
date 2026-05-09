import { useEffect, useState } from 'react';
import api from '../api/api';
import { io } from 'socket.io-client';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  prepTime: '',
  available: true,
};

function AdminDashboard({ addToCart }) {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('All');
  const [heroBgFile, setHeroBgFile] = useState(null);
  const [heroBgPreview, setHeroBgPreview] = useState('');
  const [currentHeroBg, setCurrentHeroBg] = useState('');

  useEffect(() => { 
    refreshAdminData(); 
    
    // Socket connection
    const socket = io();
    socket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
      setMessage(`🔔 New order received: #${order._id.slice(-6).toUpperCase()}`);
    });
    
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const refreshAdminData = async () => {
    setLoading(true);
    try {
      // Small delay to allow DB consistency in some cloud environments
      await new Promise(r => setTimeout(r, 800));
      const [statsRes, ordersRes, usersRes, menuRes, settingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders'),
        api.get('/admin/users'),
        api.get('/admin/menu'),
        api.get('/settings'),
      ]);
      setStats(statsRes.data);
      setOrders(ordersRes.data);
      setUsers(usersRes.data);
      setMenuItems(menuRes.data);
      setCurrentHeroBg(settingsRes.data.heroBackgroundImage || '');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  };

  const resetForm = () => { setEditingId(null); setFormData(emptyForm); setImageFile(null); setImagePreview(''); setMessage(''); };

  const handleEditItem = (item) => {
    setEditingId(item._id);
    setFormData({ 
      title: item.title, 
      description: item.description || '', 
      price: item.price, 
      category: item.category || '', 
      imageUrl: item.imageUrl || '', 
      prepTime: item.prepTime || '',
      available: item.available,
    });
    setActiveTab('menu');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      setLoading(true);
      await api.delete(`/menu/${itemId}`);
      setMenuItems((current) => current.filter((item) => item._id !== itemId));
      setMessage('✅ Menu item deleted successfully.');
      refreshAdminData();
    } catch (error) {
      console.error('Delete error:', error);
      setMessage(error.response?.data?.message || '❌ Failed to delete. This item might be referenced elsewhere.');
    } finally { setLoading(false); }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl || '';
    try {
      const form = new FormData();
      form.append('image', imageFile);
      const response = await api.post('/menu/upload', form);
      return response.data.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload image.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.title || !formData.category || !formData.price) {
      setMessage('⚠️ Please provide a title, category, and valid price.');
      return;
    }
    
    setLoading(true);
    const originalMenuItems = [...menuItems];
    
    try {
      const imageUrl = await uploadImage();
      const sanitizedPrice = Number(String(formData.price).replace(/[^0-9.]/g, ''));
      const payload = { ...formData, price: sanitizedPrice, imageUrl };
      
      // Optimistic UI update for better feel
      if (!editingId) {
        const tempId = Date.now().toString();
        setMenuItems(prev => [{ ...payload, _id: tempId, isOptimistic: true }, ...prev]);
      }

      if (editingId) {
        const response = await api.put(`/menu/${editingId}`, payload);
        setMessage('✅ Menu item updated successfully.');
        setMenuItems(current => current.map(item => item._id === editingId ? response.data : item));
      } else {
        const response = await api.post('/menu', payload);
        setMessage('✅ Menu item added to the menu.');
        setMenuItems(current => [response.data, ...current.filter(i => !i.isOptimistic)]);
      }
      
      resetForm();
      // Sync other dashboard data in background
      refreshAdminData();
    } catch (error) {
      console.error('Submission Error:', error);
      setMenuItems(originalMenuItems); // Rollback on error
      const errorMsg = error.response?.data?.message || error.message || '❌ Could not save. Please check your connection and try again.';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((current) => current.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      setMessage(`✅ Order status → ${newStatus}`);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Status update failed.');
    }
  };

  const handlePaymentChange = async (orderId, newPaymentStatus) => {
    try {
      await api.put(`/orders/${orderId}/payment`, { paymentStatus: newPaymentStatus });
      setOrders((current) => current.map((o) => (o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o)));
      setMessage(`✅ Payment → ${newPaymentStatus}`);
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Payment update failed.');
    }
  };

  const handleHeroBgChange = (event) => {
    const file = event.target.files[0];
    if (file) { setHeroBgFile(file); setHeroBgPreview(URL.createObjectURL(file)); }
  };

  const handleHeroBgUpload = async () => {
    if (!heroBgFile) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('image', heroBgFile);
      const response = await api.post('/settings/upload-hero', form);
      setCurrentHeroBg(response.data.imageUrl);
      setMessage('✅ Hero background updated successfully.');
      setHeroBgFile(null);
      setHeroBgPreview('');
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Background upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: 'Cancelled' });
      setOrders((current) => current.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o)));
      setMessage('✅ Order cancelled.');
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Cancel failed.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Permanently delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders((current) => current.filter((o) => o._id !== orderId));
      setSelectedOrders((current) => current.filter((id) => id !== orderId));
      setMessage('✅ Order deleted.');
      await refreshAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Delete failed.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}" and all their orders? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((current) => current.filter((u) => u._id !== userId));
      setMessage(`✅ User "${userName}" deleted.`);
      await refreshAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || '❌ Delete user failed.');
    }
  };

  const handleOrderSelection = (orderId) => {
    setSelectedOrders((current) => current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]);
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (!selectedOrders.length) { setMessage('⚠️ Select orders first.'); return; }
    try {
      await Promise.all(selectedOrders.map((id) => api.put(`/orders/${id}/status`, { status: newStatus })));
      setOrders((current) => current.map((o) => selectedOrders.includes(o._id) ? { ...o, status: newStatus } : o));
      setSelectedOrders([]);
      setMessage(`✅ ${selectedOrders.length} orders → ${newStatus}`);
    } catch (error) { setMessage('❌ Bulk update failed.'); }
  };

  const getStatusClass = (status) => {
    const m = { Pending: 'status-pending', Preparing: 'status-preparing', Ready: 'status-ready', 'On The Way': 'status-on-the-way', Delivered: 'status-delivered', Cancelled: 'status-cancelled' };
    return `status-badge ${m[status] || ''}`;
  };
  const getPaymentClass = (status) => {
    const m = { Pending: 'payment-pending', Paid: 'payment-paid', Failed: 'payment-failed' };
    return `status-badge ${m[status] || ''}`;
  };

  const filteredOrders = orderFilter === 'All' ? orders : orders.filter((o) => o.status === orderFilter);

  const tabs = [
    { key: 'menu', label: '📋 Menu Management' },
    { key: 'orders', label: '📦 Orders', count: orders.length },
    { key: 'users', label: '👥 Users', count: users.length },
    { key: 'settings', label: '⚙️ Site Settings' },
  ];

  return (
    <section className="section admin-section">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Manage FoodHaven menu items, orders, and users from one place.</p>
      </div>

      {stats ? (
        <div className="stats-grid">
          <div className="stat-card"><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
          <div className="stat-card"><h3>{stats.totalOrders}</h3><p>Total Orders</p></div>
          <div className="stat-card"><h3>{stats.totalMenuItems}</h3><p>Menu Items</p></div>
          <div className="stat-card"><h3>Rs. {stats.revenue.toLocaleString()}</h3><p>Revenue</p></div>
        </div>
      ) : (
        <p className="loading-text">Loading admin stats...</p>
      )}

      <div className="admin-topbar">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" className={activeTab === tab.key ? 'button primary' : 'button secondary'} onClick={() => setActiveTab(tab.key)}>
            {tab.label} {tab.count !== undefined && `(${tab.count})`}
          </button>
        ))}
        <button className="button secondary" onClick={refreshAdminData} title="Sync data with server">🔄 Sync</button>
      </div>

      {message && <div className="status-message admin-status">{message}</div>}

      {/* ========== MENU MANAGEMENT ========== */}
      {activeTab === 'menu' && (
        <div className="admin-panel admin-menu-panel">
          <div className="admin-panel-header">
            <div>
              <h3>{editingId ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}</h3>
              <p>Use this form to add a new dish or update an existing one.</p>
            </div>
            {editingId && <button className="button secondary" onClick={resetForm}>Cancel Edit</button>}
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <label>Title<input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Chicken Sandwich" required /></label>
            <label>Category<input name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Burgers" required /></label>
            <label>Price (PKR)<input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="999" step="1" required /></label>
            <label>Preparation Time<input name="prepTime" value={formData.prepTime} onChange={handleInputChange} placeholder="e.g. 15-20 mins" /></label>
            <label>Description<textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the dish..." /></label>
            <label>Image Upload<input type="file" accept="image/*" onChange={handleImageChange} /></label>
            {imagePreview && (
              <div className="image-preview">
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Preview:</p>
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <label>Image URL (optional)<input name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." /><small style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Use this only for an external image URL.</small></label>
            <label className="checkbox-label"><input name="available" type="checkbox" checked={formData.available} onChange={handleInputChange} />Available for order</label>
            <button className="button primary" type="submit" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}</button>
          </form>

          <div className="admin-list">
            <h3>Current Menu Items ({menuItems.length})</h3>
            {menuItems.length ? menuItems.map((item) => (
              <div key={item._id} className="admin-card menu-item-card">
                <div className="menu-item-info">
                  {item.imageUrl && <img className="menu-item-image" src={item.imageUrl} alt={item.title} />}
                  <div>
                    <h4 style={{ marginBottom: '0.3rem' }}>{item.title}</h4>
                    <p style={{ color: 'var(--muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.category}</p>
                    {item.prepTime && <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>⏱️ {item.prepTime}</p>}
                    <p className="admin-item-description">{item.description}</p>
                    <p className="price" style={{ marginTop: '0.5rem' }}>Rs. {item.price.toLocaleString()}</p>
                    <span className={`badge ${item.available ? 'badge-available' : 'badge-unavailable'}`}>{item.available ? 'Available' : 'Unavailable'}</span>
                  </div>
                </div>
                <div className="admin-item-actions">
                  <button className="button secondary" onClick={() => handleEditItem(item)}>✏️ Edit</button>
                  <button className="button secondary" onClick={() => handleDeleteItem(item._id)} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>🗑️ Delete</button>
                  <button type="button" className="button primary" onClick={() => addToCart(item)}>🛒 Add to Cart</button>
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-secondary)' }}>No menu items found.</p>}
          </div>
        </div>
      )}

      {/* ========== ORDER MANAGEMENT ========== */}
      {activeTab === 'orders' && (
        <div className="admin-panel admin-orders-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0 }}>📦 Order Management ({filteredOrders.length})</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'Preparing', 'Ready', 'On The Way', 'Delivered', 'Cancelled'].map((f) => (
                <button key={f} className={`button ${orderFilter === f ? 'primary' : 'secondary'}`} style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', borderRadius: '999px' }} onClick={() => setOrderFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          {selectedOrders.length > 0 && (
            <div className="bulk-actions">
              <p>✔ {selectedOrders.length} selected</p>
              <button className="button secondary" onClick={() => handleBulkStatusUpdate('Preparing')}>Set Preparing</button>
              <button className="button secondary" onClick={() => handleBulkStatusUpdate('Ready')}>Set Ready</button>
              <button className="button secondary" onClick={() => handleBulkStatusUpdate('Delivered')}>Set Delivered</button>
              <button className="button secondary" onClick={() => handleBulkStatusUpdate('Cancelled')} style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>Cancel All</button>
              <button className="button secondary" onClick={() => setSelectedOrders([])} style={{ color: 'var(--muted)' }}>Clear</button>
            </div>
          )}

          {filteredOrders.length ? (
            <div className="order-table">
              {filteredOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => handleOrderSelection(order._id)} style={{ marginTop: '0.25rem' }} />
                      <div>
                        <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                        <div style={{ marginTop: '0.4rem', padding: '0.5rem', background: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                           <p style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                             <span style={{ fontSize: '1rem' }}>👤</span> {order.customer?.name || 'Unknown Customer'}
                           </p>
                           <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0.2rem 0 0 1.4rem' }}>
                             {order.customer?.email || 'No email provided'}
                           </p>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <span className={getStatusClass(order.status)}>{order.status}</span>
                          <span className={getPaymentClass(order.paymentStatus)}>{order.paymentStatus}</span>
                        </div>
                      </div>
                    </div>
                    <div className="order-selects">
                      <label>Status
                        <select value={order.status} onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}>
                          {['Pending', 'Preparing', 'Ready', 'On The Way', 'Delivered', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                      <label>Payment
                        <select value={order.paymentStatus} onChange={(e) => handlePaymentChange(order._id, e.target.value)}>
                          {['Pending', 'Paid', 'Failed'].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="order-details">
                    <p><strong>Address:</strong> {order.deliveryAddress}</p>
                    <p><strong>Payment Method:</strong> {order.paymentMethod || 'Cash'}</p>
                    <div className="order-items-list">
                      {order.items.map((item, idx) => (
                        <div key={item.menuItem?._id || idx} className="order-item-row" style={{ alignItems: 'center' }}>
                          {item.menuItem?.imageUrl && (
                            <img src={item.menuItem.imageUrl} alt={item.menuItem?.title || 'Item'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)', flexShrink: 0 }} />
                          )}
                          <span style={{ flex: 1 }}>{item.menuItem?.title || 'Unknown Item'}</span>
                          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>× {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <p className="order-total">Total: Rs. {order.total.toLocaleString()}</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                          <button className="button secondary" onClick={() => handleCancelOrder(order._id)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', borderColor: 'rgba(234,179,8,0.3)', color: '#eab308' }}>
                            ✕ Cancel
                          </button>
                        )}
                        {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                          <button className="button secondary" onClick={() => handleDeleteOrder(order._id)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</p>
              <p>No {orderFilter !== 'All' ? orderFilter.toLowerCase() : ''} orders found.</p>
            </div>
          )}
        </div>
      )}

      {/* ========== USER LIST ========== */}
      {activeTab === 'users' && (
        <div className="admin-panel admin-users-panel">
          <h3 style={{ marginBottom: '1.25rem' }}>👥 Registered Users ({users.length})</h3>
          {users.length ? (
            <div className="users-grid">
              {users.map((userItem) => (
                <div key={userItem._id} className="admin-card user-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div>
                      <h4>{userItem.name}</h4>
                      <p>{userItem.email}</p>
                      <span className={`user-role ${userItem.role === 'admin' ? 'user-role-admin' : 'user-role-user'}`}>{userItem.role}</span>
                    </div>
                    {userItem.role !== 'admin' && (
                      <button
                        className="button secondary"
                        onClick={() => handleDeleteUser(userItem._id, userItem.name)}
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', flexShrink: 0 }}
                        title="Delete user"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>
          )}
        </div>
      )}

      {/* ========== SITE SETTINGS ========== */}
      {activeTab === 'settings' && (
        <div className="admin-panel admin-settings-panel">
          <div className="admin-panel-header">
            <div>
              <h3>⚙️ Site Settings</h3>
              <p>Customize the look and feel of your FoodHaven website.</p>
            </div>
          </div>

          <div className="form-card">
            <h4>Hero Section Background</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Upload a high-quality image to show on the main homepage.
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Current Background:</p>
              {currentHeroBg ? (
                <img 
                  src={currentHeroBg.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${currentHeroBg}` : currentHeroBg} 
                  alt="Current Hero" 
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
              ) : (
                <div style={{ width: '100%', height: '150px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
                  No custom background set
                </div>
              )}
            </div>

            <label>
              Upload New Image
              <input type="file" accept="image/*" onChange={handleHeroBgChange} />
            </label>

            {heroBgPreview && (
              <div className="image-preview" style={{ marginTop: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Preview:</p>
                <img src={heroBgPreview} alt="Hero Preview" style={{ width: '100%', height: '150px' }} />
              </div>
            )}

            <button 
              className="button primary" 
              onClick={handleHeroBgUpload} 
              disabled={loading || !heroBgFile}
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? 'Uploading...' : 'Update Hero Background'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;
