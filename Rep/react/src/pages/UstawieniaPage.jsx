import React, { useContext, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';

const tabs = [
  { id: 'profil', label: 'Profil' },
  { id: 'powiadomienia', label: 'Powiadomienia' },
  { id: 'bezpieczenstwo', label: 'Bezpieczeństwo' },
  { id: 'uklady-sal', label: 'Układy sal' },
  { id: 'wyglad', label: 'Wygląd' },
  { id: 'jezyk-region', label: 'Język i region' },
  { id: 'platnosci', label: 'Płatności' }
];

const UstawieniaPage = () => {
  const { currentUser, authCredentials, applyAuthenticatedUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profil');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

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
