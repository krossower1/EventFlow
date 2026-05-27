import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

const Topbar = () => {
  const { t } = useTranslation();
  const { currentUser, handleLogout, handleDeleteOwnAccount } = useContext(AuthContext);
  const navigate = useNavigate();
  const accountMenuWrapperRef = useRef(null);
  const deleteAccountConfirmRef = useRef(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState('');

  useEffect(() => {
    if (!accountMenuOpen) {
      setShowDeleteAccountConfirm(false);
      setDeleteAccountError('');
      return undefined;
    }
    const handleClickOutside = (event) => {
      if (accountMenuWrapperRef.current && !accountMenuWrapperRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!showDeleteAccountConfirm) return undefined;
    const handleClickOutsideConfirm = (event) => {
      if (deleteAccountConfirmRef.current && !deleteAccountConfirmRef.current.contains(event.target)) {
        setShowDeleteAccountConfirm(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideConfirm);
    return () => document.removeEventListener('mousedown', handleClickOutsideConfirm);
  }, [showDeleteAccountConfirm]);

  const handleToggleDeleteAccountConfirm = (event) => {
    event.stopPropagation();
    setDeleteAccountError('');
    setShowDeleteAccountConfirm((open) => !open);
  };

  const handleConfirmDeleteAccount = async (event) => {
    event.stopPropagation();
    setIsDeletingAccount(true);
    setDeleteAccountError('');
    try {
      await handleDeleteOwnAccount();
    } catch (error) {
      setDeleteAccountError(error.response?.data?.message || t('topbar.delete.error'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-left-row">
          <div className="panel-admin">
            <span
              className={`permission-tooltip ${currentUser?.rola !== 'ADMIN' ? 'has-tooltip' : ''}`}
              data-tooltip={currentUser?.rola !== 'ADMIN' ? t('topbar.adminOnly') : ''}
            >
              <button
                type="button"
                className="btn-icon"
                aria-label={t('topbar.adminPanel')}
                onClick={() => {
                  if (currentUser?.rola !== 'ADMIN') return;
                  navigate('/admin');
                }}
                disabled={currentUser?.rola !== 'ADMIN'}
              >
                <img src="/icons/panel_admin.png" alt="" />
              </button>
            </span>
              <button type="button" className="btn-icon" aria-label={t('topbar.refresh')} onClick={() => window.location.reload()} style={{ cursor: 'var(--cursor-pointer)', marginLeft: '10px' }}>
                <img src="/icons/refresh.png" alt="" width={22} height={22} />
              </button>
          </div>
          <button type="button" className="btn-back-tab" onClick={() => navigate(-1)}>
            {t('topbar.back')}
          </button>
          <div className="header-user-meta">
            <div className="header-user-line">
              {t('topbar.yourRole')} <span className="header-accent">{currentUser.rola}</span>
            </div>
            <div className="header-user-line">
              {t('topbar.loggedAs')} <span className="header-accent">{currentUser.imie} {currentUser.nazwisko} ({currentUser.login})</span>
            </div>
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <NotificationBell />
        <div className="account-menu-wrapper" ref={accountMenuWrapperRef}>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            <img src="/icons/account.png" alt={t('topbar.account')} />
          </button>

          <div className={`account-menu ${accountMenuOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="account-menu-item"
              onClick={() => {
                setAccountMenuOpen(false);
                handleLogout();
              }}
            >
              {t('topbar.logout')}
            </button>
            <div ref={deleteAccountConfirmRef} className="account-menu-item-wrap">
              {showDeleteAccountConfirm ? (
                <div className="inline-confirm-popover" role="group" aria-label={t('topbar.delete.confirmAria')}>
                  <button
                    type="button"
                    className="btn-new-event inline-confirm-popover-btn"
                    onClick={handleConfirmDeleteAccount}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? t('topbar.delete.deleting') : t('topbar.common.yes')}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary inline-confirm-popover-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteAccountConfirm(false);
                    }}
                    disabled={isDeletingAccount}
                  >
                    {t('topbar.common.no')}
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                className="account-menu-item account-menu-item--danger"
                onClick={handleToggleDeleteAccountConfirm}
              >
                {t('topbar.delete.account')}
              </button>
            </div>
            {deleteAccountError ? (
              <p className="account-menu-delete-error" role="alert">{deleteAccountError}</p>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
