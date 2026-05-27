import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/powiadomieniaService';

const NOTIFICATION_TYPE_LABELS = {
  ADMIN_LOGIN: 'Logowanie administratora',
  NEW_EVENT: 'Nowe wydarzenie',
  FAVORITE_LOGIN: 'Logowanie z ulubionych',
  OBSERVED_EVENT_END: 'Zakończenie wydarzenia',
  OBSERVED_EVENT_START: 'Zbliżający się start',
  OBSERVED_SEAT_FREED: 'Zwolnienie miejsca',
  NEW_REFUND_REQUEST: 'Nowy wniosek o zwrot',
  NEW_ORGANIZER_REQUEST: 'Nowy wniosek o rolę organizatora',
  NEW_SECURITY_REPORT: 'Nowe zgłoszenie bezpieczeństwa',
};

const formatNotificationTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTypeLabel = (type) => NOTIFICATION_TYPE_LABELS[type] || type || 'Powiadomienie';
const POLL_INTERVAL_MS = 8000;
const TOAST_AUTO_HIDE_MS = 5000;

const NotificationBell = () => {
  const { authCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const deleteAllConfirmRef = useRef(null);
  const prevUnreadRef = useRef(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadNotificationsCount(authCredentials);
      const nextCount = Number(data?.count) || 0;
      const prevCount = prevUnreadRef.current;
      if (prevCount !== null && nextCount > prevCount) {
        setShowToast(true);
      }
      prevUnreadRef.current = nextCount;
      setUnreadCount(nextCount);
    } catch {
      /* badge opcjonalny — nie blokuj UI */
    }
  }, [authCredentials]);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setStatus('');
    try {
      const list = await getNotifications(authCredentials, 30);
      setNotifications(Array.isArray(list) ? list : []);
      await refreshUnreadCount();
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się pobrać powiadomień.');
    } finally {
      setIsLoading(false);
    }
  }, [authCredentials, refreshUnreadCount]);

  useEffect(() => {
    refreshUnreadCount();
    const intervalId = window.setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    const onFocus = () => refreshUnreadCount();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!showToast) return undefined;
    const timeoutId = window.setTimeout(() => setShowToast(false), TOAST_AUTO_HIDE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [showToast]);

  useEffect(() => {
    if (!panelOpen) return undefined;
    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 15000);
    return () => window.clearInterval(intervalId);
  }, [panelOpen, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  useEffect(() => {
    if (!panelOpen) setShowDeleteAllConfirm(false);
  }, [panelOpen]);

  useEffect(() => {
    if (!showDeleteAllConfirm) return undefined;
    const handleClickOutsideConfirm = (event) => {
      if (deleteAllConfirmRef.current && !deleteAllConfirmRef.current.contains(event.target)) {
        setShowDeleteAllConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideConfirm);
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirm);
  }, [showDeleteAllConfirm]);

  const handleTogglePanel = () => {
    setPanelOpen((open) => !open);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.read && notification?.id != null) {
      try {
        await markNotificationAsRead(authCredentials, notification.id);
        setNotifications((prev) => prev.map((item) => (
          item.id === notification.id ? { ...item, read: true } : item
        )));
        setUnreadCount((prev) => {
          const next = Math.max(0, prev - 1);
          prevUnreadRef.current = next;
          return next;
        });
      } catch (error) {
        setStatus(error.response?.data?.message || 'Nie udało się oznaczyć jako przeczytane.');
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead(authCredentials);
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      prevUnreadRef.current = 0;
      setStatus('');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się oznaczyć wszystkich jako przeczytane.');
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event?.stopPropagation();
    if (notificationId == null) return;
    try {
      await deleteNotification(authCredentials, notificationId);
      setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
      await refreshUnreadCount();
      setStatus('');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się usunąć powiadomienia.');
    }
  };

  const handleOpenDeleteAllConfirm = (event) => {
    event?.stopPropagation();
    if (notifications.length === 0) return;
    setShowDeleteAllConfirm((open) => !open);
  };

  const handleConfirmDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteAllNotifications(authCredentials);
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadRef.current = 0;
      setStatus('');
      setShowDeleteAllConfirm(false);
    } catch (error) {
      setStatus(error.response?.data?.message || 'Nie udało się usunąć powiadomień.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  const handleOpenFromToast = () => {
    setShowToast(false);
    setPanelOpen(true);
  };

  const toastPortal = showToast
    ? createPortal(
      <div className="notification-toast" role="status" aria-live="polite">
        <span className="notification-toast-text">Masz nową wiadomość</span>
        <button type="button" className="notification-toast-action" onClick={handleOpenFromToast}>
          Zobacz
        </button>
        <button
          type="button"
          className="notification-toast-close"
          aria-label="Zamknij"
          onClick={() => setShowToast(false)}
        >
          ×
        </button>
      </div>,
      document.body
    )
    : null;

  return (
    <>
    {toastPortal}
    <div className="notification-bell-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="btn-icon"
        aria-label="Powiadomienia"
        aria-expanded={panelOpen}
        onClick={handleTogglePanel}
      >
        <img src="/icons/school-bell.png" alt="Powiadomienia" style={{ width: '24px', height: '24px' }} />
        {unreadCount > 0 ? (
          <span className="notification-bell-badge" aria-hidden="true">{badgeLabel}</span>
        ) : null}
      </button>

      <div className={`notification-panel ${panelOpen ? 'open' : ''}`} role="dialog" aria-label="Lista powiadomień">
        <div className="notification-panel-header">
          <h4>Powiadomienia</h4>
          <div className="notification-panel-actions">
            {unreadCount >= 0 ? (
              <span 
                className="permission-tooltip has-tooltip" 
                data-tooltip="Oznacz wszystkie jako przeczytane"
                style={{ cursor: 'var(--cursor-pointer)', display: 'inline-block' }}
              >
                <img src="/icons/check-mark.png" alt="" width={22} height={22} onClick={handleMarkAllRead} style={{ cursor: 'var(--cursor-pointer)' }} />
              </span>
            ) : null}
            {notifications.length >= 0 ? (
              <span
                ref={deleteAllConfirmRef}
                className={`inline-confirm-anchor permission-tooltip${showDeleteAllConfirm ? '' : ' has-tooltip'}`}
                data-tooltip="Usuń wszystkie powiadomienia"
                style={{ cursor: 'var(--cursor-pointer)', display: 'inline-block' }}
              >
                {showDeleteAllConfirm ? (
                  <div className="inline-confirm-popover" role="group" aria-label="Potwierdź usunięcie wszystkich powiadomień">
                    <button
                      type="button"
                      className="btn-new-event inline-confirm-popover-btn"
                      onClick={handleConfirmDeleteAll}
                      disabled={isDeletingAll}
                    >
                      {isDeletingAll ? '…' : 'Tak'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary inline-confirm-popover-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteAllConfirm(false);
                      }}
                      disabled={isDeletingAll}
                    >
                      Nie
                    </button>
                  </div>
                ) : null}
                <img
                  src="/icons/paper-bucket.png"
                  alt=""
                  width={22}
                  height={22}
                  onClick={handleOpenDeleteAllConfirm}
                  style={{ cursor: 'var(--cursor-pointer)' }}
                />
              </span>
            ) : null}
          </div>
        </div>

        <div className="notification-panel-list">
          {isLoading && notifications.length === 0 ? (
            <p className="notification-panel-empty">Ładowanie...</p>
          ) : null}
          {!isLoading && notifications.length === 0 ? (
            <p className="notification-panel-empty">Brak powiadomień.</p>
          ) : null}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item-row${notification.read ? '' : ' is-unread'}`}
            >
              <button
                type="button"
                className="notification-item"
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="notification-item-type">{getTypeLabel(notification.type)}</span>
                <span className="notification-item-message">{notification.message}</span>
                <span className="notification-item-time">{formatNotificationTime(notification.createdAt)}</span>
              </button>
            </div>
          ))}
        </div>

        {status ? <p className="notification-panel-status">{status}</p> : null}

        <button
          type="button"
          className="notification-panel-settings-link"
          onClick={() => {
            setPanelOpen(false);
            navigate('/ustawienia', { state: { settingsTab: 'powiadomienia' } });
          }}
        >
          Ustawienia powiadomień
        </button>
      </div>
    </div>
    </>
  );
};

export default NotificationBell;
