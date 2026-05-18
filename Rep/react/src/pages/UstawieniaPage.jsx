import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { authService } from '../services/authService';
import QRCode from 'qrcode';
const SESSION_SETTINGS_STORAGE_KEY = 'sessionSettingsCache';
const SEAT_BASE_WIDTH = 36;
const SEAT_BASE_HEIGHT = 36;
const LAYOUT_CANVAS_WIDTH = 720;
const LAYOUT_CANVAS_HEIGHT = 420;

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
  const { currentUser, authCredentials, applyAuthenticatedUser, applySessionSettings } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profil');
  const [activeSecurityTab, setActiveSecurityTab] = useState('zmiana-hasla');
  const [openSessionAccordion, setOpenSessionAccordion] = useState('');
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
  const [sessionSettings, setSessionSettings] = useState({
    enabled: true,
    durationMinutes: 30,
    warningMinutes: (() => {
      try {
        const raw = localStorage.getItem(SESSION_SETTINGS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return Number(parsed?.warningMinutes) || 1;
      } catch (error) {
        return 1;
      }
    })(),
    expiryAction: (() => {
      try {
        const raw = localStorage.getItem(SESSION_SETTINGS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed?.expiryAction === 'LOCK_SCREEN' ? 'LOCK_SCREEN' : 'LOGOUT';
      } catch (error) {
        return 'LOGOUT';
      }
    })(),
    countMode: (() => {
      try {
        const raw = localStorage.getItem(SESSION_SETTINGS_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed?.countMode === 'ABSOLUTE' ? 'ABSOLUTE' : 'RELATIVE';
      } catch (error) {
        return 'RELATIVE';
      }
    })()
  });
  const [isLoadingSessionSettings, setIsLoadingSessionSettings] = useState(false);
  const [isSavingSessionSettings, setIsSavingSessionSettings] = useState(false);
  const [sessionSettingsStatus, setSessionSettingsStatus] = useState({ type: '', message: '' });
  const [loginHistory, setLoginHistory] = useState([]);
  const [isLoadingLoginHistory, setIsLoadingLoginHistory] = useState(false);
  const [loginHistoryStatus, setLoginHistoryStatus] = useState({ type: '', message: '' });
  /** Modal zgłoszenia wpisu historii: ID wybranego LoginLog, opcjonalna notatka, stan wysyłki POST report-login. */
  const [reportLoginLogId, setReportLoginLogId] = useState(null);
  const [reportNote, setReportNote] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [miejscaLayoutData, setMiejscaLayoutData] = useState([]);
  const [isLoadingLayouts, setIsLoadingLayouts] = useState(false);
  const [layoutStatus, setLayoutStatus] = useState({ type: '', message: '' });
  const [selectedSalaId, setSelectedSalaId] = useState(null);
  const [selectedSeatId, setSelectedSeatId] = useState(null);
  const [dragState, setDragState] = useState(null);

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

  const isAdminUser = String(currentUser?.rola || '').toUpperCase() === 'ADMIN';

  /** Podzakładki sekcji Bezpieczeństwo; „Zgłoszenia” tylko dla admina (UI: tooltip + disabled). */
  const securityTabs = useMemo(() => {
    return [
      { id: 'zmiana-hasla', label: 'Zmiana hasła' },
      { id: '2fa', label: '2FA' },
      { id: 'czas-sesji', label: 'Czas sesji' },
      { id: 'historia-logowan', label: 'Historia logowań' }
    ];
  }, []);

  const selectedSala = useMemo(() => {
    for (const miejsce of miejscaLayoutData) {
      const foundSala = (miejsce.sale || []).find((sala) => sala.id === selectedSalaId);
      if (foundSala) {
        return { ...foundSala, miejsceNazwa: miejsce.nazwa };
      }
    }
    return null;
  }, [miejscaLayoutData, selectedSalaId]);

  const selectedSalaSeats = useMemo(() => (
    Array.isArray(selectedSala?.seats) ? selectedSala.seats : []
  ), [selectedSala]);

  const getSeatDimensions = (seat) => {
    const rotation = seat?.rotation || 0;
    if (rotation === 45 || rotation === 135 || rotation === 225 || rotation === 315) {
      // For 45-degree rotations, scale down so the rotated seat appears the same size
      // The diagonal of a square with side s is s * sqrt(2)
      // To make the diagonal equal to SEAT_BASE_WIDTH, we use SEAT_BASE_WIDTH / sqrt(2)
      const scaledSize = SEAT_BASE_WIDTH / Math.sqrt(2);
      const diagonal = Math.sqrt(scaledSize * scaledSize + scaledSize * scaledSize);
      return { width: diagonal, height: diagonal };
    } else {
      return { width: SEAT_BASE_WIDTH, height: SEAT_BASE_HEIGHT };
    }
  };

  const hasSeatCollision = (seats, candidateSeat) => {
    const candidateSize = getSeatDimensions(candidateSeat);
    return seats.some((seat) => {
      if (seat.id === candidateSeat.id) return false;
      const seatSize = getSeatDimensions(seat);
      return !(
        candidateSeat.x + candidateSize.width <= seat.x
        || seat.x + seatSize.width <= candidateSeat.x
        || candidateSeat.y + candidateSize.height <= seat.y
        || seat.y + seatSize.height <= candidateSeat.y
      );
    });
  };

  const updateSelectedSalaPlan = (nextSeats) => {
    setMiejscaLayoutData((prev) => prev.map((miejsce) => ({
      ...miejsce,
      sale: (miejsce.sale || []).map((sala) => (
        sala.id === selectedSalaId
          ? { ...sala, seats: nextSeats }
          : sala
      ))
    })));
  };

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

  const loadLayoutData = async () => {
    if (String(currentUser?.rola || '').toUpperCase() !== 'ORG') {
      setMiejscaLayoutData([]);
      return;
    }
    setIsLoadingLayouts(true);
    setLayoutStatus({ type: '', message: '' });
    try {
      const response = await apiClient.get('/miejsca/my', getRequestConfig());
      const miejsca = Array.isArray(response?.data) ? response.data : [];
      setMiejscaLayoutData(miejsca);
      if (!selectedSalaId) {
        const firstSalaWithPlan = miejsca.flatMap((miejsce) => miejsce.sale || []).find((sala) => sala.maPlan);
        setSelectedSalaId(firstSalaWithPlan?.id || null);
      }
    } catch (error) {
      setLayoutStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się pobrać sal.'
      });
    } finally {
      setIsLoadingLayouts(false);
    }
  };

  const addSeatToSelectedSala = () => {
    if (!selectedSala) return;
    if (selectedSalaSeats.length >= Number(selectedSala.pojemnosc || 0)) {
      setLayoutStatus({ type: 'error', message: 'Osiągnięto pojemność sali.' });
      return;
    }
    const newSeat = {
      id: `seat-${Date.now()}`,
      x: 16,
      y: 16,
      rotation: 0
    };
    updateSelectedSalaPlan([...selectedSalaSeats, newSeat]);
    setSelectedSeatId(newSeat.id);
    setLayoutStatus({ type: '', message: '' });
  };

  const rotateSelectedSeat = () => {
    if (!selectedSeatId) return;
    const nextSeats = selectedSalaSeats.map((seat) => (
      seat.id === selectedSeatId
        ? { ...seat, rotation: ((seat.rotation || 0) + 45) % 360 }
        : seat
    ));
    const rotatedSeat = nextSeats.find((seat) => seat.id === selectedSeatId);
    const seatSize = getSeatDimensions(rotatedSeat);
    if (
      rotatedSeat.x < 0
      || rotatedSeat.y < 0
      || rotatedSeat.x + seatSize.width > LAYOUT_CANVAS_WIDTH
      || rotatedSeat.y + seatSize.height > LAYOUT_CANVAS_HEIGHT
    ) {
      setLayoutStatus({ type: 'error', message: 'Nie można obrócić miejsca w tej pozycji - wykracza poza obszar.' });
      return;
    }
    updateSelectedSalaPlan(nextSeats);
    setLayoutStatus({ type: '', message: '' });
  };

  const saveSelectedSalaPlan = async () => {
    if (!selectedSala) return;
    
    // Check for overlapping seats
    const hasOverlaps = selectedSalaSeats.some((seat) => {
      const candidateSize = getSeatDimensions(seat);
      return selectedSalaSeats.some((otherSeat) => {
        if (seat.id === otherSeat.id) return false;
        const otherSize = getSeatDimensions(otherSeat);
        return !(
          seat.x + candidateSize.width <= otherSeat.x
          || otherSeat.x + otherSize.width <= seat.x
          || seat.y + candidateSize.height <= otherSeat.y
          || otherSeat.y + otherSize.height <= seat.y
        );
      });
    });

    if (hasOverlaps) {
      setLayoutStatus({ type: 'error', message: 'Nie można zapisać układu - miejsca nachodzą na siebie.' });
      return;
    }

    try {
      await apiClient.put(
        `/miejsca/sale/${selectedSala.id}/plan`,
        { seats: selectedSalaSeats },
        getRequestConfig()
      );
      setLayoutStatus({ type: 'success', message: 'Układ sali został zapisany.' });
      loadLayoutData();
    } catch (error) {
      setLayoutStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się zapisać układu sali.'
      });
    }
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
    if (activeTab === 'uklady-sal') {
      loadLayoutData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!dragState || !selectedSala) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      const canvasRect = dragState.canvasRect;
      const seat = selectedSalaSeats.find((item) => item.id === dragState.seatId);
      if (!seat) return;

      const seatSize = getSeatDimensions(seat);
      const nextX = Math.max(0, Math.min(LAYOUT_CANVAS_WIDTH - seatSize.width, Math.round(event.clientX - canvasRect.left - dragState.offsetX)));
      const nextY = Math.max(0, Math.min(LAYOUT_CANVAS_HEIGHT - seatSize.height, Math.round(event.clientY - canvasRect.top - dragState.offsetY)));
      const candidateSeat = { ...seat, x: nextX, y: nextY };
      updateSelectedSalaPlan(selectedSalaSeats.map((item) => item.id === seat.id ? candidateSeat : item));
    };

    const handleMouseUp = () => setDragState(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, selectedSala, selectedSalaSeats]);

  useEffect(() => {
    // Pobiera dane sekcji "Historia logowań" dopiero po wejściu w odpowiednią podzakładkę.
    const loadLoginHistory = async () => {
      if (activeTab !== 'bezpieczenstwo' || activeSecurityTab !== 'historia-logowan') return;
      setIsLoadingLoginHistory(true);
      setLoginHistoryStatus({ type: '', message: '' });
      try {
        const response = await apiClient.get('/users/me/login-history?limit=25', getRequestConfig());
        setLoginHistory(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        setLoginHistoryStatus({
          type: 'error',
          message: error.response?.data?.message || 'Nie udało się pobrać historii logowań.'
        });
      } finally {
        setIsLoadingLoginHistory(false);
      }
    };
    loadLoginHistory();
  }, [activeTab, activeSecurityTab]);

  const formatLoginTime = (value) => {
    if (!value) return 'Brak danych';
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return 'Brak danych';
    return parsedDate.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const mapLoginStatusLabel = (status) => {
    // Mapowanie technicznych statusów backendu na etykiety czytelne dla użytkownika.
    switch (status) {
      case 'SUKCES':
        return 'Zalogowano';
      case 'NIEUDANE_HASLO_LUB_LOGIN':
        return 'Nieudane logowanie';
      case 'NIEUDANY_2FA':
        return 'Nieudany kod 2FA';
      case 'ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL':
        return 'Zablokowano';
      default:
        return 'Nieznany status';
    }
  };

  /**
   * Wysyła zgłoszenie bezpieczeństwa z historii logowań: POST /api/users/me/security-tickets/report-login.
   * Backend tworzy wiersz security_tickets tylko jeśli loginLogId należy do zalogowanego użytkownika.
   */
  const handleSubmitLoginReport = async (event) => {
    event.preventDefault();
    if (reportLoginLogId == null) return;
    setIsSubmittingReport(true);
    setLoginHistoryStatus({ type: '', message: '' });
    try {
      const payload = { loginLogId: reportLoginLogId };
      const trimmed = reportNote.trim();
      if (trimmed) payload.note = trimmed;
      await apiClient.post('/users/me/security-tickets/report-login', payload, getRequestConfig());
      setLoginHistoryStatus({ type: 'success', message: 'Zgłoszenie zostało wysłane do skrzynki administratorów.' });
      setReportLoginLogId(null);
      setReportNote('');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.detail || 'Nie udało się wysłać zgłoszenia.';
      setLoginHistoryStatus({ type: 'error', message: msg });
    } finally {
      setIsSubmittingReport(false);
    }
  };

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

  useEffect(() => {
    // Ładuje ustawienia sesji tylko dla aktywnej podsekcji "Czas sesji".
    const loadSessionSettings = async () => {
      if (activeTab !== 'bezpieczenstwo' || activeSecurityTab !== 'czas-sesji') return;
      setIsLoadingSessionSettings(true);
      setSessionSettingsStatus({ type: '', message: '' });
      try {
        const response = await apiClient.get('/users/me/session-settings', getRequestConfig());
        setSessionSettings((prev) => {
          const durationFromApi = Number(response?.data?.durationMinutes);
          const nextDuration = Number.isFinite(durationFromApi) ? durationFromApi : prev.durationMinutes;
          const warningFromApi = Number(response?.data?.warningMinutes);
          const nextWarning = Number.isFinite(warningFromApi) ? warningFromApi : prev.warningMinutes;
          const normalized = {
            enabled: response?.data?.enabled !== false,
            durationMinutes: nextDuration,
            warningMinutes: Math.min(Math.max(0, nextWarning), Math.max(0, nextDuration - 1)),
            expiryAction: response?.data?.expiryAction === 'LOCK_SCREEN' ? 'LOCK_SCREEN' : prev.expiryAction,
            countMode: response?.data?.countMode === 'ABSOLUTE' ? 'ABSOLUTE' : prev.countMode
          };
          localStorage.setItem(SESSION_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        });
      } catch (error) {
        setSessionSettingsStatus({
          type: 'error',
          message: error.response?.data?.message || 'Nie udało się pobrać ustawień czasu sesji.'
        });
      } finally {
        setIsLoadingSessionSettings(false);
      }
    };
    loadSessionSettings();
  }, [activeTab, activeSecurityTab]);

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

  const handleSaveSessionSettings = async (event) => {
    // Zapisuje wszystkie opcje sesji naraz i synchronizuje je z globalnym AuthContext.
    event.preventDefault();
    setSessionSettingsStatus({ type: '', message: '' });
    setIsSavingSessionSettings(true);
    try {
      const response = await apiClient.put(
        '/users/me/session-settings',
        {
          enabled: sessionSettings.enabled,
          durationMinutes: Number(sessionSettings.durationMinutes),
          warningMinutes: Number(sessionSettings.warningMinutes),
          expiryAction: sessionSettings.expiryAction,
          countMode: sessionSettings.countMode
        },
        getRequestConfig()
      );
      const savedSettings = response?.data || {};
      setSessionSettings((prev) => {
        const durationFromApi = Number(savedSettings.durationMinutes);
        const nextDuration = Number.isFinite(durationFromApi) ? durationFromApi : prev.durationMinutes;
        const warningFromApi = Number(savedSettings.warningMinutes);
        const nextWarning = Number.isFinite(warningFromApi) ? warningFromApi : prev.warningMinutes;
        const normalized = {
          enabled: savedSettings.enabled !== false,
          durationMinutes: nextDuration,
          warningMinutes: Math.min(Math.max(0, nextWarning), Math.max(0, nextDuration - 1)),
          expiryAction: savedSettings.expiryAction === 'LOCK_SCREEN' ? 'LOCK_SCREEN' : prev.expiryAction,
          countMode: savedSettings.countMode === 'ABSOLUTE' ? 'ABSOLUTE' : prev.countMode
        };
        localStorage.setItem(SESSION_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
        applySessionSettings(normalized);
        return normalized;
      });
      setSessionSettingsStatus({ type: 'success', message: 'Ustawienia czasu sesji zostały zapisane.' });
    } catch (error) {
      setSessionSettingsStatus({
        type: 'error',
        message: error.response?.data?.message || 'Nie udało się zapisać ustawień czasu sesji.'
      });
    } finally {
      setIsSavingSessionSettings(false);
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
                <span
                  key={tab.id}
                  className={`permission-tooltip ${tab.adminOnly && !isAdminUser ? 'has-tooltip' : ''}`}
                  data-tooltip={tab.adminOnly && !isAdminUser ? 'Dostępne tylko dla administratora' : ''}
                >
                  <button
                    type="button"
                    className={`settings-subnav-item ${activeSecurityTab === tab.id ? 'active' : ''} ${tab.adminOnly && !isAdminUser ? 'is-disabled' : ''}`}
                    aria-disabled={tab.adminOnly && !isAdminUser ? 'true' : undefined}
                    onClick={() => {
                      if (tab.adminOnly && !isAdminUser) return;
                      setActiveSecurityTab(tab.id);
                    }}
                  >
                    {tab.label}
                  </button>
                </span>
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
                  <p>Skonfiguruj, czy licznik sesji ma być aktywny oraz jak długo sesja może trwać.</p>
                  {isLoadingSessionSettings && <p>Ładowanie ustawień czasu sesji...</p>}
                  <form className="settings-session-form" onSubmit={handleSaveSessionSettings}>
                    <details
                      className="settings-session-accordion"
                      open={openSessionAccordion === 'czas-sesji'}
                      onToggle={(event) => {
                        if (event.currentTarget.open) {
                          setOpenSessionAccordion('czas-sesji');
                        } else if (openSessionAccordion === 'czas-sesji') {
                          setOpenSessionAccordion('');
                        }
                      }}
                    >
                      {/* Sekcja bazowa: aktywacja licznika, długość sesji i czas ostrzeżenia. */}
                      <summary>Czas sesji</summary>
                      <div className="settings-session-toggle">
                        <span>Włącz licznik czasu sesji</span>
                        <button
                          id="session-timeout-enabled"
                          type="button"
                          className={`settings-onoff ${sessionSettings.enabled ? 'is-on' : 'is-off'}`}
                          role="switch"
                          aria-checked={sessionSettings.enabled}
                          aria-label="Włącz lub wyłącz licznik czasu sesji"
                          disabled={isLoadingSessionSettings || isSavingSessionSettings}
                          onClick={() => {
                            setSessionSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
                            if (sessionSettingsStatus.message) setSessionSettingsStatus({ type: '', message: '' });
                          }}
                        >
                          <span className="settings-onoff-track" aria-hidden="true">
                            <span className="settings-onoff-thumb" />
                          </span>
                          <span className="settings-onoff-text">{sessionSettings.enabled ? 'ON' : 'OFF'}</span>
                        </button>
                      </div>

                      <label htmlFor="session-duration-minutes">
                        Czas sesji (minuty)
                        <input
                          id="session-duration-minutes"
                          type="number"
                          min={1}
                          max={1440}
                          step={1}
                          value={sessionSettings.durationMinutes}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);
                            setSessionSettings((prev) => ({
                              ...prev,
                              durationMinutes: Number.isFinite(nextValue) ? nextValue : prev.durationMinutes,
                              warningMinutes: Number.isFinite(nextValue)
                                ? Math.min(Math.max(0, Number(prev.warningMinutes) || 0), Math.max(0, nextValue - 1))
                                : prev.warningMinutes
                            }));
                            if (sessionSettingsStatus.message) setSessionSettingsStatus({ type: '', message: '' });
                          }}
                          disabled={!sessionSettings.enabled || isLoadingSessionSettings || isSavingSessionSettings}
                        />
                      </label>

                      <label htmlFor="session-warning-minutes">
                        Czas ostrzeżenia przed końcem sesji (minuty)
                        <input
                          id="session-warning-minutes"
                          type="number"
                          min={0}
                          max={1439}
                          step={1}
                          value={sessionSettings.warningMinutes}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);
                            setSessionSettings((prev) => {
                              if (!Number.isFinite(nextValue)) {
                                return prev;
                              }
                              return {
                                ...prev,
                                warningMinutes: Math.max(0, Math.round(nextValue))
                              };
                            });
                            if (sessionSettingsStatus.message) setSessionSettingsStatus({ type: '', message: '' });
                          }}
                          disabled={!sessionSettings.enabled || isLoadingSessionSettings || isSavingSessionSettings}
                        />
                      </label>
                    </details>

                    <details
                      className="settings-session-accordion"
                      open={openSessionAccordion === 'sposob-liczenia'}
                      onToggle={(event) => {
                        if (event.currentTarget.open) {
                          setOpenSessionAccordion('sposob-liczenia');
                        } else if (openSessionAccordion === 'sposob-liczenia') {
                          setOpenSessionAccordion('');
                        }
                      }}
                    >
                      {/* Wybór trybu liczenia: ABSOLUTE bez resetu aktywnością vs RELATIVE z resetem aktywnością. */}
                      <summary>Sposób liczenia czasu sesji</summary>
                      <p>Wybierz, czy sesja ma kończyć się po stałym czasie, czy ma być odnawiana aktywnością.</p>
                      <label htmlFor="session-count-mode">
                        Tryb liczenia
                        <select
                          id="session-count-mode"
                          value={sessionSettings.countMode}
                          onChange={(event) => {
                            const nextMode = event.target.value === 'ABSOLUTE' ? 'ABSOLUTE' : 'RELATIVE';
                            setSessionSettings((prev) => ({ ...prev, countMode: nextMode }));
                            if (sessionSettingsStatus.message) setSessionSettingsStatus({ type: '', message: '' });
                          }}
                          disabled={!sessionSettings.enabled || isLoadingSessionSettings || isSavingSessionSettings}
                        >
                          <option value="ABSOLUTE">Stały czas</option>
                          <option value="RELATIVE">Reset aktywnością</option>
                        </select>
                      </label>
                    </details>

                    <details
                      className="settings-session-accordion"
                      open={openSessionAccordion === 'po-wygasnieciu'}
                      onToggle={(event) => {
                        if (event.currentTarget.open) {
                          setOpenSessionAccordion('po-wygasnieciu');
                        } else if (openSessionAccordion === 'po-wygasnieciu') {
                          setOpenSessionAccordion('');
                        }
                      }}
                    >
                      {/* Akcja końcowa po wygaśnięciu: blokada ekranu albo pełne wylogowanie. */}
                      <summary>Po wygaśnięciu sesji</summary>
                      <p>Wybierz, co aplikacja ma zrobić po upływie czasu sesji.</p>
                      <label htmlFor="session-expiry-action">
                        Akcja po wygaśnięciu
                        <select
                          id="session-expiry-action"
                          value={sessionSettings.expiryAction}
                          onChange={(event) => {
                            const nextAction = event.target.value === 'LOCK_SCREEN' ? 'LOCK_SCREEN' : 'LOGOUT';
                            setSessionSettings((prev) => ({ ...prev, expiryAction: nextAction }));
                            if (sessionSettingsStatus.message) setSessionSettingsStatus({ type: '', message: '' });
                          }}
                          disabled={!sessionSettings.enabled || isLoadingSessionSettings || isSavingSessionSettings}
                        >
                          <option value="LOCK_SCREEN">Zablokowanie ekranu</option>
                          <option value="LOGOUT">Całkowite wylogowanie</option>
                        </select>
                      </label>
                    </details>

                    <button
                      type="submit"
                      className="btn-new-event settings-password-submit"
                      disabled={isLoadingSessionSettings || isSavingSessionSettings}
                    >
                      {isSavingSessionSettings ? 'Zapisywanie...' : 'Zapisz ustawienia czasu sesji'}
                    </button>
                  </form>
                  {sessionSettingsStatus.message && (
                    <p className={`status-message ${sessionSettingsStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                      {sessionSettingsStatus.message}
                    </p>
                  )}
                </>
              )}
              {activeSecurityTab === 'historia-logowan' && (
                <>
                  <h4>Historia logowań</h4>
                  <p>Przegląd ostatnich prób logowania do konta. Sprawdź, czy wszystkie wpisy są Ci znane.</p>
                  {isLoadingLoginHistory && <p>Ładowanie historii logowań...</p>}
                  {!isLoadingLoginHistory && (
                    <div className="settings-login-history-wrap">
                      <table className="settings-login-history-table">
                        <thead>
                          <tr>
                            <th>Data i godzina</th>
                            <th>Urządzenie</th>
                            <th>Lokalizacja</th>
                            <th>Status</th>
                            <th>Akcja</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="settings-login-history-empty">
                                Brak wpisów historii logowań.
                              </td>
                            </tr>
                          ) : (
                            loginHistory.map((entry) => {
                              const statusLabel = mapLoginStatusLabel(entry.status);
                              const isSuccess = entry.status === 'SUKCES';
                              return (
                                <tr key={entry.id != null ? String(entry.id) : `${entry.loginTime}-${entry.status}`}>
                                  <td>{formatLoginTime(entry.loginTime)}</td>
                                  <td>{entry.deviceInfo || 'Nieznane urządzenie'}</td>
                                  <td>{entry.location || 'Nieznana lokalizacja'}</td>
                                  <td>
                                    <span className={`settings-login-status ${isSuccess ? 'is-success' : 'is-warning'}`}>
                                      {statusLabel}
                                    </span>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className="btn-secondary settings-login-action-report"
                                      disabled={isAdminUser || entry.id == null}
                                      title={
                                        isAdminUser
                                          ? 'Administrator nie zgłasza logowań z tego poziomu.'
                                          : entry.id == null
                                            ? 'Brak identyfikatora wpisu — odśwież stronę.'
                                            : 'Wyślij zgłoszenie do administratorów'
                                      }
                                      onClick={() => {
                                        if (isAdminUser || entry.id == null) return;
                                        setReportLoginLogId(entry.id);
                                        setReportNote('');
                                      }}
                                    >
                                      Zgłoś
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {loginHistoryStatus.message && (
                    <p className={`status-message ${loginHistoryStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                      {loginHistoryStatus.message}
                    </p>
                  )}
                  {reportLoginLogId != null && (
                    <div
                      className="settings-report-overlay"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="settings-report-title"
                      onClick={() => !isSubmittingReport && setReportLoginLogId(null)}
                    >
                      <div className="settings-report-dialog" onClick={(e) => e.stopPropagation()}>
                        <h4 id="settings-report-title">Zgłoś wpis z historii logowań</h4>
                        <p>Administratorzy zobaczą to zgłoszenie w panelu administratora (ikona w górnym pasku) → Zgłoszenia.</p>
                        <label htmlFor="settings-report-note">Opcjonalna wiadomość</label>
                        <textarea
                          id="settings-report-note"
                          rows={4}
                          value={reportNote}
                          onChange={(e) => setReportNote(e.target.value)}
                          placeholder="Np. nie rozpoznaję tego urządzenia ani miejsca…"
                          disabled={isSubmittingReport}
                        />
                        <div className="settings-report-actions">
                          <button type="button" className="btn-secondary" onClick={() => !isSubmittingReport && setReportLoginLogId(null)} disabled={isSubmittingReport}>
                            Anuluj
                          </button>
                          <button type="button" className="btn-new-event" onClick={handleSubmitLoginReport} disabled={isSubmittingReport}>
                            {isSubmittingReport ? 'Wysyłanie…' : 'Wyślij zgłoszenie'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="settings-panel">
            <h3>{tabs.find((tab) => tab.id === activeTab)?.label}</h3>
            {activeTab === 'uklady-sal' ? (
              String(currentUser?.rola || '').toUpperCase() !== 'ORG' ? (
                <p>Tylko organizator może zarządzać układami sal.</p>
              ) : (
                <div className="settings-layouts">
                  {isLoadingLayouts && <p>Ładowanie sal...</p>}
                  {layoutStatus.message && (
                    <p className={`status-message ${layoutStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                      {layoutStatus.message}
                    </p>
                  )}

                  <div className="settings-layouts-list">
                    {miejscaLayoutData.length > 0 ? miejscaLayoutData.map((miejsce) => (
                      <div key={miejsce.id} className="settings-layouts-place">
                        <h4>{miejsce.nazwa}</h4>
                        {(miejsce.sale || []).length > 0 ? (
                          <div className="settings-layouts-salas">
                            {miejsce.sale.map((sala) => (
                              <button
                                key={sala.id}
                                type="button"
                                className={`settings-layouts-sala ${selectedSalaId === sala.id ? 'is-active' : ''}`}
                                onClick={() => {
                                  setSelectedSalaId(sala.id);
                                  setSelectedSeatId(null);
                                }}
                                disabled={!sala.maPlan}
                              >
                                {sala.nazwa} {!sala.maPlan ? '(bez planu)' : ''}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p>Brak sal dla tego miejsca.</p>
                        )}
                      </div>
                    )) : (
                      <p>Nie masz jeszcze miejsc ani sal.</p>
                    )}
                  </div>

                  {selectedSala && (
                    <div className="settings-layout-editor">
                      <div className="settings-layout-editor-header">
                        <div>
                          <h4>{selectedSala.nazwa}</h4>
                          <p>{selectedSala.miejsceNazwa} • pojemność: {selectedSala.pojemnosc || 0}</p>
                        </div>
                        <div className="settings-layout-editor-actions">
                          <button type="button" className="btn-secondary" onClick={addSeatToSelectedSala}>
                            Dodaj miejsce
                          </button>
                          <button type="button" className="btn-secondary" onClick={rotateSelectedSeat} disabled={!selectedSeatId}>
                            Obróć
                          </button>
                          <button type="button" className="btn-new-event" onClick={saveSelectedSalaPlan}>
                            Zapisz układ
                          </button>
                        </div>
                      </div>

                      <div className="settings-layout-canvas">
                        {selectedSalaSeats.map((seat) => {
                          const seatSize = getSeatDimensions(seat);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              className={`settings-layout-seat ${selectedSeatId === seat.id ? 'is-selected' : ''}`}
                              style={{
                                left: seat.x,
                                top: seat.y,
                                width: seatSize.width,
                                height: seatSize.height,
                                transform: `rotate(${seat.rotation || 0}deg)`,
                                transformOrigin: 'center center'
                              }}
                              onMouseDown={(event) => {
                                const rect = event.currentTarget.parentElement.getBoundingClientRect();
                                setSelectedSeatId(seat.id);
                                setDragState({
                                  seatId: seat.id,
                                  offsetX: event.clientX - rect.left - seat.x,
                                  offsetY: event.clientY - rect.top - seat.y,
                                  canvasRect: rect
                                });
                              }}
                            >
                              {selectedSalaSeats.findIndex((item) => item.id === seat.id) + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <p>Ta sekcja zostanie dodana w kolejnych krokach.</p>
            )}

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
