import { useEffect, useState } from 'react';
import api from '../api/api';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
  prepTime: '',
  available: true,
};

function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalUsers: 0 });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [heroBgFile, setHeroBgFile] = useState(null);
  const [heroBgPreview, setHeroBgPreview] = useState('');
  const [currentHeroBg, setCurrentHeroBg] = useState('');

  useEffect(() => { 
    refreshAdminData(); 
  }, []);

  const refreshAdminData = async () => {
    setLoading(true);
    try {
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
      setMessage('Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.imageUrl || '';
    try {
      const form = new FormData();
      form.append('image', imageFile);
      const response = await api.post('/menu/upload', form);
      return response.data.imageUrl;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Upload failed.';
      throw new Error(`IMAGE ERROR: ${errorMsg}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const imageUrl = await uploadImage();
      const payload = { ...formData, imageUrl };
      
      if (editingId) {
        await api.put(`/menu/${editingId}`, payload);
        setMessage('✅ Item updated successfully');
      } else {
        await api.post('/menu', payload);
        setMessage('✅ Item added successfully');
      }
      
      setFormData(emptyForm);
      setEditingId(null);
      setImageFile(null);
      setImagePreview('');
      refreshAdminData();
    } catch (error) {
      setMessage(`❌ ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setEditingId(item._id);
    setImagePreview(item.imageUrl.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${item.imageUrl}` : item.imageUrl);
    setActiveTab('menu');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      refreshAdminData();
      setMessage('Item deleted');
    } catch (error) {
      setMessage('Delete failed');
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
      setMessage('✅ Hero background updated');
      setHeroBgFile(null);
      setHeroBgPreview('');
    } catch (error) {
      setMessage(`❌ Hero upload failed: ${error.response?.data?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'stats', label: 'Dashboard', icon: '📊' },
    { id: 'menu', label: 'Management', icon: '🍽️' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Admin</h2>
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`admin-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span style={{ marginRight: '10px' }}>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </aside>

      <main className="admin-content">
        {message && (
          <div className={`admin-alert ${message.includes('❌') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card">
              <p>Total Revenue</p>
              <h3>Rs. {stats.totalRevenue?.toLocaleString()}</h3>
            </div>
            <div className="stat-card">
              <p>Total Orders</p>
              <h3>{stats.totalOrders}</h3>
            </div>
            <div className="stat-card">
              <p>Active Users</p>
              <h3>{users.length}</h3>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="management-panels">
            <div className="form-container">
              <h3 className="mb-4">{editingId ? 'Edit Collection Item' : 'Add New Item'}</h3>
              <form onSubmit={handleSubmit} className="premium-form">
                <div className="form-group">
                  <label>Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input name="category" value={formData.category} onChange={handleInputChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price (PKR)</label>
                    <input name="price" type="number" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div className="form-group">
                    <label>Prep Time</label>
                    <input name="prepTime" value={formData.prepTime} onChange={handleInputChange} placeholder="e.g. 20 mins" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <input type="file" onChange={handleImageChange} accept="image/*" />
                  {imagePreview && (
                    <div className="admin-image-preview mt-4">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
                <div className="form-actions mt-4">
                  <button type="submit" className="button primary" disabled={loading}>
                    {loading ? 'Processing...' : editingId ? 'Update Item' : 'Add to Collection'}
                  </button>
                  {editingId && (
                    <button type="button" className="button" onClick={() => {setEditingId(null); setFormData(emptyForm); setImagePreview('');}}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="items-list">
              <h3 className="mb-4">Current Collection</h3>
              <div className="admin-items-grid">
                {menuItems.map(item => (
                  <div key={item._id} className="admin-item-card">
                    <img src={item.imageUrl.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${item.imageUrl}` : item.imageUrl} alt="" />
                    <div className="admin-item-info">
                      <h4>{item.title}</h4>
                      <p>{item.category} • Rs. {item.price}</p>
                      <div className="admin-actions mt-4">
                        <button onClick={() => handleEdit(item)} className="button-link">Edit</button>
                        <button onClick={() => handleDelete(item._id)} className="button-link text-danger">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-panel">
            <h3 className="mb-4">Recent Orders</h3>
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6)}</td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td>Rs. {order.totalAmount}</td>
                    <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-panel">
            <h3 className="mb-4">Site Customization</h3>
            <div className="form-card">
              <h4>Hero Background Image</h4>
              <p className="text-muted mb-4">Set the atmosphere for your visitors.</p>
              <div className="current-bg mb-4">
                {currentHeroBg && <img src={currentHeroBg.startsWith('/') ? `${api.defaults.baseURL.replace('/api', '')}${currentHeroBg}` : currentHeroBg} alt="Hero" />}
              </div>
              <input type="file" onChange={handleHeroBgChange} accept="image/*" />
              {heroBgPreview && (
                <div className="image-preview mt-4">
                  <img src={heroBgPreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                </div>
              )}
              <button className="button primary mt-4" onClick={handleHeroBgUpload} disabled={loading || !heroBgFile}>
                {loading ? 'Uploading...' : 'Apply New Background'}
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .admin-tab-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 12px 15px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          margin-bottom: 5px;
          transition: all 0.3s;
        }
        .admin-tab-btn.active {
          background: var(--primary);
          color: #000;
        }
        .admin-alert {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 600;
        }
        .admin-alert.success { background: rgba(34, 197, 94, 0.1); color: #22c55e; border: 1px solid #22c55e; }
        .admin-alert.error { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
        .stat-card { background: var(--bg-card); padding: 2rem; border-radius: 16px; border: 1px solid var(--border); }
        .stat-card h3 { font-size: 2rem; color: var(--primary); margin-top: 0.5rem; }
        
        .management-panels { display: grid; grid-template-columns: 400px 1fr; gap: 3rem; }
        .premium-form .form-group { margin-bottom: 1.5rem; }
        .premium-form label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-muted); }
        .premium-form input, .premium-form textarea {
          width: 100%;
          background: #0b1121;
          border: 1px solid var(--border);
          color: #fff;
          padding: 12px;
          border-radius: 8px;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .admin-items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; }
        .admin-item-card { background: var(--bg-card); border-radius: 12px; overflow: hidden; border: 1px solid var(--border); }
        .admin-item-card img { width: 100%; height: 120px; object-fit: cover; }
        .admin-item-info { padding: 1rem; }
        .admin-item-info h4 { font-size: 1rem; }
        .admin-item-info p { font-size: 0.8rem; color: var(--text-muted); }
        
        .premium-table { width: 100%; border-collapse: collapse; background: var(--bg-card); border-radius: 12px; overflow: hidden; }
        .premium-table th, .premium-table td { text-align: left; padding: 1.25rem; border-bottom: 1px solid var(--border); }
        .status-badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
        .status-badge.pending { background: #f59e0b; color: #000; }
        .status-badge.completed { background: #10b981; color: #fff; }
        
        .current-bg img { width: 100%; height: 150px; object-fit: cover; border-radius: 12px; }
        .admin-image-preview img { width: 100%; height: 200px; object-fit: cover; border-radius: 8px; }
        .text-danger { color: #ef4444 !important; }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
