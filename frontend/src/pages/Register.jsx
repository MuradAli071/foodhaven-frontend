import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function Register({ login, user }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/auth/register', formData);
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <div className="page-header">
        <div className="form-icon">✨</div>
        <h2>Create Account</h2>
        <p>Join FoodHaven and unlock exclusive benefits</p>
      </div>
      <form className="form-card" onSubmit={handleSubmit} style={{ maxWidth: '520px' }}>
        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your@email.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          required
        />

        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+92 300 1234567"
        />

        <label>Delivery Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="House #, Street, City, Province"
          rows="3"
        />

        <button className="button primary" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        {message && <p className="status-message">{message}</p>}

        <div className="form-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </form>
    </section>
  );
}

export default Register;
