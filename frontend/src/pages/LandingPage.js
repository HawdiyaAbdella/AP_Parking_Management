import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    const initialSlots = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      status: ['available', 'occupied', 'reserved'][Math.floor(Math.random() * 3)],
    }));
    setSlots(initialSlots);

    const interval = setInterval(() => {
      setSlots((prevSlots) =>
        prevSlots.map((slot) => ({
          ...slot,
          status: Math.random() > 0.7
            ? ['available', 'occupied', 'reserved'][Math.floor(Math.random() * 3)]
            : slot.status,
        }))
      );
    }, Math.random() * 1000 + 2000);

    return () => clearInterval(interval);
  }, []);

  const getSlotColor = (status) => {
    switch (status) {
      case 'available':
        return 'var(--success)';
      case 'occupied':
        return 'var(--danger)';
      case 'reserved':
        return 'var(--warning)';
      default:
        return 'var(--text-muted)';
    }
  };

  const heroContainerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '64px',
    paddingLeft: '60px',
    paddingRight: '60px',
    gap: '60px',
    background: 'var(--bg-primary)',
  };

  const heroLeftStyle = {
    flex: '0 0 55%',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  };

  const headlineStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(52px, 7vw, 96px)',
    lineHeight: 1.1,
    fontWeight: '400',
    color: 'var(--text-primary)',
    margin: 0,
  };

  const headlineGoldStyle = {
    fontStyle: 'italic',
    color: 'var(--accent-gold)',
  };

  const subheadlineStyle = {
    fontSize: '18px',
    color: 'var(--text-secondary)',
    maxWidth: '420px',
    lineHeight: 1.7,
    fontWeight: '400',
  };

  const ctaContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
  };

  const primaryButtonStyle = {
    background: 'var(--accent-gold)',
    color: 'var(--bg-primary)',
    padding: '14px 32px',
    borderRadius: 'var(--radius)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const secondaryButtonStyle = {
    color: 'var(--accent-gold)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  };

  const statStyle = {
    fontSize: '12px',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    letterSpacing: '0.05em',
  };

  const dotStyle = {
    width: '4px',
    height: '4px',
    background: 'var(--accent-gold)',
    borderRadius: '50%',
  };

  const heroRightStyle = {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  };

  const liveBadgeStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--danger)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  };

  const pulseDotStyle = {
    width: '8px',
    height: '8px',
    background: 'var(--danger)',
    borderRadius: '50%',
    animation: 'pulseDot 1.5s infinite',
  };

  const parkingGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '12px',
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-subtle)',
  };

  const slotStyle = (status) => ({
    width: '100%',
    aspectRatio: '1',
    background: getSlotColor(status),
    opacity: status === 'available' ? 1 : 0.6,
    borderRadius: 'var(--radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--bg-primary)',
    animation: status === 'available' ? 'none' : 'slotBlink 2s infinite',
  });

  const howItWorksStyle = {
    padding: '120px 60px',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-subtle)',
  };

  const sectionLabelStyle = {
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--accent-gold)',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    marginBottom: '40px',
  };

  const howHeadlineStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(36px, 5vw, 72px)',
    color: 'var(--text-primary)',
    marginBottom: '80px',
    lineHeight: 1.2,
  };

  const stepsContainerStyle = {
    display: 'flex',
    gap: '80px',
    alignItems: 'flex-start',
  };

  const stepStyle = (offset) => ({
    flex: '0 0 calc(33.333% - 30px)',
    borderLeft: '2px solid var(--accent-gold)',
    paddingLeft: '32px',
    paddingTop: offset ? `${offset}px` : '0',
  });

  const stepNumberStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '64px',
    fontWeight: '400',
    color: 'transparent',
    WebkitTextStroke: '2px var(--accent-gold)',
    lineHeight: 1,
    marginBottom: '12px',
  };

  const stepTitleStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    color: 'var(--text-primary)',
    marginBottom: '12px',
    fontWeight: '400',
  };

  const stepDescStyle = {
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    maxWidth: '280px',
  };

  const featuresStyle = {
    padding: '120px 60px',
    background: 'var(--bg-primary)',
    borderTop: '1px solid var(--border-subtle)',
  };

  const featureTitleStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(36px, 5vw, 72px)',
    color: 'var(--text-primary)',
    marginBottom: '80px',
    lineHeight: 1.2,
  };

  const featureRowStyle = (reverse) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '80px',
    marginBottom: '120px',
    flexDirection: reverse ? 'row-reverse' : 'row',
  });

  const featureTextStyle = {
    flex: '0 0 45%',
  };

  const featureHeadingStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    color: 'var(--accent-gold)',
    marginBottom: '16px',
    fontWeight: '400',
  };

  const featureDescStyle = {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
  };

  const featureVisualStyle = {
    flex: '0 0 45%',
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const ctaBannerStyle = {
    background: 'var(--accent-gold)',
    color: 'var(--bg-primary)',
    padding: '100px 60px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderTop: '1px solid var(--border-strong)',
  };

  const ctaHeadlineStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(36px, 5vw, 72px)',
    color: 'var(--bg-primary)',
    marginBottom: '16px',
    lineHeight: 1.2,
    fontWeight: '400',
  };

  const ctaSubStyle = {
    fontSize: '16px',
    color: 'rgba(10, 10, 10, 0.7)',
    marginBottom: '32px',
  };

  const ctaDarkButtonStyle = {
    background: 'var(--bg-primary)',
    color: 'var(--accent-gold)',
    padding: '14px 32px',
    borderRadius: 'var(--radius)',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    textDecoration: 'none',
    display: 'inline-block',
  };

  const footerStyle = {
    padding: '40px 60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--border-subtle)',
    background: 'var(--bg-primary)',
  };

  const footerLogoStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '16px',
    fontStyle: 'italic',
    color: 'var(--accent-gold)',
    letterSpacing: '0.1em',
  };

  const footerCopyStyle = {
    fontSize: '13px',
    color: 'var(--text-muted)',
  };

  const footerLinksStyle = {
    display: 'flex',
    gap: '32px',
  };

  const footerLinkStyle = {
    fontSize: '13px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
  };

  return (
    <div>
      <section style={heroContainerStyle}>
        <div style={heroLeftStyle}>
          <h1 style={headlineStyle} className="fade-up">
            <span style={headlineGoldStyle}>Smart Parking,</span>
            <br />
              Built for Every Driver.
          </h1>
          <p style={subheadlineStyle} className="fade-up">
            Reserve your spot before you arrive. Real-time availability. Zero frustration.
          </p>
          <div style={ctaContainerStyle} className="fade-up">
            <Link to="/register" style={primaryButtonStyle}>
              Reserve a Spot
            </Link>
            <button style={secondaryButtonStyle}>
              Watch how it works <span style={{ fontSize: '16px' }}>→</span>
            </button>
          </div>
          <div style={statStyle} className="fade-up">
            <span>2,400+ Spots Managed</span>
            <div style={dotStyle} />
            <span>98% Uptime</span>
            <div style={dotStyle} />
            <span>Real-time Updates</span>
          </div>
        </div>

        <div style={heroRightStyle}>
          <div style={liveBadgeStyle}>
            <div style={pulseDotStyle} />
            LIVE
          </div>
          <div style={parkingGridStyle}>
            {slots.map((slot) => (
              <div key={slot.id} style={slotStyle(slot.status)}>
                {String(slot.id + 1).padStart(2, '0')}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={howItWorksStyle}>
        <div style={sectionLabelStyle}>THE PROCESS</div>
        <h2 style={howHeadlineStyle}>From Search to Parking</h2>
        <div style={stepsContainerStyle}>
          <div style={stepStyle(0)}>
            <div style={stepNumberStyle}>01</div>
            <h3 style={stepTitleStyle}>Find</h3>
            <p style={stepDescStyle}>
              Browse available parking spots near your destination with real-time updates and instant availability.
            </p>
          </div>
          <div style={stepStyle(60)}>
            <div style={stepNumberStyle}>02</div>
            <h3 style={stepTitleStyle}>Reserve</h3>
            <p style={stepDescStyle}>
              Secure your spot with a single tap. Your reservation is locked in and ready for your arrival.
            </p>
          </div>
          <div style={stepStyle(-40)}>
            <div style={stepNumberStyle}>03</div>
            <h3 style={stepTitleStyle}>Park</h3>
            <p style={stepDescStyle}>
              Navigate to your reserved spot and park with confidence. Your fee is calculated automatically.
            </p>
          </div>
        </div>
      </section>

      <section style={featuresStyle}>
        <h2 style={featureTitleStyle}>Why ParkWise?</h2>

        <div style={featureRowStyle(false)}>
          <div style={featureTextStyle}>
            <h3 style={featureHeadingStyle}>Real-time Updates</h3>
            <p style={featureDescStyle}>
              See parking availability change as it happens. Our live feed keeps you informed every second.
            </p>
          </div>
          <div style={featureVisualStyle}>
            <div style={{ fontSize: '80px' }}>📡</div>
          </div>
        </div>

        <div style={featureRowStyle(true)}>
          <div style={featureTextStyle}>
            <h3 style={featureHeadingStyle}>Instant Reservation</h3>
            <p style={featureDescStyle}>
              Reserve any available spot in seconds. Lock in your parking before you leave home.
            </p>
          </div>
          <div style={featureVisualStyle}>
            <div style={{ fontSize: '80px' }}>🔒</div>
          </div>
        </div>

        <div style={featureRowStyle(false)}>
          <div style={featureTextStyle}>
            <h3 style={featureHeadingStyle}>Smart Fee Calculation</h3>
            <p style={featureDescStyle}>
              Transparent pricing based on duration. No hidden fees, no surprises. Pay exactly what you use.
            </p>
          </div>
          <div style={featureVisualStyle}>
            <div style={{ fontSize: '80px' }}>💰</div>
          </div>
        </div>
      </section>

      <section style={ctaBannerStyle}>
        <h2 style={ctaHeadlineStyle}>Your spot is waiting.</h2>
        <p style={ctaSubStyle}>Join thousands of drivers who've stopped wasting time searching for parking.</p>
        <Link to="/register" style={ctaDarkButtonStyle}>
          Get Started Free
        </Link>
      </section>

      <footer style={footerStyle}>
        <div style={footerLogoStyle}>PARKWISE</div>
        <div style={footerCopyStyle}>© 2025 ParkWise. All rights reserved.</div>
        <div style={footerLinksStyle}>
          <a href="#" style={footerLinkStyle}>Privacy</a>
          <a href="#" style={footerLinkStyle}>Terms</a>
          <a href="#" style={footerLinkStyle}>Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
