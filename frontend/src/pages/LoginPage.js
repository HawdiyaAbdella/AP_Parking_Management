import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        username,
        password,
      });

      const userData = {
        token: response.data.token,
        username: response.data.username,
        role: response.data.role,
      };

      login(userData);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  };

  const leftPanelStyle = {
    flex: '0 0 40%',
    background: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    position: 'relative',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      display: 'none',
    },
  };

  const backgroundPatternStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: '200px',
    color: 'var(--text-muted)',
    opacity: 0.03,
    overflow: 'hidden',
    pointerEvents: 'none',
    transform: 'rotate(-45deg)',
    whiteSpace: 'pre-wrap',
    lineHeight: 0.8,
  };

  const quoteStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '36px',
    fontStyle: 'italic',
    color: 'var(--text-primary)',
    textAlign: 'center',
    maxWidth: '350px',
    lineHeight: 1.6,
    marginBottom: '60px',
    position: 'relative',
    zIndex: 1,
  };

  const quoteLineStyle = {
    width: '60px',
    height: '3px',
    background: 'var(--accent-gold)',
    margin: '0 auto 24px auto',
  };

  const leftBottomStyle = {
    position: 'absolute',
    bottom: '40px',
    left: '40px',
    fontFamily: 'var(--font-display)',
    fontSize: '14px',
    fontStyle: 'italic',
    color: 'var(--accent-gold)',
    letterSpacing: '0.1em',
    zIndex: 1,
  };

  const rightPanelStyle = {
    flex: '0 0 60%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '400px',
  };

  const headlineStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '44px',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    fontWeight: '400',
    lineHeight: 1.2,
  };

  const subtextStyle = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    marginBottom: '40px',
  };

  const formGroupStyle = {
    marginBottom: '32px',
  };

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: '8px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 0',
    fontSize: '14px',
    borderBottom: `1px solid var(--border-subtle)`,
    background: 'transparent',
    color: 'var(--text-primary)',
    transition: 'var(--transition)',
    boxSizing: 'border-box',
  };

  const inputFocusStyle = {
    ...inputStyle,
    borderBottomColor: 'var(--accent-gold)',
  };

  const passwordContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const eyeButtonStyle = {
    position: 'absolute',
    right: '0',
    background: 'none',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
    transition: 'var(--transition)',
  };

  const submitButtonStyle = {
    width: '100%',
    padding: '14px',
    background: 'var(--accent-gold)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    fontSize: '14px',
    border: 'none',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    marginTop: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  };

  const submitButtonLoadingStyle = {
    ...submitButtonStyle,
    opacity: 0.7,
    cursor: 'not-allowed',
  };

  const spinnerStyle = {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(0, 0, 0, 0.2)',
    borderTop: '2px solid var(--bg-primary)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  };

  const linkStyle = {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    marginTop: '24px',
    textAlign: 'center',
  };

  const linkTextStyle = {
    color: 'var(--accent-gold)',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'var(--transition)',
  };

  const errorStyle = {
    background: 'var(--danger)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    marginBottom: '24px',
    animation: 'slideDown 0.3s ease-out',
  };

  const successStyle = {
    background: 'var(--success)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    marginBottom: '24px',
    animation: 'slideDown 0.3s ease-out',
  };

  return (
    <div style={containerStyle}>
      <div style={leftPanelStyle}>
        <div style={backgroundPatternStyle}>
          {'P '.repeat(100)}
        </div>
        <div style={quoteLineStyle} />
        <div style={quoteStyle}>Every journey starts with a single spot.</div>
        <div style={leftBottomStyle}>PARKWISE</div>
      </div>

      <div style={rightPanelStyle}>
        <div style={formContainerStyle}>
          <h1 style={headlineStyle}>Welcome back</h1>
          <p style={subtextStyle}>Sign in to manage your parking</p>

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-gold)')}
                onBlur={(e) => (e.target.style.borderBottomColor = 'var(--border-subtle)')}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Password</label>
              <div style={passwordContainerStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={inputStyle}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-gold)')}
                  onBlur={(e) => (e.target.style.borderBottomColor = 'var(--border-subtle)')}
                />
                <button
                  type="button"
                  style={eyeButtonStyle}
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseEnter={(e) => (e.target.style.color = 'var(--accent-gold)')}
                  onMouseLeave={(e) => (e.target.style.color = 'var(--text-secondary)')}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              style={loading ? submitButtonLoadingStyle : submitButtonStyle}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={spinnerStyle} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={linkStyle}>
            Don't have an account?{' '}
            <Link to="/register" style={linkTextStyle}>
              Register →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
