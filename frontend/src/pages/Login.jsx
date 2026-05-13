import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

function Login({ login, user }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <div className="page-header">
        <div className="form-icon">🍽️</div>
        <h2>Welcome Back</h2>
        <p>Sign in to continue your culinary journey</p>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button className="button primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {message && <p className="status-message">{message}</p>}

        <div className="form-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </form>
    </section>
  );
}

export default Login;
