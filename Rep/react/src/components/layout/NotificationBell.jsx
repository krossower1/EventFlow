import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/powiadomieniaService';

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

const POLL_INTERVAL_MS = 8000;
const TOAST_AUTO_HIDE_MS = 5000;

const NotificationBell = () => {
  const { t } = useTranslation();
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
  const notificationTypeLabels = {
    ADMIN_LOGIN: t('notifications.types.ADMIN_LOGIN'),
    NEW_EVENT: t('notifications.types.NEW_EVENT'),
    FAVORITE_LOGIN: t('notifications.types.FAVORITE_LOGIN'),
    OBSERVED_EVENT_END: t('notifications.types.OBSERVED_EVENT_END'),
    OBSERVED_EVENT_START: t('notifications.types.OBSERVED_EVENT_START'),
    OBSERVED_SEAT_FREED: t('notifications.types.OBSERVED_SEAT_FREED'),
    NEW_REFUND_REQUEST: t('notifications.types.NEW_REFUND_REQUEST'),
    NEW_ORGANIZER_REQUEST: t('notifications.types.NEW_ORGANIZER_REQUEST'),
    NEW_SECURITY_REPORT: t('notifications.types.NEW_SECURITY_REPORT'),
    ORG_EVENT_JOIN: t('notifications.types.ORG_EVENT_JOIN'),
    ORG_EVENT_SOLD_OUT: t('notifications.types.ORG_EVENT_SOLD_OUT'),
    ORG_EVENT_REVIEW: t('notifications.types.ORG_EVENT_REVIEW'),
    ORG_EVENT_START: t('notifications.types.ORG_EVENT_START'),
    ORG_EVENT_REFUND: t('notifications.types.ORG_EVENT_REFUND'),
  };
  const getTypeLabel = (type) => notificationTypeLabels[type] || type || t('notifications.types.default');

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
      setStatus(error.response?.data?.message || t('notifications.status.loadError'));
    } finally {
      setIsLoading(false);
    }
  }, [authCredentials, refreshUnreadCount, t]);

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
        setStatus(error.response?.data?.message || t('notifications.status.markReadError'));
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
      setStatus(error.response?.data?.message || t('notifications.status.markAllReadError'));
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
      setStatus(error.response?.data?.message || t('notifications.status.deleteOneError'));
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
      setStatus(error.response?.data?.message || t('notifications.status.deleteAllError'));
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
        <span className="notification-toast-text">{t('notifications.toast.newMessage')}</span>
        <button type="button" className="notification-toast-action" onClick={handleOpenFromToast}>
          {t('notifications.toast.view')}
        </button>
        <button
          type="button"
          className="notification-toast-close"
          aria-label={t('notifications.common.close')}
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
        aria-label={t('notifications.button.ariaLabel')}
        aria-expanded={panelOpen}
        onClick={handleTogglePanel}
      >
        <img src="/icons/school-bell.png" alt={t('notifications.button.ariaLabel')} style={{ width: '24px', height: '24px' }} />
        {unreadCount > 0 ? (
          <span className="notification-bell-badge" aria-hidden="true">{badgeLabel}</span>
        ) : null}
      </button>

      <div className={`notification-panel ${panelOpen ? 'open' : ''}`} role="dialog" aria-label={t('notifications.panel.ariaLabel')}>
        <div className="notification-panel-header">
          <h4>{t('notifications.panel.title')}</h4>
          <div className="notification-panel-actions">
            {unreadCount >= 0 ? (
              <span 
                className="permission-tooltip has-tooltip" 
                data-tooltip={t('notifications.panel.markAllTooltip')}
                style={{ cursor: 'var(--cursor-pointer)', display: 'inline-block' }}
              >
                <img src="/icons/check-mark.png" alt="" width={22} height={22} onClick={handleMarkAllRead} style={{ cursor: 'var(--cursor-pointer)' }} />
              </span>
            ) : null}
            {notifications.length >= 0 ? (
              <span
                ref={deleteAllConfirmRef}
                className={`inline-confirm-anchor permission-tooltip${showDeleteAllConfirm ? '' : ' has-tooltip'}`}
                data-tooltip={t('notifications.panel.deleteAllTooltip')}
                style={{ cursor: 'var(--cursor-pointer)', display: 'inline-block' }}
              >
                {showDeleteAllConfirm ? (
                  <div className="inline-confirm-popover" role="group" aria-label={t('notifications.panel.confirmDeleteAllAria')}>
                    <button
                      type="button"
                      className="btn-new-event inline-confirm-popover-btn"
                      onClick={handleConfirmDeleteAll}
                      disabled={isDeletingAll}
                    >
                      {isDeletingAll ? t('notifications.common.deleting') : t('notifications.common.yes')}
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
                      {t('notifications.common.no')}
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
            <p className="notification-panel-empty">{t('notifications.panel.loading')}</p>
          ) : null}
          {!isLoading && notifications.length === 0 ? (
            <p className="notification-panel-empty">{t('notifications.panel.empty')}</p>
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
          {t('notifications.panel.settingsLink')}
        </button>
      </div>
    </div>
    </>
  );
};

export default NotificationBell;
