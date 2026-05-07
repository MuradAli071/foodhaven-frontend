import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/api';

function Register({ login, user }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/auth/register', { name, email, password, phone, address });
      login(response.data.token, response.data.user);
      navigate('/');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <section className="section form-section">
      <div className="page-header">
        <h2>Create Account</h2>
        <p>Register to place orders, save your profile, and access FoodHaven benefits.</p>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Phone
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          Address
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <button className="button primary" type="submit">Register</button>
        {message && <p className="status-message">{message}</p>}
      </form>
    </section>
  );
}

export default Register;
