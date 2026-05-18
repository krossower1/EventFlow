import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Topbar = () => {
  const { currentUser, handleLogout, handleDeleteOwnAccount } = useContext(AuthContext);
  const navigate = useNavigate();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-left-row">
          <button type="button" className="btn-back-tab" onClick={() => navigate(-1)}>
            Wstecz
          </button>
          <div className="header-user-meta">
            <div className="header-user-line">
              Twoja rola: <span className="header-accent">{currentUser.rola}</span>
            </div>
            <div className="header-user-line">
              Zalogowany jako: <span className="header-accent">{currentUser.imie} {currentUser.nazwisko}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="panel-admin">
          <span
            className={`permission-tooltip ${currentUser?.rola !== 'ADMIN' ? 'has-tooltip' : ''}`}
            data-tooltip={currentUser?.rola !== 'ADMIN' ? 'Dostępne tylko dla administratora' : ''}
          >
            <button
              type="button"
              className="btn-icon"
              aria-label="Panel admina"
              onClick={() => {
                if (currentUser?.rola !== 'ADMIN') return;
                navigate('/admin');
              }}
              disabled={currentUser?.rola !== 'ADMIN'}
            >
              <img src="/panel_admin.png" alt="" />
            </button>
          </span>
        </div>

        <div className="account-menu-wrapper">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setAccountMenuOpen((open) => !open)}
          >
            <img src="/account.png" alt="Konto" />
          </button>

          <div className={`account-menu ${accountMenuOpen ? 'open' : ''}`}>
            <button type="button" className="account-menu-item" onClick={handleLogout}>
              Wyloguj
            </button>
            <button
              type="button"
              className="account-menu-item account-menu-item--danger"
              onClick={async () => {
                if (!window.confirm('Czy na pewno chcesz usunąć własne konto?')) return;
                try {
                  await handleDeleteOwnAccount();
                } catch (error) {
                  // eslint-disable-next-line no-alert
                  window.alert(error.response?.data?.message || 'Nie udało się usunąć konta.');
                }
              }}
            >
              Usuń konto
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;