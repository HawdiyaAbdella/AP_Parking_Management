import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('DRIVER');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { strength: 'weak', percentage: 0, color: 'var(--danger)' };
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;

    if (strength <= 25) return { strength: 'weak', percentage: 25, color: 'var(--danger)' };
    if (strength <= 50) return { strength: 'medium', percentage: 50, color: 'var(--warning)' };
    if (strength <= 75) return { strength: 'strong', percentage: 75, color: 'var(--accent-gold)' };
    return { strength: 'very strong', percentage: 100, color: 'var(--success)' };
  };

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', {
        username,
        email,
        password,
        role,
      });

      const userData = {
        token: response.data.token,
        username: response.data.username,
        role: response.data.role,
      };

      login(userData);
      setSuccess('Account created! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
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
    '@media (max-width: 768px)': {
      display: 'none',
    },
  };

  const parkingGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    padding: '24px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: `1px solid var(--border-subtle)`,
    marginBottom: '40px',
  };

  const getSlotColor = (index) => {
    const colors = ['var(--success)', 'var(--danger)', 'var(--warning)'];
    return colors[index % 3];
  };

  const slotStyle = (index) => ({
    width: '100%',
    aspectRatio: '1',
    background: getSlotColor(index),
    borderRadius: 'var(--radius)',
    opacity: 0.8,
  });

  const gridTextStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontStyle: 'italic',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    marginTop: '24px',
    maxWidth: '300px',
    lineHeight: 1.6,
  };

  const rightPanelStyle = {
    flex: '0 0 60%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 40px',
    overflowY: 'auto',
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
    marginBottom: '32px',
  };

  const formGroupStyle = {
    marginBottom: '24px',
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

  const strengthBarStyle = {
    width: '100%',
    height: '4px',
    background: 'var(--bg-card)',
    borderRadius: '2px',
    marginTop: '8px',
    overflow: 'hidden',
  };

  const strengthFillStyle = {
    height: '100%',
    width: `${passwordStrength.percentage}%`,
    background: passwordStrength.color,
    transition: 'var(--transition)',
  };

  const strengthTextStyle = {
    fontSize: '11px',
    color: passwordStrength.color,
    marginTop: '4px',
    textTransform: 'uppercase',
    fontWeight: '600',
  };

  const roleSelectorStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '12px',
  };

  const roleButtonStyle = (isSelected) => ({
    flex: 1,
    padding: '12px',
    background: isSelected ? 'var(--accent-gold)' : 'transparent',
    color: isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)',
    border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
    borderRadius: 'var(--radius)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'var(--transition)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  });

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
    marginTop: '32px',
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
    marginTop: '20px',
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
    marginBottom: '20px',
    animation: 'slideDown 0.3s ease-out',
  };

  const successStyle = {
    background: 'var(--success)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: 'var(--radius)',
    fontSize: '13px',
    marginBottom: '20px',
    animation: 'slideDown 0.3s ease-out',
  };

  return (
    <div style={containerStyle}>
      <div style={leftPanelStyle}>
        <div style={parkingGridStyle}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={slotStyle(i)} />
          ))}
        </div>
        <div style={gridTextStyle}>
          Join 2,400+ drivers managing their parking smarter
        </div>
      </div>

      <div style={rightPanelStyle}>
        <div style={formContainerStyle}>
          <h1 style={headlineStyle}>Create account</h1>
          <p style={subtextStyle}>Start reserving your parking spots today</p>

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                style={inputStyle}
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-gold)')}
                onBlur={(e) => (e.target.style.borderBottomColor = 'var(--border-subtle)')}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                style={inputStyle}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-gold)')}
                onBlur={(e) => (e.target.style.borderBottomColor = 'var(--border-subtle)')}
                required
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Password</label>
              <div style={passwordContainerStyle}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  style={inputStyle}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-gold)')}
                  onBlur={(e) => (e.target.style.borderBottomColor = 'var(--border-subtle)')}
                  required
                />
                <button
                  type="button"
                  style={eyeButtonStyle}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div style={strengthBarStyle}>
                <div style={strengthFillStyle} />
              </div>
              <div style={strengthTextStyle}>{passwordStrength.strength}</div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Confirm Password</label>
              <div style={passwordContainerStyle}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  style={inputStyle}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={(e) => (e.target.style.borderBottomColor = 'var(--accent-gold)')}
                  onBlur={(e) => (e.target.style.borderBottomColor = 'var(--border-subtle)')}
                  required
                />
                <button
                  type="button"
                  style={eyeButtonStyle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Account Type</label>
              <div style={roleSelectorStyle}>
                <button
                  type="button"
                  style={roleButtonStyle(role === 'DRIVER')}
                  onClick={() => setRole('DRIVER')}
                >
                  Driver
                </button>
                <button
                  type="button"
                  style={roleButtonStyle(role === 'ADMIN')}
                  onClick={() => setRole('ADMIN')}
                >
                  Admin
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div style={linkStyle}>
            Already have an account?{' '}
            <Link to="/login" style={linkTextStyle}>
              Sign in →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
