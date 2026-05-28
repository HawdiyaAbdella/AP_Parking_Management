import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import useWebSocket from '../hooks/useWebSocket';

const DashboardPage = () => {
  const { user, isAdmin } = useAuth();
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservationPlate, setReservationPlate] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [addSlotOpen, setAddSlotOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({ slotName: '', zone: '', floor: '' });
  const [addSlotLoading, setAddSlotLoading] = useState(false);
  const [toastList, setToastList] = useState([]);
  const [flashSlotIds, setFlashSlotIds] = useState([]);
  const [now, setNow] = useState(Date.now());
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());
  const [animateStats, setAnimateStats] = useState(false);
  const [actionTargetReservation, setActionTargetReservation] = useState(null);
  const [dashboardError, setDashboardError] = useState('');
  const [pageReady, setPageReady] = useState(false);
  const [reservationModalType, setReservationModalType] = useState('reserve');
  const flashTimeoutsRef = useRef(new Map());

  const authHeaders = useMemo(() => {
    if (!user?.token) {
      return {};
    }

    return {
      Authorization: `Bearer ${user.token}`,
    };
  }, [user?.token]);

  const showToast = (message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToastList((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToastList((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const triggerSlotFlash = (slotId) => {
    if (!slotId) return;

    setFlashSlotIds((prev) => (prev.includes(slotId) ? prev : [...prev, slotId]));

    if (flashTimeoutsRef.current.has(slotId)) {
      window.clearTimeout(flashTimeoutsRef.current.get(slotId));
    }

    const timeoutId = window.setTimeout(() => {
      setFlashSlotIds((prev) => prev.filter((id) => id !== slotId));
      flashTimeoutsRef.current.delete(slotId);
    }, 1200);

    flashTimeoutsRef.current.set(slotId, timeoutId);
  };

  const updateSlotFromWebSocket = (incoming) => {
    if (!incoming?.slotId) {
      return;
    }

    setSlots((prev) => {
      const next = prev.map((slot) => {
        if (slot.id !== incoming.slotId) {
          return slot;
        }

        return {
          ...slot,
          slotName: incoming.slotName ?? slot.slotName,
          status: incoming.status ?? slot.status,
          zone: incoming.zone ?? slot.zone,
          floor: incoming.floor ?? slot.floor,
          message: incoming.message,
        };
      });

      if (!prev.some((slot) => slot.id === incoming.slotId)) {
        next.push({
          id: incoming.slotId,
          slotName: incoming.slotName,
          status: incoming.status,
          zone: incoming.zone,
          floor: incoming.floor,
          message: incoming.message,
        });
      }

      return next;
    });

    triggerSlotFlash(incoming.slotId);
    setLastUpdatedAt(Date.now());
    setAnimateStats(true);
  };

  const socketConnected = useWebSocket(updateSlotFromWebSocket);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.token) {
        return;
      }

      setSlotsLoading(true);
      setReservationsLoading(true);
      setDashboardError('');

      try {
        const [slotsResponse, reservationsResponse] = await Promise.all([
          api.get('/api/parking/slots', { headers: authHeaders }),
          api.get(isAdmin() ? '/api/parking/reservations/all' : '/api/parking/reservations/my', {
            headers: authHeaders,
          }),
        ]);

        setSlots(Array.isArray(slotsResponse.data) ? slotsResponse.data : []);
        setReservations(Array.isArray(reservationsResponse.data) ? reservationsResponse.data : []);
        setLastUpdatedAt(Date.now());
        setPageReady(true);
      } catch (error) {
        setDashboardError(error.response?.data || 'Failed to load dashboard data');
      } finally {
        setSlotsLoading(false);
        setReservationsLoading(false);
      }
    };

    loadDashboard();
  }, [authHeaders, isAdmin, user?.token]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!animateStats) return;
    const timer = window.setTimeout(() => setAnimateStats(false), 450);
    return () => window.clearTimeout(timer);
  }, [animateStats]);

  const zones = useMemo(() => {
    const allZones = slots
      .map((slot) => slot.zone)
      .filter(Boolean)
      .filter((zone, index, array) => array.indexOf(zone) === index);
    return ['All', ...allZones];
  }, [slots]);

  const filteredSlots = useMemo(() => {
    if (selectedZone === 'All') return slots;
    return slots.filter((slot) => slot.zone === selectedZone);
  }, [selectedZone, slots]);

  const stats = useMemo(() => {
    const total = slots.length;
    const available = slots.filter((slot) => String(slot.status).toUpperCase() === 'AVAILABLE').length;
    const reserved = slots.filter((slot) => String(slot.status).toUpperCase() === 'RESERVED').length;
    const occupied = slots.filter((slot) => String(slot.status).toUpperCase() === 'OCCUPIED').length;
    return { total, available, reserved, occupied };
  }, [slots]);

  const formatAgo = (dateString) => {
    if (!dateString) return 'Started just now';
    const diff = Math.max(0, Math.floor((Date.now() - new Date(dateString).getTime()) / 60000));
    if (diff <= 0) return 'Started just now';
    if (diff === 1) return 'Started 1 minute ago';
    return `Started ${diff} minutes ago`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const parseStatus = (status) => String(status || '').toUpperCase();

  const getReservationFee = (reservation) => {
    if (reservation.fee != null) return reservation.fee;
    if (!reservation.startTime) return 0;
    const minutes = Math.max(0, Math.ceil((now - new Date(reservation.startTime).getTime()) / 60000));
    const halfHours = Math.ceil(minutes / 30);
    return halfHours * 5;
  };

  const slotIsClickable = (slot) => {
    if (isAdmin()) return true;
    if (parseStatus(slot.status) === 'AVAILABLE') return true;

    const myReservation = reservations.find((reservation) => {
      const sameSlot = reservation.slotName === slot.slotName;
      const active = ['ACTIVE', 'RESERVED', 'COMPLETED'].includes(parseStatus(reservation.status));
      return sameSlot && active && reservation.username === user?.username;
    });

    return Boolean(myReservation);
  };

  const openSlotAction = (slot) => {
    setModalError('');
    setSelectedSlot(slot);

    if (isAdmin()) {
      setAdminModalOpen(true);
      return;
    }

    const status = parseStatus(slot.status);
    const ownReservation = reservations.find(
      (reservation) => reservation.slotName === slot.slotName && reservation.username === user?.username
    );

    if (status === 'AVAILABLE') {
      setReservationModalType('reserve');
      setReservationPlate('');
    } else if (ownReservation && ['ACTIVE', 'RESERVED'].includes(parseStatus(ownReservation.status))) {
      setReservationModalType('manage');
      setActionTargetReservation(ownReservation);
    }
  };

  const reserveSlot = async (event) => {
    event.preventDefault();
    if (!selectedSlot) return;
    setModalLoading(true);
    setModalError('');

    try {
      await api.post(
        '/api/parking/reserve',
        {
          slotId: selectedSlot.id,
          vehiclePlate: reservationPlate.trim(),
        },
        { headers: authHeaders }
      );
      setSelectedSlot(null);
      setReservationPlate('');
      showToast(`Slot ${selectedSlot.slotName} reserved`);
    } catch (error) {
      setModalError(error.response?.data || 'Failed to reserve slot');
    } finally {
      setModalLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      await api.post(`/api/parking/cancel/${reservationId}`, {}, { headers: authHeaders });
      setReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId));
      setSelectedSlot(null);
      setActionTargetReservation(null);
      showToast('Reservation cancelled');
    } catch (error) {
      showToast(error.response?.data || 'Failed to cancel reservation');
    }
  };

  const releaseReservation = async (reservationId) => {
    try {
      const response = await api.post(`/api/parking/release/${reservationId}`, {}, { headers: authHeaders });
      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId
            ? { ...reservation, status: 'COMPLETED', endTime: new Date().toISOString(), fee: response.data?.fee }
            : reservation
        )
      );
      setSelectedSlot(null);
      setActionTargetReservation(null);
      showToast(`Slot released. Fee: ${response.data?.fee ?? 0} ETB`);
    } catch (error) {
      showToast(error.response?.data || 'Failed to release slot');
    }
  };

  const adminForceRelease = async (slot) => {
    const target = reservations.find((reservation) => reservation.slotName === slot.slotName);
    if (!target) {
      showToast('No active reservation found for this slot');
      return;
    }
    await releaseReservation(target.id);
  };

  const deleteSlot = async (slotId) => {
    if (!window.confirm('Delete this slot permanently?')) return;
    try {
      await api.delete(`/api/parking/slots/${slotId}`, { headers: authHeaders });
      setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
      setSelectedSlot(null);
      setAdminModalOpen(false);
      showToast('Slot deleted');
    } catch (error) {
      showToast(error.response?.data || 'Failed to delete slot');
    }
  };

  const addSlot = async (event) => {
    event.preventDefault();
    if (!newSlot.slotName.trim() || !newSlot.zone.trim() || !newSlot.floor.trim()) return;
    setAddSlotLoading(true);
    try {
      await api.post(
        '/api/parking/slots',
        {
          slotName: newSlot.slotName.trim(),
          zone: newSlot.zone.trim(),
          floor: Number(newSlot.floor),
        },
        { headers: authHeaders }
      );
      setNewSlot({ slotName: '', zone: '', floor: '' });
      showToast('New slot added');
    } catch (error) {
      showToast(error.response?.data || 'Failed to add slot');
    } finally {
      setAddSlotLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    padding: '88px 32px 32px',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  };

  const titleStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(34px, 4vw, 56px)',
    lineHeight: 1.1,
    fontWeight: 400,
    color: 'var(--text-primary)',
  };

  const liveStatusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-secondary)',
    fontSize: '13px',
  };

  const liveDotStyle = {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: socketConnected ? 'var(--success)' : 'var(--warning)',
    boxShadow: socketConnected ? '0 0 16px rgba(74, 158, 107, 0.55)' : '0 0 16px rgba(232, 160, 32, 0.55)',
    animation: 'pulseDot 1.5s infinite',
  };

  const statsBarStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    borderBottom: '1px solid var(--border-strong)',
    paddingBottom: '18px',
    marginBottom: '24px',
  };

  const statCardStyle = {
    background: 'transparent',
    borderRadius: 'var(--radius)',
    padding: '12px 0 6px',
    transition: 'var(--transition)',
  };

  const statNumberStyle = (color) => ({
    fontFamily: 'var(--font-display)',
    fontSize: '42px',
    color,
    lineHeight: 1,
    transform: animateStats ? 'scale(1.04)' : 'scale(1)',
    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const statLabelStyle = {
    marginTop: '6px',
    color: 'var(--text-muted)',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
  };

  const mainLayoutStyle = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 65%) minmax(320px, 35%)',
    gap: '24px',
    alignItems: 'start',
  };

  const panelStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius)',
    padding: '22px',
    boxShadow: 'var(--shadow-gold)',
  };

  const sectionTitleStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '30px',
    color: 'var(--text-primary)',
    fontWeight: 400,
    marginBottom: '18px',
  };

  const filtersStyle = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  };

  const filterButtonStyle = (active) => ({
    padding: '8px 14px',
    borderRadius: '999px',
    border: `1px solid ${active ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
    color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
    background: active ? 'var(--accent-gold)' : 'transparent',
    fontSize: '12px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    transition: 'var(--transition)',
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '14px',
  };

  const slotCardStyle = (slot) => {
    const status = parseStatus(slot.status);
    const borderColor = status === 'AVAILABLE' ? 'var(--success)' : status === 'RESERVED' ? 'var(--accent-gold)' : 'var(--danger)';
    const clickable = slotIsClickable(slot);
    return {
      height: '90px',
      background: 'var(--bg-card)',
      borderLeft: `4px solid ${borderColor}`,
      border: `1px solid ${flashSlotIds.includes(slot.id) ? 'var(--accent-gold-light)' : 'var(--border-subtle)'}`,
      borderLeftWidth: '4px',
      borderRadius: 'var(--radius)',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      cursor: clickable ? 'pointer' : 'default',
      transition: 'var(--transition)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: flashSlotIds.includes(slot.id) ? '0 0 0 1px rgba(201, 168, 76, 0.55), 0 0 18px rgba(201, 168, 76, 0.18)' : 'none',
    };
  };

  const slotNameStyle = {
    fontWeight: 700,
    fontSize: '14px',
    color: 'var(--text-primary)',
  };

  const slotMetaStyle = {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  };

  const slotBadgeStyle = (status) => ({
    alignSelf: 'flex-end',
    padding: '4px 8px',
    borderRadius: '999px',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    background: status === 'AVAILABLE' ? 'rgba(74, 158, 107, 0.14)' : status === 'RESERVED' ? 'rgba(201, 168, 76, 0.14)' : 'rgba(192, 57, 43, 0.14)',
    color: status === 'AVAILABLE' ? 'var(--success)' : status === 'RESERVED' ? 'var(--accent-gold-light)' : 'var(--danger)',
  });

  const iconStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '16px',
    color: 'var(--text-secondary)',
  };

  const sidebarListStyle = {
    maxHeight: 'calc(100vh - 320px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingRight: '4px',
  };

  const reservationItemStyle = (reservation) => {
    const status = parseStatus(reservation.status);
    const borderColor = status === 'ACTIVE' ? 'var(--accent-gold)' : status === 'COMPLETED' ? 'var(--success)' : 'var(--danger)';
    return {
      background: 'var(--bg-card)',
      border: `1px solid var(--border-subtle)`,
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 'var(--radius)',
      padding: '14px',
    };
  };

  const reservationHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '8px',
  };

  const actionButtonStyle = (color, filled = false) => ({
    padding: '8px 12px',
    borderRadius: 'var(--radius)',
    border: `1px solid ${color}`,
    background: filled ? color : 'transparent',
    color: filled ? 'var(--bg-primary)' : color,
    fontSize: '12px',
    fontWeight: 600,
    transition: 'var(--transition)',
  });

  const emptyStateStyle = {
    padding: '48px 24px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    border: '1px dashed var(--border-subtle)',
    borderRadius: 'var(--radius)',
    background: 'rgba(255,255,255,0.01)',
  };

  const skeletonStyle = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 37%, rgba(255,255,255,0.04) 63%)',
    backgroundSize: '400% 100%',
    animation: 'shimmer 1.4s ease infinite',
  };

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 2000,
  };

  const modalStyle = {
    width: '100%',
    maxWidth: '440px',
    background: 'var(--bg-card)',
    borderTop: '3px solid var(--accent-gold)',
    borderRadius: '2px',
    padding: '24px',
    boxShadow: '0 20px 80px rgba(0,0,0,0.45)',
  };

  const modalTitleStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: '30px',
    fontWeight: 400,
    marginBottom: '14px',
  };

  const inputGroupStyle = {
    marginBottom: '18px',
  };

  const floatingInputStyle = {
    width: '100%',
    padding: '14px 0 10px',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border-subtle)',
    color: 'var(--text-primary)',
    fontSize: '14px',
  };

  const modalActionsStyle = {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    flexWrap: 'wrap',
  };

  const toastWrapStyle = {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 3000,
    maxWidth: '360px',
  };

  const toastStyle = {
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    borderLeft: '3px solid var(--accent-gold)',
    padding: '14px 16px',
    boxShadow: '0 16px 44px rgba(0,0,0,0.35)',
    transform: 'translateX(0)',
    transition: 'var(--transition)',
    borderRadius: 'var(--radius)',
  };

  const statusLine = `${socketConnected ? 'Connected' : 'Reconnecting...'} • Updated ${Math.floor((Date.now() - lastUpdatedAt) / 1000)} seconds ago`;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div>
          <div style={titleStyle}>Parking Overview</div>
        </div>
        <div style={liveStatusStyle}>
          <span style={liveDotStyle} />
          <span>Live</span>
          <span>•</span>
          <span>{statusLine}</span>
        </div>
      </div>

      {dashboardError ? (
        <div style={{ ...emptyStateStyle, marginBottom: '20px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
          {dashboardError}
        </div>
      ) : null}

      <div style={statsBarStyle}>
        <div style={statCardStyle}>
          <div style={statNumberStyle('var(--text-primary)')}>{stats.total}</div>
          <div style={statLabelStyle}>Total Slots</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle('var(--success)')}>{stats.available}</div>
          <div style={statLabelStyle}>Available</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle('var(--accent-gold-light)')}>{stats.reserved}</div>
          <div style={statLabelStyle}>Reserved</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumberStyle('var(--danger)')}>{stats.occupied}</div>
          <div style={statLabelStyle}>Occupied</div>
        </div>
      </div>

      <div style={mainLayoutStyle}>
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={sectionTitleStyle}>Parking Map</div>
            <div style={filtersStyle}>
              {zones.map((zone) => (
                <button
                  key={zone}
                  style={filterButtonStyle(selectedZone === zone)}
                  onClick={() => setSelectedZone(zone)}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {slotsLoading ? (
            <div style={gridStyle}>
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} style={{ ...slotCardStyle({ id: index, status: 'AVAILABLE' }), ...skeletonStyle, minHeight: '90px' }} />
              ))}
            </div>
          ) : filteredSlots.length ? (
            <div style={gridStyle}>
              {filteredSlots.map((slot) => {
                const status = parseStatus(slot.status);
                const icon = status === 'AVAILABLE' ? '✓' : status === 'RESERVED' ? '⏱' : '✗';
                const statusLabel = status || 'UNKNOWN';
                return (
                  <div
                    key={slot.id}
                    style={slotCardStyle(slot)}
                    onClick={() => slotIsClickable(slot) && openSlotAction(slot)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-hover)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-card)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={iconStyle}>{icon}</div>
                    <div>
                      <div style={slotNameStyle}>{slot.slotName}</div>
                      <div style={slotMetaStyle}>{slot.zone || '—'} • Floor {slot.floor ?? '—'}</div>
                    </div>
                    <div style={slotBadgeStyle(status)}>{statusLabel}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              {isAdmin() ? 'No parking slots configured yet' : 'No parking slots configured yet'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={panelStyle}>
            <div style={sectionTitleStyle}>{isAdmin() ? 'All Reservations' : 'My Reservations'}</div>
            {reservationsLoading ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} style={{ ...reservationItemStyle({ status: 'ACTIVE' }), minHeight: '110px', ...skeletonStyle }} />
                ))}
              </div>
            ) : reservations.length ? (
              <div style={sidebarListStyle}>
                {reservations.map((reservation) => {
                  const status = parseStatus(reservation.status);
                  const statusColor = status === 'ACTIVE' ? 'var(--accent-gold)' : status === 'COMPLETED' ? 'var(--success)' : 'var(--danger)';
                  return (
                    <div key={reservation.id} style={reservationItemStyle(reservation)}>
                      <div style={reservationHeaderStyle}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{reservation.slotName}</div>
                        <div style={slotBadgeStyle(status)}>{status}</div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '6px' }}>
                        Vehicle: {reservation.vehiclePlate || '—'}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px' }}>
                        {formatAgo(reservation.startTime)} • {formatDateTime(reservation.startTime)}
                      </div>

                      {status === 'ACTIVE' && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                          <div style={{ color: 'var(--accent-gold-light)', fontSize: '12px' }}>
                            Running fee: {getReservationFee(reservation).toFixed(2)} ETB
                          </div>
                          <button style={actionButtonStyle('var(--accent-gold)')} onClick={() => releaseReservation(reservation.id)}>
                            Release
                          </button>
                          <button style={actionButtonStyle('var(--danger)')} onClick={() => cancelReservation(reservation.id)}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={emptyStateStyle}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>🅿️</div>
                <div>No reservations yet</div>
              </div>
            )}
          </div>

          {isAdmin() && (
            <div style={panelStyle}>
              <button
                style={{ ...sectionTitleStyle, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: addSlotOpen ? '18px' : 0 }}
                onClick={() => setAddSlotOpen((prev) => !prev)}
              >
                <span>Add New Slot</span>
                <span>{addSlotOpen ? '−' : '+'}</span>
              </button>
              {addSlotOpen && (
                <form onSubmit={addSlot}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                    <input
                      style={floatingInputStyle}
                      placeholder="Slot Name"
                      value={newSlot.slotName}
                      onChange={(e) => setNewSlot((prev) => ({ ...prev, slotName: e.target.value }))}
                    />
                    <input
                      style={floatingInputStyle}
                      placeholder="Zone"
                      value={newSlot.zone}
                      onChange={(e) => setNewSlot((prev) => ({ ...prev, zone: e.target.value }))}
                    />
                    <input
                      style={floatingInputStyle}
                      placeholder="Floor"
                      type="number"
                      value={newSlot.floor}
                      onChange={(e) => setNewSlot((prev) => ({ ...prev, floor: e.target.value }))}
                    />
                  </div>
                  <div style={{ marginTop: '18px' }}>
                    <button style={actionButtonStyle('var(--accent-gold)', true)} disabled={addSlotLoading}>
                      {addSlotLoading ? 'Adding...' : 'Add Slot'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedSlot && !adminModalOpen && reservationModalType === 'reserve' && (
        <div style={modalOverlayStyle} onClick={() => setSelectedSlot(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalTitleStyle}>Reserve Slot {selectedSlot.slotName}</div>
            {modalError ? <div style={{ color: 'var(--danger)', marginBottom: '14px' }}>{modalError}</div> : null}
            <form onSubmit={reserveSlot}>
              <div style={inputGroupStyle}>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px' }}>Vehicle Plate</label>
                <input
                  style={floatingInputStyle}
                  value={reservationPlate}
                  onChange={(e) => setReservationPlate(e.target.value)}
                  placeholder="Enter vehicle plate"
                />
              </div>
              <div style={modalActionsStyle}>
                <button style={actionButtonStyle('var(--accent-gold)', true)} disabled={modalLoading}>
                  {modalLoading ? 'Reserving...' : 'Confirm Reservation'}
                </button>
                <button type="button" style={actionButtonStyle('var(--text-secondary)')} onClick={() => setSelectedSlot(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSlot && isAdmin() && adminModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setAdminModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalTitleStyle}>Slot Details</div>
            <div style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Slot: {selectedSlot.slotName}</div>
            <div style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>Zone: {selectedSlot.zone}</div>
            <div style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Floor: {selectedSlot.floor}</div>
            <div style={modalActionsStyle}>
              <button style={actionButtonStyle('var(--danger)')} onClick={() => adminForceRelease(selectedSlot)}>
                Force Release
              </button>
              <button style={actionButtonStyle('var(--danger)', true)} onClick={() => deleteSlot(selectedSlot.id)}>
                Delete Slot
              </button>
              <button type="button" style={actionButtonStyle('var(--text-secondary)')} onClick={() => setAdminModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={toastWrapStyle}>
        {toastList.map((toast) => (
          <div key={toast.id} style={toastStyle}>
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 1024px) {
          .dashboard-grid-stack {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
