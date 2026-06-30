import { useState } from 'react';
import './Login.css';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

async function handleSubmit(event) {
  event.preventDefault();

  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    console.log(response.data);

    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
     localStorage.setItem('user', JSON.stringify(response.data.user));

    navigate('/dashboard');
  } catch (error) {
    const message =
      error.response?.data?.message || 'Unable to connect to the server';

    alert(message);
  }
}

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Welcome back</h1>
        <p>Login to continue to SprintBoard</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button className="login-button" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;