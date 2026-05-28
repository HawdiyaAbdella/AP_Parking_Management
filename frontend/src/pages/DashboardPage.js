import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import useWebSocket from '../hooks/useWebSocket';

const DashboardPage = () => {
  const { user, isAdmin: isAdminFn } = useAuth();
  const [slots, setSlots] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [reservationsLoading, setReservationsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('All');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reservationPlate, setReservationPlate] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [arriveLoading, setArriveLoading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
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
  const [modalMode, setModalMode] = useState(null);
  const [paymentStep, setPaymentStep] = useState('bill');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [billData, setBillData] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownIntervalRef = useRef(null);
  const flashTimeoutsRef = useRef(new Map());
  const toastTimeoutsRef = useRef(new Map());
  const socketConnectedOnceRef = useRef(false);
  const refreshIntervalRef = useRef(null);

  const authHeaders = useMemo(() => {
    if (!user?.token) return {};
    return { Authorization: `Bearer ${user.token}` };
  }, [user?.token]);

  const removeToast = useCallback((toastId) => {
    if (toastTimeoutsRef.current.has(toastId)) {
      window.clearTimeout(toastTimeoutsRef.current.get(toastId));
      toastTimeoutsRef.current.delete(toastId);
    }
    setToastList((prev) => prev.filter((item) => item.id !== toastId));
  }, []);

  const showToast = useCallback(
    (message, type = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToastList((prev) => [...prev, { id, message, type }]);
      const timeoutId = window.setTimeout(() => {
        removeToast(id);
      }, 4000);
      toastTimeoutsRef.current.set(id, timeoutId);
    },
    [removeToast]
  );

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
    if (!incoming?.slotId) return;

    const incomingStatus = parseStatus(incoming.status);
    const selectedSlotId = selectedSlot?.id;
    const selectedSlotStatus = parseStatus(selectedSlot?.status);
    const isSelectedSlot = selectedSlotId === incoming.slotId;

    if (
      isSelectedSlot &&
      modalMode === 'reserve' &&
      selectedSlotStatus === 'AVAILABLE' &&
      incomingStatus !== 'AVAILABLE'
    ) {
      triggerSlotFlash(incoming.slotId);
      setSelectedSlot(null);
      setReservationPlate('');
      setModalError('');
      setModalLoading(false);
      setArriveLoading(false);
      setCancelConfirmOpen(false);
     
    }

    setSlots((prev) => {
      const next = prev.map((slot) => {
        if (slot.id !== incoming.slotId) return slot;
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

  const parseStatus = (status) => String(status || '').toUpperCase();

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return diffMinutes === 1
        ? '1 minute ago'
        : `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      const remainingMinutes = diffMinutes % 60;
      if (remainingMinutes === 0) {
        return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
      }
      return diffHours === 1
        ? `1 hour ${remainingMinutes} min ago`
        : `${diffHours} hours ${remainingMinutes} min ago`;
    } else if (diffDays < 7) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    } else if (diffWeeks < 4) {
      return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
    } else if (diffMonths < 12) {
      return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
    } else {
      return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
    }
  };

  const formatDuration = (startTime, endTime) => {
    if (!startTime) return '0 minutes';
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const totalMinutes = Math.floor((end - start) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    if (minutes === 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
    return `${hours} hour${hours === 1 ? '' : 's'} ${minutes} minute${minutes === 1 ? '' : 's'}`;
  };

  const formatExactDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getReservationFee = (reservation) => {
    if (reservation.fee != null) return reservation.fee;
    if (!reservation.startTime) return 0;
    const minutes = Math.max(
      0,
      Math.ceil((now - new Date(reservation.startTime).getTime()) / 60000)
    );
    return Math.max(5, Math.ceil(minutes / 30) * 5);
  };

  const getCurrentUserReservationForSlot = (slot) =>
    reservations.find(
      (reservation) =>
        reservation.slotName === slot?.slotName &&
        reservation.username === user?.username &&
        parseStatus(reservation.status) === 'ACTIVE'
    );

  const getManageReservationForSlot = (slot) => {
    if (!slot) return null;
    return getCurrentUserReservationForSlot(slot);
  };

  const slotIsClickable = (slot) => {
    if (isAdminFn()) return true;
    if (parseStatus(slot.status) === 'AVAILABLE') return true;
    const myReservation = reservations.find((reservation) => {
      const sameSlot = reservation.slotName === slot.slotName;
      const active = ['ACTIVE', 'RESERVED', 'COMPLETED'].includes(
        parseStatus(reservation.status)
      );
      return sameSlot && active && reservation.username === user?.username;
    });
    return Boolean(myReservation);
  };

  const getAutoReleaseMinutes = (reservation) => {
    if (
      parseStatus(reservation.status) !== 'ACTIVE' ||
      parseStatus(selectedSlot?.status) !== 'RESERVED'
    )
      return null;
    const minutes = Math.floor(
      (Date.now() - new Date(reservation.startTime).getTime()) / 60000
    );
    return Math.max(0, 15 - minutes);
  };

  const loadBillData = useCallback(
    async (reservationId) => {
      setBillLoading(true);
      try {
        const response = await api.get(`/api/parking/bill/${reservationId}`, {
          headers: authHeaders,
        });
        setBillData(response.data);
      } catch (error) {
        console.error('Failed to load bill:', error);
        showToast('Failed to load billing information', 'error');
      } finally {
        setBillLoading(false);
      }
    },
    [authHeaders, showToast]
  );

  const loadReservations = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await api.get(
        isAdminFn() ? '/api/parking/reservations/all' : '/api/parking/reservations/my',
        { headers: authHeaders }
      );
      setReservations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    }
  }, [user?.token, authHeaders]);

  const loadSlots = useCallback(async () => {
    if (!user?.token) return;
    try {
      const response = await api.get('/api/parking/slots', {
        headers: authHeaders,
      });
      setSlots(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load slots:', error);
    }
  }, [user?.token, authHeaders]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.token) return;
      setSlotsLoading(true);
      setReservationsLoading(true);
      setDashboardError('');
      try {
        const [slotsResponse, reservationsResponse] = await Promise.all([
          api.get('/api/parking/slots', { headers: authHeaders }),
          api.get(
            isAdminFn() ? '/api/parking/reservations/all' : '/api/parking/reservations/my',
            {
              headers: authHeaders,
            }
          ),
        ]);
        setSlots(Array.isArray(slotsResponse.data) ? slotsResponse.data : []);
        setReservations(
          Array.isArray(reservationsResponse.data) ? reservationsResponse.data : []
        );
        setLastUpdatedAt(Date.now());
      } catch (error) {
        setDashboardError(error.response?.data || 'Failed to load dashboard data');
      } finally {
        setSlotsLoading(false);
        setReservationsLoading(false);
      }
    };

    loadDashboard();
    refreshIntervalRef.current = window.setInterval(() => {
      loadReservations();
      loadSlots();
    }, 60000);

    return () => {
      if (refreshIntervalRef.current) window.clearInterval(refreshIntervalRef.current);
    };
  }, [authHeaders, user?.token, loadReservations, loadSlots]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!animateStats) return;
    const timer = window.setTimeout(() => setAnimateStats(false), 450);
    return () => window.clearTimeout(timer);
  }, [animateStats]);

  useEffect(() => {
    if (socketConnected) {
      if (socketConnectedOnceRef.current)
        showToast('Connection restored', 'success');
      socketConnectedOnceRef.current = true;
      return;
    }
    if (socketConnectedOnceRef.current)
      showToast('Lost connection, reconnecting...', 'warning');
  }, [showToast, socketConnected]);

  useEffect(() => {
    if (paymentStep !== 'receipt' || countdown === null) return;

    if (countdown === 0) {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setSelectedSlot(null);
      setActionTargetReservation(null);
      setPaymentStep('bill');
      setSelectedPaymentMethod(null);
      setBillData(null);
      setCountdown(10);
      showToast('Payment confirmed. Safe drive!', 'success');
      loadReservations();
      loadSlots();
      return;
    }

    countdownIntervalRef.current = window.setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [paymentStep, countdown, loadReservations, loadSlots, showToast]);

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
    const available = slots.filter(
      (slot) => String(slot.status).toUpperCase() === 'AVAILABLE'
    ).length;
    const reserved = slots.filter(
      (slot) => String(slot.status).toUpperCase() === 'RESERVED'
    ).length;
    const occupied = slots.filter(
      (slot) => String(slot.status).toUpperCase() === 'OCCUPIED'
    ).length;
    return { total, available, reserved, occupied };
  }, [slots]);

  const openSlotAction = (slot) => {
    setModalError('');
    setCancelConfirmOpen(false);
    setArriveLoading(false);
    setModalLoading(false);
    setSelectedSlot(slot);
    setPaymentStep('bill');
    setSelectedPaymentMethod(null);
    setBillData(null);

    if (isAdminFn()) {
      setAdminModalOpen(true);
      setModalMode(null);
      return;
    }

    const status = parseStatus(slot.status);
    const ownReservation = getManageReservationForSlot(slot);

    if (status === 'AVAILABLE') {
      setModalMode('reserve');
      setReservationPlate('');
      setActionTargetReservation(null);
    } else if (ownReservation) {
      if (status === 'RESERVED') {
        setModalMode('myreserved');
        setActionTargetReservation(ownReservation);
      } else if (status === 'OCCUPIED') {
        setModalMode('payment');
        setActionTargetReservation(ownReservation);
        loadBillData(ownReservation.id);
      }
    } else if (status === 'RESERVED' || status === 'OCCUPIED') {
      setModalMode('info');
      setActionTargetReservation(null);
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
        { slotId: selectedSlot.id, vehiclePlate: reservationPlate.trim() },
        { headers: authHeaders }
      );
      setSelectedSlot(null);
      setReservationPlate('');
      showToast(`Slot ${selectedSlot.slotName} reserved successfully!`, 'success');
      loadReservations();
      loadSlots();
    } catch (error) {
      const message = error.response?.data || 'Failed to reserve slot';
      setModalError(message);
      showToast(message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const occupyReservation = async () => {
    if (!actionTargetReservation) return;
    setArriveLoading(true);
    setModalError('');
    try {
      await api.post(
        `/api/parking/occupy/${actionTargetReservation.id}`,
        {},
        { headers: authHeaders }
      );
      showToast(
        'Welcome! Slot marked as occupied. Timer started for billing.',
        'success'
      );
      setSelectedSlot(null);
      setActionTargetReservation(null);
      setCancelConfirmOpen(false);
      loadReservations();
      loadSlots();
    } catch (error) {
      const message = error.response?.data || 'Failed to mark slot as occupied';
      setModalError(message);
      showToast(message, 'error');
    } finally {
      setArriveLoading(false);
    }
  };

  const cancelReservation = async (reservationId) => {
    setModalError('');
    try {
      await api.post(`/api/parking/cancel/${reservationId}`, {}, { headers: authHeaders });
      setReservations((prev) => prev.filter((reservation) => reservation.id !== reservationId));
      setSelectedSlot(null);
      setActionTargetReservation(null);
      setCancelConfirmOpen(false);
      showToast('Reservation cancelled', 'info');
      loadReservations();
      loadSlots();
    } catch (error) {
      const message = error.response?.data || 'Failed to cancel reservation';
      setModalError(message);
      showToast(message, 'error');
    }
  };

  const processPayment = async () => {
    if (!selectedPaymentMethod || !actionTargetReservation) return;
    setPaymentProcessing(true);
    setModalError('');
    try {
      await api.post(
        '/api/parking/pay',
        { reservationId: actionTargetReservation.id, paymentMethod: selectedPaymentMethod },
        { headers: authHeaders }
      );
      setCountdown(10);
      setPaymentStep('receipt');
    } catch (error) {
      const message = error.response?.data || 'Payment failed';
      setModalError(message);
      showToast(message, 'error');
    } finally {
      setPaymentProcessing(false);
    }
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
    if (!newSlot.slotName.trim() || !newSlot.zone.trim() || !newSlot.floor.trim())
      return;
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
      loadSlots();
    } catch (error) {
      showToast(error.response?.data || 'Failed to add slot');
    } finally {
      setAddSlotLoading(false);
    }
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
  const paymentModalStyle = { ...modalStyle, maxWidth: '500px' };
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

  const statusLine = `${socketConnected ? 'Connected' : 'Reconnecting...'} • Updated ${Math.floor((Date.now() - lastUpdatedAt) / 1000)} seconds ago`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '88px 32px 32px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(34px, 4vw, 56px)',
            lineHeight: 1.1,
            fontWeight: 400,
            color: 'var(--text-primary)',
          }}
        >
          Parking Overview
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: socketConnected ? 'var(--success)' : 'var(--warning)',
              boxShadow: socketConnected
                ? '0 0 16px rgba(74, 158, 107, 0.55)'
                : '0 0 16px rgba(232, 160, 32, 0.55)',
              animation: 'pulseDot 1.5s infinite',
            }}
          />
          <span>Live</span>
          <span>•</span>
          <span>{statusLine}</span>
        </div>
      </div>

      {dashboardError ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--danger)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: 'var(--radius)',
            background: 'rgba(255,255,255,0.01)',
            marginBottom: '20px',
          }}
        >
          {dashboardError}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '16px',
          borderBottom: '1px solid var(--border-strong)',
          paddingBottom: '18px',
          marginBottom: '24px',
        }}
      >
        {[
          { label: 'Total Slots', value: stats.total, color: 'var(--text-primary)' },
          { label: 'Available', value: stats.available, color: 'var(--success)' },
          {
            label: 'Reserved',
            value: stats.reserved,
            color: 'var(--accent-gold-light)',
          },
          { label: 'Occupied', value: stats.occupied, color: 'var(--danger)' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'transparent', borderRadius: 'var(--radius)', padding: '12px 0 6px' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '42px',
                color: stat.color,
                lineHeight: 1,
                transform: animateStats ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                marginTop: '6px',
                color: 'var(--text-muted)',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.16em',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 65%) minmax(320px, 35%)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius)',
            padding: '22px',
            boxShadow: 'var(--shadow-gold)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: '18px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '30px',
                color: 'var(--text-primary)',
                fontWeight: 400,
              }}
            >
              Parking Map
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {zones.map((zone) => (
                <button
                  key={zone}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '999px',
                    border: `1px solid ${selectedZone === zone ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                    color:
                      selectedZone === zone
                        ? 'var(--bg-primary)'
                        : 'var(--text-secondary)',
                    background:
                      selectedZone === zone ? 'var(--accent-gold)' : 'transparent',
                    fontSize: '12px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => setSelectedZone(zone)}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {slotsLoading ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '14px',
              }}
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  style={{
                    height: '90px',
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 37%, rgba(255,255,255,0.04) 63%)',
                    backgroundSize: '400% 100%',
                    animation: 'shimmer 1.4s ease infinite',
                    minHeight: '90px',
                    borderRadius: 'var(--radius)',
                  }}
                />
              ))}
            </div>
          ) : filteredSlots.length ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '14px',
              }}
            >
              {filteredSlots.map((slot) => {
                const status = parseStatus(slot.status);
                const borderColor =
                  status === 'AVAILABLE'
                    ? 'var(--success)'
                    : status === 'RESERVED'
                      ? 'var(--accent-gold)'
                      : 'var(--danger)';
                const clickable = slotIsClickable(slot);
                return (
                  <div
                    key={slot.id}
                    style={{
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
                      boxShadow: flashSlotIds.includes(slot.id)
                        ? '0 0 0 1px rgba(201, 168, 76, 0.55), 0 0 18px rgba(201, 168, 76, 0.18)'
                        : 'none',
                      animation: flashSlotIds.includes(slot.id)
                        ? 'slotFlash 0.8s ease'
                        : 'none',
                    }}
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
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        fontSize: '16px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {status === 'AVAILABLE' ? '✓' : status === 'RESERVED' ? '⏱' : '✗'}
                    </div>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {slot.slotName}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          marginTop: '4px',
                        }}
                      >
                        {slot.zone || '—'} • Floor {slot.floor ?? '—'}
                      </div>
                    </div>
                    <div
                      style={{
                        alignSelf: 'flex-end',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        background:
                          status === 'AVAILABLE'
                            ? 'rgba(74, 158, 107, 0.14)'
                            : status === 'RESERVED'
                              ? 'rgba(201, 168, 76, 0.14)'
                              : 'rgba(192, 57, 43, 0.14)',
                        color:
                          status === 'AVAILABLE'
                            ? 'var(--success)'
                            : status === 'RESERVED'
                              ? 'var(--accent-gold-light)'
                              : 'var(--danger)',
                      }}
                    >
                      {status}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: 'var(--radius)',
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              No parking slots configured yet
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius)',
              padding: '22px',
              boxShadow: 'var(--shadow-gold)',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '30px',
                color: 'var(--text-primary)',
                fontWeight: 400,
                marginBottom: '18px',
              }}
            >
              {isAdminFn() ? 'All Reservations' : 'My Reservations'}
            </div>
            {reservationsLoading ? (
              <div style={{ display: 'grid', gap: '12px' }}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 37%, rgba(255,255,255,0.04) 63%)',
                      backgroundSize: '400% 100%',
                      animation: 'shimmer 1.4s ease infinite',
                      minHeight: '110px',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                ))}
              </div>
            ) : reservations.length ? (
              <div
                style={{
                  maxHeight: 'calc(100vh - 320px)',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  paddingRight: '4px',
                }}
              >
                {reservations.map((reservation) => {
                  const status = parseStatus(reservation.status);
                  const slot = slots.find((s) => s.slotName === reservation.slotName);
                  const slotStatus = slot ? parseStatus(slot.status) : null;
                  const autoReleaseMin = getAutoReleaseMinutes(reservation);
                  const fee = getReservationFee(reservation);
                  const borderColor =
                    status === 'ACTIVE'
                      ? 'var(--accent-gold)'
                      : status === 'COMPLETED'
                        ? 'var(--success)'
                        : 'var(--danger)';

                  return (
                    <div
                      key={reservation.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: `1px solid var(--border-subtle)`,
                        borderLeft: `4px solid ${borderColor}`,
                        borderRadius: 'var(--radius)',
                        padding: '14px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '10px',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {reservation.slotName}
                        </div>
                        <div
                          style={{
                            display: 'inline-flex',
                            padding: '4px 8px',
                            borderRadius: '999px',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            background:
                              status === 'ACTIVE'
                                ? 'rgba(201,168,76,0.12)'
                                : status === 'COMPLETED'
                                  ? 'rgba(74, 158, 107, 0.12)'
                                  : 'rgba(192, 57, 43, 0.12)',
                            color:
                              status === 'ACTIVE'
                                ? 'var(--accent-gold-light)'
                                : status === 'COMPLETED'
                                  ? 'var(--success)'
                                  : 'var(--danger)',
                          }}
                        >
                          {status}
                        </div>
                      </div>
                      <div
                        style={{
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                          marginBottom: '6px',
                        }}
                      >
                        Vehicle: {reservation.vehiclePlate || '—'}
                      </div>
                      <div
                        style={{
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          marginBottom: '2px',
                        }}
                      >
                        {formatTimeAgo(reservation.startTime)}
                      </div>
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '11px',
                          marginBottom: '8px',
                        }}
                      >
                        {formatExactDate(reservation.startTime)}
                      </div>

                      {status === 'ACTIVE' && slotStatus === 'RESERVED' && (
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            marginBottom: '10px',
                          }}
                        >
                          ⚠ Auto-releases in {autoReleaseMin ?? 0} minutes
                        </div>
                      )}
                      {status === 'ACTIVE' && slotStatus === 'OCCUPIED' && (
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            marginBottom: '10px',
                          }}
                        >
                          ⏱ Parked for {formatTimeAgo(reservation.startTime)} • Fee: {fee.toFixed(2)} ETB
                        </div>
                      )}
                      {status === 'COMPLETED' && (
                        <div
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            marginBottom: '10px',
                          }}
                        >
                          Paid: {reservation.fee?.toFixed(2) || '—'} ETB via {reservation.paymentMethod || '—'} • {formatDuration(reservation.startTime, reservation.endTime)}
                        </div>
                      )}
                      {status === 'CANCELLED' && (
                        <div
                          style={{
                            color: 'var(--danger)',
                            fontSize: '12px',
                            marginBottom: '10px',
                          }}
                        >
                          Cancelled
                        </div>
                      )}

                      {status === 'ACTIVE' && slotStatus === 'RESERVED' && (
                        <button
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--accent-gold)',
                            background: 'var(--accent-gold)',
                            color: 'var(--bg-primary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            transition: 'var(--transition)',
                            width: '100%',
                          }}
                          onClick={() => openSlotAction(slot)}
                        >
                          I've Arrived
                        </button>
                      )}
                      {status === 'ACTIVE' && slotStatus === 'OCCUPIED' && (
                        <button
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--accent-gold)',
                            background: 'var(--accent-gold)',
                            color: 'var(--bg-primary)',
                            fontSize: '11px',
                            fontWeight: 600,
                            transition: 'var(--transition)',
                            width: '100%',
                          }}
                          onClick={() => openSlotAction(slot)}
                        >
                          Pay & Leave
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>🅿️</div>
                <div>No reservations yet</div>
              </div>
            )}
          </div>

          {isAdminFn() && (
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius)',
                padding: '22px',
                boxShadow: 'var(--shadow-gold)',
              }}
            >
              <button
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '30px',
                  color: 'var(--text-primary)',
                  fontWeight: 400,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: addSlotOpen ? '18px' : 0,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setAddSlotOpen((prev) => !prev)}
              >
                <span>Add New Slot</span>
                <span>{addSlotOpen ? '−' : '+'}</span>
              </button>
              {addSlotOpen && (
                <form onSubmit={addSlot}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <input
                      style={{
                        width: '100%',
                        padding: '14px 0 10px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                      placeholder="Slot Name"
                      value={newSlot.slotName}
                      onChange={(e) =>
                        setNewSlot((prev) => ({
                          ...prev,
                          slotName: e.target.value,
                        }))
                      }
                    />
                    <input
                      style={{
                        width: '100%',
                        padding: '14px 0 10px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                      placeholder="Zone"
                      value={newSlot.zone}
                      onChange={(e) =>
                        setNewSlot((prev) => ({ ...prev, zone: e.target.value }))
                      }
                    />
                    <input
                      style={{
                        width: '100%',
                        padding: '14px 0 10px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--border-subtle)',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                      placeholder="Floor"
                      type="number"
                      value={newSlot.floor}
                      onChange={(e) =>
                        setNewSlot((prev) => ({ ...prev, floor: e.target.value }))
                      }
                    />
                  </div>
                  <div style={{ marginTop: '18px' }}>
                    <button
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--accent-gold)',
                        background: 'var(--accent-gold)',
                        color: 'var(--bg-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'var(--transition)',
                      }}
                      disabled={addSlotLoading}
                    >
                      {addSlotLoading ? 'Adding...' : 'Add Slot'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedSlot && !adminModalOpen && modalMode === 'reserve' && (
        <div style={modalOverlayStyle} onClick={() => setSelectedSlot(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                color: 'var(--accent-gold)',
                fontSize: '11px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Reserve Slot
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '32px',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              {selectedSlot.slotName}
            </div>
            <div
              style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                marginBottom: '24px',
              }}
            >
              {selectedSlot.zone || '—'} • Floor {selectedSlot.floor ?? '—'}
            </div>
            {modalError ? (
              <div
                style={{
                  color: 'var(--danger)',
                  marginBottom: '14px',
                  animation: 'shake 0.4s ease',
                }}
              >
                {modalError}
              </div>
            ) : null}
            <form onSubmit={reserveSlot}>
              <div style={{ marginBottom: '18px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                  }}
                >
                  Vehicle Plate Number
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '14px 0 10px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                  value={reservationPlate}
                  onChange={(e) => setReservationPlate(e.target.value)}
                  placeholder="e.g. AA-12345"
                />
              </div>
              <div
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  marginTop: '-6px',
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center',
                }}
              >
                <span>ℹ</span>
                <span>Rate: 5 ETB per 30 minutes · Billed on payment</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="submit"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--accent-gold)',
                    background: 'var(--accent-gold)',
                    color: 'var(--bg-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'var(--transition)',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(0,0,0,0.2)',
                        borderTop: '2px solid var(--bg-primary)',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                  ) : null}
                  {modalLoading ? 'Confirming...' : 'Confirm Reservation'}
                </button>
                <button
                  type="button"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--text-secondary)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'var(--transition)',
                    flex: 1,
                  }}
                  onClick={() => setSelectedSlot(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedSlot &&
        !adminModalOpen &&
        modalMode === 'myreserved' &&
        actionTargetReservation && (
          <div style={modalOverlayStyle} onClick={() => setSelectedSlot(null)}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
              <div
                style={{
                  color: 'var(--accent-gold)',
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Your Reserved Slot
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '32px',
                  color: 'var(--text-primary)',
                  marginBottom: '24px',
                }}
              >
                {selectedSlot.slotName}
              </div>

              <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    background: 'rgba(201,168,76,0.12)',
                    color: 'var(--accent-gold-light)',
                    width: 'fit-content',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  RESERVED
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Vehicle Plate:</strong>{' '}
                  {actionTargetReservation.vehiclePlate || '—'}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Reserved since:</strong>{' '}
                  {formatTimeAgo(actionTargetReservation.startTime)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  {formatExactDate(actionTargetReservation.startTime)}
                </div>
                <div
                  style={{
                    color: 'var(--accent-gold-light)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  ⚠ Auto-releases in {getAutoReleaseMinutes(actionTargetReservation) ?? 0}{' '}
                  minutes if you don't arrive
                </div>
              </div>

              {modalError ? (
                <div
                  style={{
                    color: 'var(--danger)',
                    marginBottom: '14px',
                    animation: 'shake 0.4s ease',
                  }}
                >
                  {modalError}
                </div>
              ) : null}

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius)',
                  border: 'none',
                  background: 'var(--accent-gold)',
                  color: 'var(--bg-primary)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '18px',
                }}
                onClick={occupyReservation}
                disabled={arriveLoading}
              >
                {arriveLoading ? (
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(0,0,0,0.2)',
                      borderTop: '2px solid var(--bg-primary)',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                ) : (
                  ''
                )}
                {arriveLoading ? 'Checking in...' : "I have Arrived"}
              </button>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '18px',
                  marginBottom: '18px',
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {!cancelConfirmOpen ? (
                  <>
                    <button
                      type="button"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--danger)',
                        background: 'transparent',
                        color: 'var(--danger)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'var(--transition)',
                        width: '100%',
                      }}
                      onClick={() => setCancelConfirmOpen(true)}
                    >
                      Cancel Reservation
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--text-secondary)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'var(--transition)',
                        width: '100%',
                      }}
                      onClick={() => setSelectedSlot(null)}
                    >
                      Keep Waiting
                    </button>
                  </>
                ) : (
                  <div
                    style={{
                      padding: '14px',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius)',
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div
                      style={{
                        color: 'var(--text-primary)',
                        marginBottom: '10px',
                        fontSize: '13px',
                      }}
                    >
                      Cancel your reservation? This is free.
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--danger)',
                          background: 'var(--danger)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          transition: 'var(--transition)',
                          flex: 1,
                        }}
                        onClick={() =>
                          cancelReservation(actionTargetReservation.id)
                        }
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        style={{
                          padding: '8px 12px',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--text-secondary)',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: 600,
                          transition: 'var(--transition)',
                          flex: 1,
                        }}
                        onClick={() => setCancelConfirmOpen(false)}
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {selectedSlot &&
        !adminModalOpen &&
        modalMode === 'payment' &&
        actionTargetReservation && (
          <div style={modalOverlayStyle} onClick={() => setSelectedSlot(null)}>
            <div style={paymentModalStyle} onClick={(e) => e.stopPropagation()}>
              {paymentStep === 'bill' && (
                <>
                  <div
                    style={{
                      color: 'var(--accent-gold)',
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Ready to Leave?
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '32px',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}
                  >
                    {selectedSlot.slotName}
                  </div>
                  <div
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                      marginBottom: '24px',
                    }}
                  >
                    {selectedSlot.zone || '—'} • {actionTargetReservation.vehiclePlate || '—'}
                  </div>

                  {billLoading ? (
                    <div
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid rgba(255,255,255,0.2)',
                          borderTop: '2px solid var(--accent-gold)',
                          borderRadius: '50%',
                          animation: 'spin 0.7s linear infinite',
                          margin: '0 auto',
                        }}
                      />
                    </div>
                  ) : billData ? (
                    <>
                      <div
                        style={{
                          border: '1px solid var(--accent-gold)',
                          borderRadius: 'var(--radius)',
                          padding: '18px',
                          marginBottom: '18px',
                          background: 'rgba(201,168,76,0.08)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                            fontSize: '13px',
                          }}
                        >
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Parking Duration
                          </span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                            {billData.duration ||
                              formatDuration(actionTargetReservation.startTime, null)}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                            fontSize: '13px',
                          }}
                        >
                          <span style={{ color: 'var(--text-secondary)' }}>Rate</span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            5 ETB per 30 minutes
                          </span>
                        </div>
                        <div
                          style={{
                            borderTop: '1px solid var(--border-subtle)',
                            paddingTop: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ color: 'var(--text-secondary)' }}>
                            Total Amount
                          </span>
                          <span
                            style={{
                              color: 'var(--accent-gold)',
                              fontSize: '20px',
                              fontWeight: 600,
                            }}
                          >
                            {billData.fee?.toFixed(2) ||
                              getReservationFee(actionTargetReservation).toFixed(
                                2
                              )}{' '}
                            ETB
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          color: 'var(--text-muted)',
                          fontSize: '11px',
                          marginBottom: '18px',
                          textAlign: 'center',
                        }}
                      >
                        Final amount calculated at payment time
                      </div>
                      <div
                        style={{
                          color: 'var(--accent-gold-light)',
                          fontSize: '12px',
                          marginBottom: '18px',
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                        }}
                      >
                        <span>⏱</span>
                        <span>
                          Parked for{' '}
                          {formatTimeAgo(actionTargetReservation.startTime)}
                        </span>
                      </div>

                      {modalError ? (
                        <div
                          style={{
                            color: 'var(--danger)',
                            marginBottom: '14px',
                            animation: 'shake 0.4s ease',
                          }}
                        >
                          {modalError}
                        </div>
                      ) : null}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button
                          type="button"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--accent-gold)',
                            background: 'var(--accent-gold)',
                            color: 'var(--bg-primary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'var(--transition)',
                            width: '100%',
                          }}
                          onClick={() => setPaymentStep('payment')}
                        >
                          Proceed to Payment →
                        </button>
                        <button
                          type="button"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius)',
                            border: '1px solid var(--text-secondary)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'var(--transition)',
                            width: '100%',
                          }}
                          onClick={() => setSelectedSlot(null)}
                        >
                          Not Yet
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--danger)' }}>
                      Failed to load billing information
                    </div>
                  )}
                </>
              )}

              {paymentStep === 'payment' && (
                <>
                  <div
                    style={{
                      color: 'var(--accent-gold)',
                      fontSize: '11px',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    Choose Payment Method
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '24px',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                    }}
                  >
                    Amount to pay:
                  </div>
                  <div
                    style={{
                      color: 'var(--accent-gold)',
                      fontSize: '28px',
                      fontWeight: 600,
                      marginBottom: '24px',
                    }}
                  >
                    {billData?.fee?.toFixed(2) ||
                      getReservationFee(actionTargetReservation).toFixed(2)}{' '}
                    ETB
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      marginBottom: '24px',
                    }}
                  >
                    {[
                      {
                        value: 'CASH',
                        icon: '💵',
                        label: 'Cash',
                        subtitle: 'Pay at the parking booth',
                      },
                      {
                        value: 'CARD',
                        icon: '💳',
                        label: 'Card',
                        subtitle: 'Tap or insert your card',
                      },
                      {
                        value: 'MOBILE_MONEY',
                        icon: '📱',
                        label: 'Mobile Money',
                        subtitle: 'Pay via telebirr or CBE Birr',
                      },
                    ].map((method) => (
                      <div
                        key={method.value}
                        style={{
                          padding: '14px',
                          border: `1px solid ${selectedPaymentMethod === method.value ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                          borderRadius: 'var(--radius)',
                          background:
                            selectedPaymentMethod === method.value
                              ? 'rgba(201,168,76,0.08)'
                              : 'var(--bg-card)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'var(--transition)',
                        }}
                        onClick={() => setSelectedPaymentMethod(method.value)}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>{method.icon}</span>
                          <div>
                            <div
                              style={{
                                color: 'var(--text-primary)',
                                fontWeight: 600,
                                fontSize: '13px',
                              }}
                            >
                              {method.label}
                            </div>
                            <div
                              style={{
                                color: 'var(--text-secondary)',
                                fontSize: '12px',
                              }}
                            >
                              {method.subtitle}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: `2px solid ${selectedPaymentMethod === method.value ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                            background:
                              selectedPaymentMethod === method.value
                                ? 'var(--accent-gold)'
                                : 'transparent',
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  {modalError ? (
                    <div
                      style={{
                        color: 'var(--danger)',
                        marginBottom: '14px',
                        animation: 'shake 0.4s ease',
                      }}
                    >
                      {modalError}
                    </div>
                  ) : null}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--accent-gold)',
                        background: 'var(--accent-gold)',
                        color: 'var(--bg-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'var(--transition)',
                        width: '100%',
                        opacity: selectedPaymentMethod ? 1 : 0.5,
                        cursor: selectedPaymentMethod ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      onClick={processPayment}
                      disabled={!selectedPaymentMethod || paymentProcessing}
                    >
                      {paymentProcessing ? (
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid rgba(0,0,0,0.2)',
                            borderTop: '2px solid var(--bg-primary)',
                            borderRadius: '50%',
                            animation: 'spin 0.7s linear infinite',
                          }}
                        />
                      ) : null}
                      {paymentProcessing ? 'Processing...' : 'Confirm Payment'}
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--text-secondary)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'var(--transition)',
                        width: '100%',
                      }}
                      onClick={() => setPaymentStep('bill')}
                    >
                      Back
                    </button>
                  </div>
                </>
              )}

              {paymentStep === 'receipt' && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div
                    style={{
                      fontSize: '56px',
                      marginBottom: '16px',
                      animation: 'slideInToast 0.4s ease',
                    }}
                  >
                    ✓
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '28px',
                      color: 'var(--success)',
                      marginBottom: '24px',
                      fontWeight: 600,
                    }}
                  >
                    Payment Successful!
                  </div>

                  <div
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius)',
                      padding: '18px',
                      marginBottom: '24px',
                      textAlign: 'left',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Slot</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedSlot.slotName}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Duration</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {formatDuration(actionTargetReservation.startTime, null)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>Method</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedPaymentMethod === 'MOBILE_MONEY'
                          ? 'Mobile Money'
                          : selectedPaymentMethod === 'CARD'
                            ? 'Card'
                            : 'Cash'}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Amount Paid
                      </span>
                      <span
                        style={{
                          color: 'var(--accent-gold)',
                          fontWeight: 600,
                        }}
                      >
                        {billData?.fee?.toFixed(2) ||
                          getReservationFee(actionTargetReservation).toFixed(2)}{' '}
                        ETB
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      marginBottom: '24px',
                    }}
                  >
                    Thank you for using ParkWise
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0px',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '3px',
                        background: 'var(--border-subtle)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          background: 'var(--accent-gold)',
                          width: `${(countdown / 10) * 100}%`,
                          transition: 'width 10s linear',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        marginBottom: '18px',
                        textAlign: 'center',
                      }}
                    >
                      Closing in {countdown} seconds
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--accent-gold)',
                      background: 'var(--accent-gold)',
                      color: 'var(--bg-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'var(--transition)',
                      width: '100%',
                    }}
                    onClick={() => {
                      if (countdownIntervalRef.current) {
                        window.clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                      }
                      setSelectedSlot(null);
                      setActionTargetReservation(null);
                      setPaymentStep('bill');
                      setSelectedPaymentMethod(null);
                      setBillData(null);
                      setCountdown(10);
                    }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      {selectedSlot && !adminModalOpen && modalMode === 'info' && (
        <div style={modalOverlayStyle} onClick={() => setSelectedSlot(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '30px',
                color: 'var(--text-primary)',
                marginBottom: '18px',
              }}
            >
              {selectedSlot.slotName}
            </div>

            <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '999px',
                  background:
                    parseStatus(selectedSlot.status) === 'RESERVED'
                      ? 'rgba(201,168,76,0.12)'
                      : 'rgba(192,57,43,0.12)',
                  color:
                    parseStatus(selectedSlot.status) === 'RESERVED'
                      ? 'var(--accent-gold-light)'
                      : 'var(--danger)',
                  width: 'fit-content',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}
              >
                {parseStatus(selectedSlot.status)}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                This slot is currently taken
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                Please choose another available slot
              </div>
            </div>

            <button
              type="button"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--text-secondary)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'var(--transition)',
                width: '100%',
              }}
              onClick={() => setSelectedSlot(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedSlot && isAdminFn() && adminModalOpen && (
        <div style={modalOverlayStyle} onClick={() => setAdminModalOpen(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '30px',
                fontWeight: 400,
                marginBottom: '14px',
              }}
            >
              Slot Details
            </div>
            <div style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Slot: {selectedSlot.slotName}
            </div>
            <div style={{ marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Zone: {selectedSlot.zone}
            </div>
            <div
              style={{
                marginBottom: '20px',
                color: 'var(--text-secondary)',
              }}
            >
              Floor: {selectedSlot.floor}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--danger)',
                  background: 'var(--danger)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                }}
                onClick={() => deleteSlot(selectedSlot.id)}
              >
                Delete Slot
              </button>
              <button
                type="button"
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--text-secondary)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                }}
                onClick={() => setAdminModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 3000,
          maxWidth: '360px',
        }}
      >
        {toastList.map((toast) => (
          <div
            key={toast.id}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderLeft: `4px solid ${toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : toast.type === 'warning' ? 'var(--warning)' : 'var(--accent-gold)'}`,
              padding: '14px 16px',
              boxShadow: '0 16px 44px rgba(0,0,0,0.35)',
              transform: 'translateX(0)',
              transition: 'var(--transition)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              width: '320px',
              animation: 'slideInToast 0.25s ease',
            }}
          >
            <div style={{ fontSize: '18px', lineHeight: 1 }}>
              {toast.type === 'success'
                ? '✓'
                : toast.type === 'error'
                  ? '✗'
                  : toast.type === 'warning'
                    ? '⚠'
                    : 'ℹ'}
            </div>
            <div
              style={{
                flex: 1,
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
            >
              {toast.message}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                color: 'var(--text-secondary)',
                fontSize: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes slideInToast { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slotFlash { 0% { background: var(--bg-card); } 30% { background: rgba(201,168,76,0.25); } 100% { background: var(--bg-card); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 768px) {
          .dashboard-modal { width: 100% !important; max-width: 100% !important; min-height: 100vh; border-radius: 0 !important; padding: 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
