import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isMobile = window.innerWidth <= 768;

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '64px',
    background: 'rgba(10, 10, 10, 0.92)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '40px',
    paddingRight: '40px',
    zIndex: 1000,
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const logoBracketStyle = {
    width: '24px',
    height: '24px',
    border: '2px solid var(--accent-gold)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'var(--accent-gold)',
  };

  const logoTextStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '18px',
    fontStyle: 'italic',
    color: 'var(--accent-gold)',
    letterSpacing: '0.15em',
    fontWeight: '400',
  };

  const rightMenuStyle = {
    display: isMobile && !mobileMenuOpen ? 'none' : 'flex',
    alignItems: 'center',
    gap: '24px',
    position: isMobile ? 'absolute' : 'static',
    top: isMobile ? '64px' : 'auto',
    right: 0,
    left: isMobile ? 0 : 'auto',
    background: isMobile ? 'var(--bg-secondary)' : 'transparent',
    borderBottom: isMobile ? '1px solid var(--border-subtle)' : 'none',
    padding: isMobile ? '20px 40px' : '0',
    flexDirection: isMobile ? 'column' : 'row',
    width: isMobile ? '100%' : 'auto',
  };

  const signInLinkStyle = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  };

  const buttonStyle = {
    background: 'var(--accent-gold)',
    color: 'var(--bg-primary)',
    padding: '10px 22px',
    borderRadius: 'var(--radius)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const welcomeTextStyle = {
    color: 'var(--text-secondary)',
    fontSize: '13px',
  };

  const dashboardLinkStyle = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  };

  const logoutButtonStyle = {
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '8px 16px',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  };

  const hamburgerStyle = {
    display: isMobile ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  };

  const hamburgerLineStyle = {
    width: '24px',
    height: '2px',
    background: 'var(--accent-gold)',
  };

  return (
    <>
      <nav style={navbarStyle}>
        <Link to="/" style={logoStyle}>
          <div style={logoBracketStyle}>P</div>
          <span style={logoTextStyle}>PARKWISE</span>
        </Link>

        <button
          style={hamburgerStyle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span style={hamburgerLineStyle} />
          <span style={hamburgerLineStyle} />
          <span style={hamburgerLineStyle} />
        </button>

        <div style={rightMenuStyle}>
          {!user ? (
            <>
              <Link
                to="/login"
                style={signInLinkStyle}
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link to="/register" style={buttonStyle}>
                Get Started
              </Link>
            </>
          ) : (
            <>
              <span style={welcomeTextStyle}>Welcome, {user.username}</span>
              <Link
                to="/dashboard"
                style={dashboardLinkStyle}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                style={logoutButtonStyle}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
