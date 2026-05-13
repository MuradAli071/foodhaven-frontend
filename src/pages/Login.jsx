import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/api';

function Login({ login, user }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <section className="section form-section">
      <div className="page-header">
        <h2>Login</h2>
        <p>Access FoodHaven features with your account.</p>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="button primary" type="submit">Login</button>
        {message && <p className="status-message">{message}</p>}
      </form>
    </section>
  );
}

export default Login;
