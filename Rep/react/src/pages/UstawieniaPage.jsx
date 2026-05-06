import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { authService } from '../services/authService';
import QRCode from 'qrcode';

const tabs = [
  { id: 'profil', label: 'Profil' },
  { id: 'powiadomienia', label: 'Powiadomienia' },
  { id: 'bezpieczenstwo', label: 'Bezpieczeństwo' },
  { id: 'uklady-sal', label: 'Układy sal' },
  { id: 'wyglad', label: 'Wygląd' },
  { id: 'jezyk-region', label: 'Język i region' },
  { id: 'platnosci', label: 'Płatności' }
];

const securityTabs = [
  { id: 'zmiana-hasla', label: 'Zmiana hasła' },
  { id: '2fa', label: '2FA' },
  { id: 'czas-sesji', label: 'Czas sesji' },
  { id: 'historia-logowan', label: 'Historia logowań' }
];

const UstawieniaPage = () => {
  const { currentUser, authCredentials, applyAuthenticatedUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profil');
  const [activeSecurityTab, setActiveSecurityTab] = useState('zmiana-hasla');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  // Stan zapisu i komunikaty tylko dla formularza zmiany hasła.
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isLoadingTwoFactorStatus, setIsLoadingTwoFactorStatus] = useState(false);
  const [isGeneratingTwoFactorSecret, setIsGeneratingTwoFactorSecret] = useState(false);
  const [isSavingTwoFactor, setIsSavingTwoFactor] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState({ secret: '', otpAuthUrl: '' });
  const [twoFactorEnableCode, setTwoFactorEnableCode] = useState('');
  const [twoFactorDisableCode, setTwoFactorDisableCode] = useState('');
  const [twoFactorStatus, setTwoFactorStatus] = useState({ type: '', message: '' });
  const [twoFactorQrDataUrl, setTwoFactorQrDataUrl] = useState('');

  const [profileForm, setProfileForm] = useState({
    imie: currentUser.imie || '',
    nazwisko: currentUser.nazwisko || '',
    email: currentUser.email || '',
    telefon: currentUser.telefon || ''
  });

  const profileFields = useMemo(() => ([
    { key: 'imie', label: 'Imię', type: 'text' },
    { key: 'nazwisko', label: 'Nazwisko', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'telefon', label: 'Telefon', type: 'tel' }
  ]), []);

  // Przywraca formularz profilu do danych aktualnie zalogowanego użytkownika.
  const resetProfileForm = () => {
    setProfileForm({
      imie: currentUser.imie || '',
      nazwisko: currentUser.nazwisko || '',
      email: currentUser.email || '',
      telefon: currentUser.telefon || ''
    });
  };

  // Włącza tryb edycji profilu.
  const startEditing = () => {
    resetProfileForm();
    setIsEditingProfile(true);
    setStatus({ type: '', message: '' });
  };

  // Anuluje edycję i cofa lokalne zmiany formularza.
  const handleCancel = () => {
    resetProfileForm();
    setIsEditingProfile(false);
    setStatus({ type: '', message: '' });
  };

  // Buduje config zapytań z ciasteczkiem sesji oraz nagłówkiem Basic Auth (gdy dostępny).
  const getRequestConfig = () => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  };

  // Zapisuje zmiany profilu; przy zmianie emaila uruchamia modal weryfikacji kodem.
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setStatus({ type: '', message: '' });
    try {
      const normalizedCurrentEmail = (currentUser.email || '').trim().toLowerCase();
      const payload = {
        imie: profileForm.imie.trim(),
        nazwisko: profileForm.nazwisko.trim(),
        email: profileForm.email.trim(),
        telefon: profileForm.telefon.trim()
      };
      const normalizedNextEmail = payload.email.toLowerCase();
      // Zmiana emaila uruchamia backendowy flow weryfikacji kodem.
      const emailChanged = normalizedNextEmail && normalizedNextEmail !== normalizedCurrentEmail;

      const response = await apiClient.put('/users/me', payload, getRequestConfig());
      const updatedUser = response.data || {};

      applyAuthenticatedUser({
        ...currentUser,
        ...updatedUser,
        imie: updatedUser.imie ?? payload.imie,
        nazwisko: updatedUser.nazwisko ?? payload.nazwisko,
        email: updatedUser.email ?? payload.email,
        telefon: updatedUser.telefon ?? payload.telefon
      });

      setIsEditingProfile(false);
      if (emailChanged) {
        // modal z kodem wyświetlany dopiero po skutecznym zapisie danych.
        setPendingVerificationEmail(payload.email);
        setVerificationCode('');
        setStatus({
          type: 'success',
          message: 'Zmiany zapisane. Wysłaliśmy kod weryfikacyjny na nowy email. Zweryfikuj adres, aby aktywować zmianę.'
        });
      } else {
        setStatus({ type: 'success', message: 'Zmiany zostały zapisane.' });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się zapisać zmian profilu.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Potwierdza nowy email kodem i kończy proces weryfikacji.
  const handleVerifyEmail = async (event) => {
    if (event) event.preventDefault();
    const emailToVerify = pendingVerificationEmail.trim();
    const codeToVerify = verificationCode.trim();
    if (!emailToVerify || !codeToVerify) {
      setStatus({ type: 'error', message: 'Podaj kod weryfikacyjny.' });
      return;
    }

    setIsVerifyingEmail(true);
    setStatus({ type: '', message: '' });
    try {
      const response = await apiClient.post(
        '/auth/verify-email',
        { email: emailToVerify, code: codeToVerify },
        { withCredentials: true }
      );
      const success = response?.data?.success !== false;
      if (!success) {
        throw new Error(response?.data?.message || 'Weryfikacja nie powiodła się.');
      }

      setPendingVerificationEmail('');
      setVerificationCode('');
      setStatus({ type: 'success', message: 'Nowy email został zweryfikowany.' });
      // aktualizacja kontekstu od razu, aby UI pokazał nowy email bez przeładowania.
      applyAuthenticatedUser({ ...currentUser, email: emailToVerify });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Weryfikacja nie powiodła się.'
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Obsługuje pełny flow zmiany hasła: walidacja pól, request do API i komunikat dla użytkownika.
  const handleSavePassword = async (event) => {
    event.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    const oldPassword = passwordForm.oldPassword.trim();
    const newPassword = passwordForm.newPassword.trim();
    const confirmNewPassword = passwordForm.confirmNewPassword.trim();

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordStatus({ type: 'error', message: 'Uzupełnij wszystkie pola.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ type: 'error', message: 'Nowe hasło i potwierdzenie muszą być takie same.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      await apiClient.put(
        '/users/me/password',
        {
          oldPassword,
          newPassword,
          confirmNewPassword
        },
        getRequestConfig()
      );
      setPasswordStatus({ type: 'success', message: 'Hasło zostało zmienione.' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      setPasswordStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się zmienić hasła.'
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  useEffect(() => {
    // Odczyt statusu 2FA tylko gdy użytkownik wejdzie w odpowiednią podsekcję ustawień.
    const loadTwoFactorStatus = async () => {
      if (activeTab !== 'bezpieczenstwo' || activeSecurityTab !== '2fa') return;
      setIsLoadingTwoFactorStatus(true);
      try {
        const response = await authService.getTwoFactorStatus();
        setTwoFactorEnabled(Boolean(response?.enabled));
      } catch (error) {
        setTwoFactorStatus({
          type: 'error',
          message: error.response?.data?.message || 'Nie udało się pobrać statusu 2FA.'
        });
      } finally {
        setIsLoadingTwoFactorStatus(false);
      }
    };
    loadTwoFactorStatus();
  }, [activeTab, activeSecurityTab]);

  useEffect(() => {
    // Front generuje obraz QR lokalnie z URI otpauth zwróconego przez backend.
    const buildQr = async () => {
      if (!twoFactorSetup.otpAuthUrl) {
        setTwoFactorQrDataUrl('');
        return;
      }
      try {
        const qrDataUrl = await QRCode.toDataURL(twoFactorSetup.otpAuthUrl, {
          width: 220,
          margin: 1
        });
        setTwoFactorQrDataUrl(qrDataUrl);
      } catch (error) {
        setTwoFactorQrDataUrl('');
        setTwoFactorStatus({ type: 'error', message: 'Nie udało się wygenerować kodu QR.' });
      }
    };
    buildQr();
  }, [twoFactorSetup.otpAuthUrl]);

  const handleGenerateTwoFactorSecret = async () => {
    // Inicjuje setup 2FA: backend zwraca sekret + URI, a UI pokazuje kod QR.
    setTwoFactorStatus({ type: '', message: '' });
    setIsGeneratingTwoFactorSecret(true);
    try {
      const response = await authService.startTwoFactorSetup();
      setTwoFactorSetup({
        secret: response?.secret || '',
        otpAuthUrl: response?.otpAuthUrl || ''
      });
      setTwoFactorEnableCode('');
    } catch (error) {
      setTwoFactorStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się rozpocząć konfiguracji 2FA.'
      });
    } finally {
      setIsGeneratingTwoFactorSecret(false);
    }
  };

  const handleEnableTwoFactor = async (event) => {
    // Finalny krok aktywacji 2FA po wpisaniu kodu z aplikacji Authenticator.
    event.preventDefault();
    setTwoFactorStatus({ type: '', message: '' });
    if (!twoFactorEnableCode.trim()) {
      setTwoFactorStatus({ type: 'error', message: 'Podaj kod 2FA.' });
      return;
    }
    setIsSavingTwoFactor(true);
    try {
      await authService.enableTwoFactor(twoFactorEnableCode.trim());
      setTwoFactorEnabled(true);
      setTwoFactorSetup({ secret: '', otpAuthUrl: '' });
      setTwoFactorEnableCode('');
      setTwoFactorDisableCode('');
      setTwoFactorStatus({ type: 'success', message: '2FA zostało włączone.' });
    } catch (error) {
      setTwoFactorStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się włączyć 2FA.'
      });
    } finally {
      setIsSavingTwoFactor(false);
    }
  };

  const handleDisableTwoFactor = async (event) => {
    // Wyłączenie 2FA wymaga aktualnego kodu, aby uniknąć przypadkowego zdjęcia ochrony.
    event.preventDefault();
    setTwoFactorStatus({ type: '', message: '' });
    if (!twoFactorDisableCode.trim()) {
      setTwoFactorStatus({ type: 'error', message: 'Podaj kod 2FA, aby wyłączyć ochronę.' });
      return;
    }
    setIsSavingTwoFactor(true);
    try {
      await authService.disableTwoFactor(twoFactorDisableCode.trim());
      setTwoFactorEnabled(false);
      setTwoFactorDisableCode('');
      setTwoFactorSetup({ secret: '', otpAuthUrl: '' });
      setTwoFactorStatus({ type: 'success', message: '2FA zostało wyłączone.' });
    } catch (error) {
      setTwoFactorStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się wyłączyć 2FA.'
      });
    } finally {
      setIsSavingTwoFactor(false);
    }
  };

  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <h2>Ustawienia</h2>
        <nav className="settings-nav" aria-label="Zakładki ustawień">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'bezpieczenstwo') {
                  setActiveSecurityTab('zmiana-hasla');
                }
                setStatus({ type: '', message: '' });
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="settings-content">
        {activeTab === 'profil' ? (
          <div className="settings-panel">
            <h3>Profil</h3>
            <p>Dane konta zalogowanego użytkownika.</p>

            <div className="settings-profile-form">
              {profileFields.map((field) => (
                <label key={field.key} htmlFor={`profil-${field.key}`}>
                  {field.label}
                  <input
                    id={`profil-${field.key}`}
                    type={field.type}
                    value={isEditingProfile ? profileForm[field.key] : (currentUser[field.key] || '')}
                    onChange={(event) => {
                      if (!isEditingProfile) return;
                      setProfileForm((prev) => ({ ...prev, [field.key]: event.target.value }));
                    }}
                    disabled={!isEditingProfile}
                  />
                </label>
              ))}
            </div>

            {status.message && (
              <p className={`status-message ${status.type === 'error' ? 'status-error' : 'status-success'}`}>
                {status.message}
              </p>
            )}

            <div className="settings-actions">
              {!isEditingProfile ? (
                <button type="button" className="btn-new-event" onClick={startEditing}>
                  Edytuj profil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-new-event"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Anuluj
                  </button>
                </>
              )}
            </div>

          </div>
        ) : activeTab === 'powiadomienia' ? (
          <div className="settings-panel">
            <h3>Powiadomienia</h3>
            <p>Propozycje dla powiadomień:</p>
            <ul>
              <li>Powiadomienie o nowym wydarzeniu</li>
              <li>Powiadomienie o zmianie statusu wydarzenia (obserwowanego! funkcja obserwacji nie wprowadzona jeszcze)</li>
              <li>Powiadomienie o zmianie statusu biletu (to samo)</li>
              <li>Powiadomienie o kończącej się sesji (na przykład przy minucie do końca)</li>
            </ul>
          </div>
        ) : activeTab === 'bezpieczenstwo' ? (
          <div className="settings-panel">
            <h3>Bezpieczeństwo</h3>
            <nav className="settings-subnav" aria-label="Sekcje bezpieczeństwa">
              {securityTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`settings-subnav-item ${activeSecurityTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveSecurityTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="settings-subpanel">
              {activeSecurityTab === 'zmiana-hasla' && (
                <>
                  <h4>Zmiana hasła</h4>
                  <form className="settings-password-form" onSubmit={handleSavePassword}>
                    <label htmlFor="old-password">
                      Stare hasło
                      <div className="settings-password-input-wrap">
                        <input
                          id="old-password"
                          type={passwordVisibility.oldPassword ? 'text' : 'password'}
                          value={passwordForm.oldPassword}
                          onChange={(event) => {
                            setPasswordForm((prev) => ({ ...prev, oldPassword: event.target.value }));
                            if (passwordStatus.message) setPasswordStatus({ type: '', message: '' });
                          }}
                        />
                        <button
                          type="button"
                          className="password-visibility-btn"
                          onClick={() => setPasswordVisibility((prev) => ({ ...prev, oldPassword: !prev.oldPassword }))}
                          aria-label={passwordVisibility.oldPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                        >
                          <img
                            src={passwordVisibility.oldPassword ? '/eye_open.png' : '/eye_closed.png'}
                            alt={passwordVisibility.oldPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                            className="password-visibility-icon"
                          />
                        </button>
                      </div>
                    </label>
                    <label htmlFor="new-password">
                      Nowe hasło
                      <div className="settings-password-input-wrap">
                        <input
                          id="new-password"
                          type={passwordVisibility.newPassword ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(event) => {
                            setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }));
                            if (passwordStatus.message) setPasswordStatus({ type: '', message: '' });
                          }}
                        />
                        <button
                          type="button"
                          className="password-visibility-btn"
                          onClick={() => setPasswordVisibility((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
                          aria-label={passwordVisibility.newPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                        >
                          <img
                            src={passwordVisibility.newPassword ? '/eye_open.png' : '/eye_closed.png'}
                            alt={passwordVisibility.newPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                            className="password-visibility-icon"
                          />
                        </button>
                      </div>
                    </label>
                    <label htmlFor="confirm-new-password">
                      Potwierdzenie nowego hasła
                      <div className="settings-password-input-wrap">
                        <input
                          id="confirm-new-password"
                          type={passwordVisibility.confirmNewPassword ? 'text' : 'password'}
                          value={passwordForm.confirmNewPassword}
                          onChange={(event) => {
                            setPasswordForm((prev) => ({ ...prev, confirmNewPassword: event.target.value }));
                            if (passwordStatus.message) setPasswordStatus({ type: '', message: '' });
                          }}
                        />
                        <button
                          type="button"
                          className="password-visibility-btn"
                          onClick={() => setPasswordVisibility((prev) => ({ ...prev, confirmNewPassword: !prev.confirmNewPassword }))}
                          aria-label={passwordVisibility.confirmNewPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                        >
                          <img
                            src={passwordVisibility.confirmNewPassword ? '/eye_open.png' : '/eye_closed.png'}
                            alt={passwordVisibility.confirmNewPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                            className="password-visibility-icon"
                          />
                        </button>
                      </div>
                    </label>
                    <button type="submit" className="btn-new-event settings-password-submit" disabled={isSavingPassword}>
                      {isSavingPassword ? 'Zapisywanie...' : 'Zapisz'}
                    </button>
                  </form>
                  {passwordStatus.message && (
                    <p className={`status-message ${passwordStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                      {passwordStatus.message}
                    </p>
                  )}
                </>
              )}
              {activeSecurityTab === '2fa' && (
                <>
                  <h4>2FA</h4>
                  <p>Tutaj skonfigurujesz uwierzytelnianie dwuskładnikowe dla konta.</p>
                  <p> Najpopularniejsze aplikacje do 2FA to: <strong>Google Authenticator</strong> oraz <strong>Microsoft Authenticator</strong>.</p>
                  {isLoadingTwoFactorStatus ? (
                    <p>Ładowanie statusu 2FA...</p>
                  ) : twoFactorEnabled ? (
                    <div className="settings-2fa-block">
                      <p>
                        Status 2FA: <span className="header-accent">włączone</span>
                      </p>
                      <form className="settings-2fa-form" onSubmit={handleDisableTwoFactor}>
                        <label htmlFor="disable-2fa-code">
                          Kod 2FA
                          <input
                            id="disable-2fa-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={twoFactorDisableCode}
                            onChange={(event) => setTwoFactorDisableCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="Wpisz kod z aplikacji"
                          />
                        </label>
                        <button type="submit" className="btn-secondary" disabled={isSavingTwoFactor}>
                          {isSavingTwoFactor ? 'Wyłączanie...' : 'Wyłącz 2FA'}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="settings-2fa-block">
                      <p>
                        Status 2FA: <span className="header-accent">wyłączone</span>
                      </p>
                      {!twoFactorSetup.secret ? (
                        <button
                          type="button"
                          className="btn-new-event"
                          onClick={handleGenerateTwoFactorSecret}
                          disabled={isGeneratingTwoFactorSecret}
                        >
                          {isGeneratingTwoFactorSecret ? 'Generowanie...' : 'Rozpocznij konfigurację 2FA'}
                        </button>
                      ) : (
                        <form className="settings-2fa-form" onSubmit={handleEnableTwoFactor}>
                          {twoFactorQrDataUrl && (
                            <img
                              src={twoFactorQrDataUrl}
                              alt="Kod QR konfiguracji 2FA"
                              className="settings-2fa-qr"
                            />
                          )}
                          <label htmlFor="enable-2fa-code">
                            Kod 2FA
                            <input
                              id="enable-2fa-code"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]{6}"
                              maxLength={6}
                              value={twoFactorEnableCode}
                              onChange={(event) => setTwoFactorEnableCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Wpisz kod z aplikacji"
                            />
                          </label>
                          <button type="submit" className="btn-new-event settings-password-submit" disabled={isSavingTwoFactor}>
                            {isSavingTwoFactor ? 'Włączanie...' : 'Włącz 2FA'}
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                  {twoFactorStatus.message && (
                    <p className={`status-message ${twoFactorStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                      {twoFactorStatus.message}
                    </p>
                  )}
                </>
              )}
              {activeSecurityTab === 'czas-sesji' && (
                <>
                  <h4>Czas sesji</h4>
                  <p>W tym miejscu ustawisz czas trwania sesji i zasady automatycznego wylogowania.</p>
                </>
              )}
              {activeSecurityTab === 'historia-logowan' && (
                <>
                  <h4>Historia logowań</h4>
                  <p>Ta sekcja będzie zawierać listę ostatnich logowań do konta.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="settings-panel">
            <h3>{tabs.find((tab) => tab.id === activeTab)?.label}</h3>
            <p>Ta sekcja zostanie dodana w kolejnych krokach.</p>

          </div>
        )}
      </section>

      {pendingVerificationEmail && (
        <div className="modal-overlay">
          <div className="modal-card settings-verification-modal">
            {/* Minimalny modal: tylko kod i zatwierdzenie */}
            <form className="settings-verification-form" onSubmit={handleVerifyEmail}>
              <input
                id="email-verification-code"
                type="text"
                value={verificationCode}
                onChange={(event) => setVerificationCode(event.target.value)}
                placeholder="Wpisz kod weryfikacyjny"
              />
              <button
                type="submit"
                className="btn-new-event"
                disabled={isVerifyingEmail}
              >
                {isVerifyingEmail ? 'Weryfikowanie...' : 'Zatwierdź'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UstawieniaPage;
