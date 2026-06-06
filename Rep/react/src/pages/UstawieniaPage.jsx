import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import { authService } from '../services/authService';
import i18n from '../i18n';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../services/powiadomieniaService';
import QRCode from 'qrcode';
import {
  OBSERVED_EVENTS_CHANGED,
  ensureObservedLoaded,
  getObservedEvents,
  refreshObservedEvents,
  removeObservedEvent,
} from '../utils/obserwowaneWydarzenia';
import { ErrorBar } from 'recharts';
const SESSION_SETTINGS_STORAGE_KEY = 'sessionSettingsCache';

/** Format daty rozpoczęcia wydarzenia na liście obserwowanych w ustawieniach. */
const formatObservedEventDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
const SEAT_BASE_WIDTH = 36;
const SEAT_BASE_HEIGHT = 36;
const ROW_BASE_WIDTH = 220;
const ROW_BASE_HEIGHT = 72;
const LAYOUT_CANVAS_WIDTH = 720;
const LAYOUT_CANVAS_HEIGHT = 420;

const UstawieniaPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, authCredentials, applyAuthenticatedUser, applySessionSettings } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();
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
  const [observedEvents, setObservedEvents] = useState([]);
  const [isLoadingObserved, setIsLoadingObserved] = useState(false);
  const [observedStatus, setObservedStatus] = useState({ type: '', message: '' });
  /** null = jeszcze nie sprawdzono; używane tylko do wyszarzenia opcji * w Powiadomieniach. */
  const [hasObservedEvents, setHasObservedEvents] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    adminLogin: true,
    newEvent: true,
    favoriteLogin: false,
    observedEventEnd: true,
    observedEventStart: true,
    observedSeatFreed: true,
    newRefundRequest: true,
    newOrganizerRequest: true,
    newSecurityReport: true,
  });
  const [isLoadingNotificationSettings, setIsLoadingNotificationSettings] = useState(false);
  const [isSavingNotificationSettings, setIsSavingNotificationSettings] = useState(false);
  const [notificationSettingsStatus, setNotificationSettingsStatus] = useState({ type: '', message: '' });
  const [languageForm, setLanguageForm] = useState(currentUser?.language === 'en' ? 'en' : 'pl');
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
  const [languageStatus, setLanguageStatus] = useState({ type: '', message: '' });
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [rowLabelDraft, setRowLabelDraft] = useState('A');
  const [dragState, setDragState] = useState(null);

  // Wallet state
  const [walletData, setWalletData] = useState({ balance: 0, bankAccountNumber: '', paymentMethod: '' });
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [walletStatus, setWalletStatus] = useState({ type: '', message: '' });
  const [addFundsAmount, setAddFundsAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [paymentMethodForm, setPaymentMethodForm] = useState({ paymentMethod: '', bankAccountNumber: '' });
  const [isSavingPaymentMethod, setIsSavingPaymentMethod] = useState(false);

  const [profileForm, setProfileForm] = useState({
    imie: currentUser.imie || '',
    nazwisko: currentUser.nazwisko || '',
    email: currentUser.email || '',
    telefon: currentUser.telefon || ''
  });

  const profileFields = useMemo(() => ([
    { key: 'imie', label: t('settings.profile.name'), type: 'text' },
    { key: 'nazwisko', label: t('settings.profile.last_name'), type: 'text' },
    { key: 'email', label: t('settings.profile.email'), type: 'email' },
    { key: 'telefon', label: t('settings.profile.phone_number'), type: 'tel' }
  ]), [t]);

  const isAdminUser = String(currentUser?.rola || '').toUpperCase() === 'ADMIN';
  const tabs = useMemo(() => ([
    { id: 'profil', label: t('settings.tabs.profil') },
    { id: 'platnosci', label: t('settings.tabs.platnosci') },
    { id: 'powiadomienia', label: t('settings.tabs.powiadomienia') },
    { id: 'obserwowane', label: t('settings.tabs.obserwowane') },
    { id: 'bezpieczenstwo', label: t('settings.tabs.bezpieczenstwo') },
    { id: 'uklady-sal', label: t('settings.tabs.ukladySal') },
    { id: 'wyglad', label: t('settings.tabs.wyglad') },
    { id: 'jezyk', label: t('settings.tabs.jezyk') }
  ]), [t]);

  const themeOptions = useMemo(() => ([
    { id: 'default', label: t('settings.appearance.option.default') },
    { id: 'dark', label: t('settings.appearance.option.dark') },
    { id: 'light', label: t('settings.appearance.option.light') },
  ]), [t]);

  /** Podzakładki sekcji Bezpieczeństwo; „Zgłoszenia” tylko dla admina (UI: tooltip + disabled). */
  const securityTabs = useMemo(() => {
    return [
      { id: 'zmiana-hasla', label: t('settings.security.tabs.changePassword') },
      { id: '2fa', label: t('settings.security.tabs.twoFactor') },
      { id: 'czas-sesji', label: t('settings.security.tabs.sessionTime') },
      { id: 'historia-logowan', label: t('settings.security.loginHistory.title') }
    ];
  }, [t]);

  const selectedSala = useMemo(() => {
    for (const miejsce of miejscaLayoutData) {
      const foundSala = (miejsce.sale || []).find((sala) => sala.id === selectedSalaId);
      if (foundSala) {
        return { ...foundSala, miejsceNazwa: miejsce.nazwa };
      }
    }
    return null;
  }, [miejscaLayoutData, selectedSalaId]);

  const selectedSalaElements = useMemo(() => (
    Array.isArray(selectedSala?.seats) ? selectedSala.seats : []
  ), [selectedSala]);
  const selectedSalaSeats = useMemo(
    () => selectedSalaElements.filter((item) => (item.type || 'SEAT') === 'SEAT'),
    [selectedSalaElements]
  );
  const selectedSalaRows = useMemo(
    () => selectedSalaElements.filter((item) => item.type === 'ROW'),
    [selectedSalaElements]
  );
  const selectedLayoutWidth = Number(selectedSala?.layoutWidth) || LAYOUT_CANVAS_WIDTH;
  const selectedLayoutHeight = Number(selectedSala?.layoutHeight) || LAYOUT_CANVAS_HEIGHT;

  const getElementDimensions = (seat) => {
    if (seat?.type === 'ROW') {
      return {
        width: Number(seat?.width) || ROW_BASE_WIDTH,
        height: Number(seat?.height) || ROW_BASE_HEIGHT
      };
    }
    const rotation = seat?.rotation || 0;
    if (rotation === 45 || rotation === 135 || rotation === 225 || rotation === 315) {
      const scaledSize = SEAT_BASE_WIDTH / Math.sqrt(2);
      const diagonal = Math.sqrt(scaledSize * scaledSize + scaledSize * scaledSize);
      return { width: diagonal, height: diagonal };
    } else {
      return { width: SEAT_BASE_WIDTH, height: SEAT_BASE_HEIGHT };
    }
  };

  const hasSeatCollision = (seats, candidateSeat) => {
    const candidateSize = getElementDimensions(candidateSeat);
    return seats.some((seat) => {
      if (seat.id === candidateSeat.id || seat.type === 'ROW' || candidateSeat.type === 'ROW') return false;
      const seatSize = getElementDimensions(seat);
      return !(
        candidateSeat.x + candidateSize.width <= seat.x
        || seat.x + seatSize.width <= candidateSeat.x
        || candidateSeat.y + candidateSize.height <= seat.y
        || seat.y + seatSize.height <= candidateSeat.y
      );
    });
  };

  const updateSelectedSalaPlan = (nextSeats, nextLayoutWidth = selectedLayoutWidth, nextLayoutHeight = selectedLayoutHeight) => {
    setMiejscaLayoutData((prev) => prev.map((miejsce) => ({
      ...miejsce,
      sale: (miejsce.sale || []).map((sala) => (
        sala.id === selectedSalaId
          ? { ...sala, seats: nextSeats, layoutWidth: nextLayoutWidth, layoutHeight: nextLayoutHeight }
          : sala
      ))
    })));
  };

  const getSeatDisplayLabel = (seat) => {
    const fallbackLabel = (() => {
      if (seat.baseLabel && !String(seat.baseLabel).startsWith('seat-')) {
        return seat.baseLabel;
      }
      return String(selectedSalaSeats.findIndex((item) => item.id === seat.id) + 1);
    })();

    const row = selectedSalaRows.find((item) => {
      const rowWidth = Number(item.width) || ROW_BASE_WIDTH;
      const rowHeight = Number(item.height) || ROW_BASE_HEIGHT;
      const centerX = seat.x + (getElementDimensions(seat).width / 2);
      const centerY = seat.y + (getElementDimensions(seat).height / 2);
      return centerX >= item.x
        && centerX <= item.x + rowWidth
        && centerY >= item.y
        && centerY <= item.y + rowHeight;
    });

    if (!row || !row.rowLabel) {
      return fallbackLabel;
    }

    const seatsInRow = selectedSalaSeats
      .filter((item) => {
        const centerX = item.x + (getElementDimensions(item).width / 2);
        const centerY = item.y + (getElementDimensions(item).height / 2);
        const rowWidth = Number(row.width) || ROW_BASE_WIDTH;
        const rowHeight = Number(row.height) || ROW_BASE_HEIGHT;
        return centerX >= row.x
          && centerX <= row.x + rowWidth
          && centerY >= row.y
          && centerY <= row.y + rowHeight;
      })
      .sort((a, b) => a.x - b.x || a.y - b.y);

    const index = seatsInRow.findIndex((item) => item.id === seat.id);
    return index >= 0 ? `${row.rowLabel}${index + 1}` : fallbackLabel;
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
        message: error.response?.data?.message || t('settings.layouts.loadError')
      });
    } finally {
      setIsLoadingLayouts(false);
    }
  };

  const addSeatToSelectedSala = () => {
    if (!selectedSala) return;
    if (selectedSalaSeats.length >= Number(selectedSala.pojemnosc || 0)) {
      setLayoutStatus({ type: 'error', message: t('settings.layouts.capacityReached') });
      return;
    }
    const maxBaseLabel = selectedSalaSeats.reduce((max, item) => {
      const value = Number(item.baseLabel);
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);
    const newSeat = {
      id: `seat-${Date.now()}`,
      type: 'SEAT',
      baseLabel: String(maxBaseLabel + 1),
      rowLabel: '',
      x: 16,
      y: 16,
      width: null,
      height: null,
      rotation: 0
    };
    updateSelectedSalaPlan([...selectedSalaElements, newSeat]);
    setSelectedElementId(newSeat.id);
    setLayoutStatus({ type: '', message: '' });
  };

  const addRowToSelectedSala = () => {
    if (!selectedSala) return;
    const nextLabel = rowLabelDraft.trim().toUpperCase();
    if (!/^[A-Z]{1,2}$/.test(nextLabel)) {
      setLayoutStatus({ type: 'error', message: t('settings.layouts.invalidRowName') });
      return;
    }
    const newRow = {
      id: `row-${Date.now()}`,
      type: 'ROW',
      baseLabel: '',
      rowLabel: nextLabel,
      x: 24,
      y: 24,
      width: ROW_BASE_WIDTH,
      height: ROW_BASE_HEIGHT,
      rotation: 0
    };
    updateSelectedSalaPlan([...selectedSalaElements, newRow]);
    setSelectedElementId(newRow.id);
    setLayoutStatus({ type: '', message: '' });
  };

  const rotateSelectedSeat = () => {
    if (!selectedElementId) return;
    const nextSeats = selectedSalaElements.map((seat) => (
      seat.id === selectedElementId
        ? { ...seat, rotation: ((seat.rotation || 0) + 45) % 360 }
        : seat
    ));
    const rotatedSeat = nextSeats.find((seat) => seat.id === selectedElementId);
    const seatSize = getElementDimensions(rotatedSeat);
    if (
      rotatedSeat.x < 0
      || rotatedSeat.y < 0
      || rotatedSeat.x + seatSize.width > selectedLayoutWidth
      || rotatedSeat.y + seatSize.height > selectedLayoutHeight
    ) {
      setLayoutStatus({ type: 'error', message: t('settings.layouts.rotateOutOfBounds') });
      return;
    }
    updateSelectedSalaPlan(nextSeats);
    setLayoutStatus({ type: '', message: '' });
  };

  const saveSelectedSalaPlan = async () => {
    if (!selectedSala) return;
    
  
    const hasOverlaps = selectedSalaSeats.some((seat) => {
      const candidateSize = getElementDimensions(seat);
      return selectedSalaSeats.some((otherSeat) => {
        if (seat.id === otherSeat.id) return false;
        const otherSize = getElementDimensions(otherSeat);
        return !(
          seat.x + candidateSize.width <= otherSeat.x
          || otherSeat.x + otherSize.width <= seat.x
          || seat.y + candidateSize.height <= otherSeat.y
          || otherSeat.y + otherSize.height <= seat.y
        );
      });
    });

    if (hasOverlaps) {
      setLayoutStatus({ type: 'error', message: t('settings.layouts.overlapError') });
      return;
    }

    try {
      await apiClient.put(
        `/miejsca/sale/${selectedSala.id}/plan`,
        { layoutWidth: selectedLayoutWidth, layoutHeight: selectedLayoutHeight, seats: selectedSalaElements },
        getRequestConfig()
      );
      setLayoutStatus({ type: 'success', message: t('settings.layouts.saved') });
      loadLayoutData();
    } catch (error) {
      setLayoutStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.layouts.saveError')
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
          message: t('settings.profile.emailChangePending')
        });
      } else {
        setStatus({ type: 'success', message: t('settings.profile.saveChangesSuccess') });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.profile.saveError')
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
      setStatus({ type: 'error', message: t('settings.emailVerification.missingCode') });
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
        throw new Error(response?.data?.message || t('settings.emailVerification.error'));
      }

      setPendingVerificationEmail('');
      setVerificationCode('');
      setStatus({ type: 'success', message: t('settings.emailVerification.success') });
      // aktualizacja kontekstu od razu, aby UI pokazał nowy email bez przeładowania.
      applyAuthenticatedUser({ ...currentUser, email: emailToVerify });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || error.message || t('settings.emailVerification.error')
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
      setPasswordStatus({ type: 'error', message: t('settings.security.password.fillAll') });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordStatus({ type: 'error', message: t('settings.security.password.mismatch') });
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
      setPasswordStatus({ type: 'success', message: t('settings.security.password.changed') });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      setPasswordStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.security.password.changeError')
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
          message: error.response?.data?.message || t('settings.security.twoFactor.loadError')
        });
      } finally {
        setIsLoadingTwoFactorStatus(false);
      }
    };
    loadTwoFactorStatus();
  }, [activeTab, activeSecurityTab]);

  const observedOnlyNotificationsDisabled = hasObservedEvents === false;

  // Zakładka Obserwowane: GET listy z API + ponowne ładowanie po OBSERVED_EVENTS_CHANGED (np. gwiazdka na karcie).
  useEffect(() => {
    if (!currentUser?.id || activeTab !== 'obserwowane') {
      return undefined;
    }
    let cancelled = false;
    const loadObserved = async () => {
      setIsLoadingObserved(true);
      setObservedStatus({ type: '', message: '' });
      try {
        const events = await refreshObservedEvents(authCredentials, currentUser.id);
        if (!cancelled) {
          setObservedEvents(events);
          setHasObservedEvents(events.length > 0);
        }
      } catch (error) {
        if (!cancelled) {
          setObservedEvents([]);
          setHasObservedEvents(false);
          if (error.response?.status !== 403) {
          setObservedStatus({
            type: 'error',
            message: error.response?.data?.message || t('settings.observed.loadError'),
          });
          }
        }
      } finally {
        if (!cancelled) setIsLoadingObserved(false);
      }
    };
    loadObserved();
    const onObservedChanged = (event) => {
      if (event.detail?.userId != null && event.detail.userId !== currentUser.id) return;
      loadObserved();
    };
    window.addEventListener(OBSERVED_EVENTS_CHANGED, onObservedChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(OBSERVED_EVENTS_CHANGED, onObservedChanged);
    };
  }, [currentUser?.id, activeTab, authCredentials]);

  // Zakładka Powiadomienia: tylko sprawdzenie, czy lista obserwowanych jest pusta (bez wyświetlania listy).
  useEffect(() => {
    if (!currentUser?.id || activeTab !== 'powiadomienia') {
      return undefined;
    }
    let cancelled = false;
    const syncHasObservedEvents = async () => {
      try {
        await ensureObservedLoaded(authCredentials, currentUser.id);
        if (!cancelled) setHasObservedEvents(getObservedEvents().length > 0);
      } catch {
        if (!cancelled) setHasObservedEvents(false);
      }
    };
    syncHasObservedEvents();
    const onObservedChanged = (event) => {
      if (event.detail?.userId != null && event.detail.userId !== currentUser.id) return;
      setHasObservedEvents(getObservedEvents().length > 0);
    };
    window.addEventListener(OBSERVED_EVENTS_CHANGED, onObservedChanged);
    return () => {
      cancelled = true;
      window.removeEventListener(OBSERVED_EVENTS_CHANGED, onObservedChanged);
    };
  }, [currentUser?.id, activeTab, authCredentials]);

  useEffect(() => {
    if (!currentUser?.id || activeTab !== 'powiadomienia') {
      return undefined;
    }
    let cancelled = false;
    const loadNotificationSettings = async () => {
      setIsLoadingNotificationSettings(true);
      setNotificationSettingsStatus({ type: '', message: '' });
      try {
        const data = await getNotificationSettings(authCredentials);
        if (!cancelled) {
          setNotificationSettings(applySavedNotificationSettings(data));
        }
      } catch (error) {
        if (!cancelled) {
          setNotificationSettingsStatus({
            type: 'error',
            message: error.response?.data?.message || t('settings.notifications.loadError'),
          });
        }
      } finally {
        if (!cancelled) setIsLoadingNotificationSettings(false);
      }
    };
    loadNotificationSettings();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, activeTab, authCredentials]);

  const applySavedNotificationSettings = (saved) => ({
    adminLogin: saved?.adminLogin !== false,
    newEvent: saved?.newEvent !== false,
    favoriteLogin: saved?.favoriteLogin === true,
    observedEventEnd: saved?.observedEventEnd !== false,
    observedEventStart: saved?.observedEventStart !== false,
    observedSeatFreed: saved?.observedSeatFreed !== false,
    newRefundRequest: saved?.newRefundRequest !== false,
    newOrganizerRequest: saved?.newOrganizerRequest !== false,
    newSecurityReport: saved?.newSecurityReport !== false,
  });

  const handleNotificationSettingChange = async (key, checked) => {
    const previous = notificationSettings[key];
    setNotificationSettings((prev) => ({ ...prev, [key]: checked }));
    setNotificationSettingsStatus({ type: '', message: '' });
    setIsSavingNotificationSettings(true);
    try {
      const saved = await updateNotificationSettings(authCredentials, { [key]: checked });
      setNotificationSettings(applySavedNotificationSettings(saved));
      setNotificationSettingsStatus({ type: 'success', message: t('settings.notifications.saved') });
    } catch (error) {
      setNotificationSettings((prev) => ({ ...prev, [key]: previous }));
      setNotificationSettingsStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.notifications.saveError'),
      });
    } finally {
      setIsSavingNotificationSettings(false);
    }
  };

  useEffect(() => {
    const tabFromNav = location.state?.settingsTab;
    if (tabFromNav) {
      setActiveTab(tabFromNav);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (activeTab === 'uklady-sal') {
      loadLayoutData();
    }
  }, [activeTab]);

  useEffect(() => {
    setLanguageForm(currentUser?.language === 'en' ? 'en' : 'pl');
  }, [currentUser?.language]);

  useEffect(() => {
    if (!dragState || !selectedSala) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      const canvasRect = dragState.canvasRect;
      const seat = selectedSalaElements.find((item) => item.id === dragState.seatId);
      if (!seat) return;

      const seatSize = getElementDimensions(seat);
      const nextX = Math.max(0, Math.min(selectedLayoutWidth - seatSize.width, Math.round(event.clientX - canvasRect.left - dragState.offsetX)));
      const nextY = Math.max(0, Math.min(selectedLayoutHeight - seatSize.height, Math.round(event.clientY - canvasRect.top - dragState.offsetY)));
      const candidateSeat = { ...seat, x: nextX, y: nextY };
      if (seat.type === 'SEAT' && hasSeatCollision(selectedSalaSeats, candidateSeat)) {
        return;
      }
      updateSelectedSalaPlan(selectedSalaElements.map((item) => item.id === seat.id ? candidateSeat : item));
    };

    const handleMouseUp = () => setDragState(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, selectedSala, selectedSalaElements, selectedSalaSeats, selectedLayoutHeight, selectedLayoutWidth]);

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
          message: error.response?.data?.message || t('settings.security.loginHistory.loadError')
        });
      } finally {
        setIsLoadingLoginHistory(false);
      }
    };
    loadLoginHistory();
  }, [activeTab, activeSecurityTab]);

  const formatLoginTime = (value) => {
    if (!value) return t('settings.security.loginHistory.missingData');
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) return t('settings.security.loginHistory.missingData');
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
        return t('settings.security.loginHistory.status.success');
      case 'NIEUDANE_HASLO_LUB_LOGIN':
        return t('settings.security.loginHistory.status.invalidLogin');
      case 'NIEUDANY_2FA':
        return t('settings.security.loginHistory.status.invalid2fa');
      case 'ZABLOKOWANO_BRAK_WERYFIKACJI_EMAIL':
        return t('settings.security.loginHistory.status.blocked');
      default:
        return t('settings.security.loginHistory.status.unknown');
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
      setLoginHistoryStatus({ type: 'success', message: t('settings.security.loginHistory.reportSent') });
      setReportLoginLogId(null);
      setReportNote('');
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.detail || t('settings.security.loginHistory.reportSendError');
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
        setTwoFactorStatus({ type: 'error', message: t('settings.security.twoFactor.generateError') });
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
          message: error.response?.data?.message || t('settings.security.session.loadError')
        });
      } finally {
        setIsLoadingSessionSettings(false);
      }
    };
    loadSessionSettings();
  }, [activeTab, activeSecurityTab]);

  // Load wallet data when payments tab is active
  useEffect(() => {
    const loadWallet = async () => {
      if (activeTab !== 'platnosci') return;
      setIsLoadingWallet(true);
      setWalletStatus({ type: '', message: '' });
      try {
        const response = await apiClient.get('/users/me/wallet', getRequestConfig());
        setWalletData({
          balance: response?.data?.balance || 0,
          bankAccountNumber: response?.data?.bankAccountNumber || '',
          paymentMethod: response?.data?.paymentMethod || ''
        });
        setPaymentMethodForm({
          paymentMethod: response?.data?.paymentMethod || '',
          bankAccountNumber: response?.data?.bankAccountNumber || ''
        });
      } catch (error) {
        setWalletStatus({
          type: 'error',
          message: error.response?.data?.message || t('settings.payments.loadError')
        });
      } finally {
        setIsLoadingWallet(false);
      }
    };
    loadWallet();
  }, [activeTab]);

  const handleAddFunds = async (event) => {
    event.preventDefault();
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) {
      setWalletStatus({ type: 'error', message: t('settings.payments.invalidAmount') });
      return;
    }
    setIsAddingFunds(true);
    setWalletStatus({ type: '', message: '' });
    try {
      const response = await apiClient.post('/users/me/wallet/add-funds', { amount }, getRequestConfig());
      setWalletData({
        balance: response?.data?.balance || 0,
        bankAccountNumber: response?.data?.bankAccountNumber || '',
        paymentMethod: response?.data?.paymentMethod || ''
      });
      setAddFundsAmount('');
      setWalletStatus({ type: 'success', message: t('settings.payments.fundsAdded', { amount }) });
    } catch (error) {
      setWalletStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.payments.addFundsError')
      });
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleUpdatePaymentMethod = async (event) => {
    event.preventDefault();
    setIsSavingPaymentMethod(true);
    setWalletStatus({ type: '', message: '' });
    try {
      const response = await apiClient.put('/users/me/wallet/payment-method', paymentMethodForm, getRequestConfig());
      setWalletData({
        balance: response?.data?.balance || 0,
        bankAccountNumber: response?.data?.bankAccountNumber || '',
        paymentMethod: response?.data?.paymentMethod || ''
      });
      setWalletStatus({ type: 'success', message: t('settings.payments.paymentMethodUpdated') });
    } catch (error) {
      setWalletStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.payments.paymentMethodUpdateError')
      });
    } finally {
      setIsSavingPaymentMethod(false);
    }
  };

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
        message: error.response?.data?.message || t('settings.security.twoFactor.setupError')
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
      setTwoFactorStatus({ type: 'error', message: t('settings.security.twoFactor.missingCode') });
      return;
    }
    setIsSavingTwoFactor(true);
    try {
      await authService.enableTwoFactor(twoFactorEnableCode.trim());
      setTwoFactorEnabled(true);
      setTwoFactorSetup({ secret: '', otpAuthUrl: '' });
      setTwoFactorEnableCode('');
      setTwoFactorDisableCode('');
      setTwoFactorStatus({ type: 'success', message: t('settings.security.twoFactor.enabled') });
    } catch (error) {
      setTwoFactorStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.security.twoFactor.enableError')
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
      setTwoFactorStatus({ type: 'error', message: t('settings.security.twoFactor.disableCodeMissing') });
      return;
    }
    setIsSavingTwoFactor(true);
    try {
      await authService.disableTwoFactor(twoFactorDisableCode.trim());
      setTwoFactorEnabled(false);
      setTwoFactorDisableCode('');
      setTwoFactorSetup({ secret: '', otpAuthUrl: '' });
      setTwoFactorStatus({ type: 'success', message: t('settings.security.twoFactor.disabled') });
    } catch (error) {
      setTwoFactorStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.security.twoFactor.disableError')
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
      setSessionSettingsStatus({ type: 'success', message: t('settings.security.session.saved') });
    } catch (error) {
      setSessionSettingsStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.security.session.saveError')
      });
    } finally {
      setIsSavingSessionSettings(false);
    }
  };

  const handleSaveLanguage = async () => {
    const nextLanguage = languageForm === 'en' ? 'en' : 'pl';
    setIsSavingLanguage(true);
    setLanguageStatus({ type: '', message: '' });
    try {
      let response;
      try {
        response = await apiClient.put('/users/me/language', { language: nextLanguage }, getRequestConfig());
      } catch (primaryError) {
        const statusCode = primaryError?.response?.status;
        if (statusCode !== 404) {
          throw primaryError;
        }
        response = await apiClient.put('/users/me', { language: nextLanguage }, getRequestConfig());
      }
      const updatedUser = response?.data || {};
      applyAuthenticatedUser({
        ...currentUser,
        ...updatedUser,
        language: updatedUser.language === 'en' ? 'en' : nextLanguage
      });
      i18n.changeLanguage(updatedUser.language === 'en' ? 'en' : nextLanguage);
      setLanguageStatus({ type: 'success', message: t('settings.language.saved') });
    } catch (error) {
      setLanguageStatus({
        type: 'error',
        message: error.response?.data?.message || t('settings.language.error')
      });
    } finally {
      setIsSavingLanguage(false);
    }
  };

  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <h2>{t('settings.page.title')}</h2>
        <nav className="settings-nav" aria-label={t('settings.nav.ariaLabel')}>
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
                setLanguageStatus({ type: '', message: '' });
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
            <h3>{t('settings.profile.title')}</h3>
            <p>{t('settings.profile.subtitle')}</p>

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
                  {t('settings.profile.edit')}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-new-event"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving ? t('common.saving') : t('settings.profile.saveChanges')}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    {t('common.cancel')}
                  </button>
                </>
              )}
            </div>

          </div>
        ) : activeTab === 'platnosci' ? (
          <div className="settings-panel">
            <h3>{t('settings.payments.title')}</h3>
            <p className="settings-subtitle">{t('settings.payments.subtitle')}</p>
            
            {isLoadingWallet ? (
              <p className="settings-subtitle">{t('settings.payments.loading')}</p>
            ) : (
              <>
                <div className="wallet-balance-section">
                  <h4>{t('settings.payments.walletBalance')}</h4>
                  <div className="wallet-balance-display">
                    <span className="wallet-balance-amount">{walletData.balance.toFixed(2)} PLN</span>
                  </div>
                </div>

                <div className="wallet-add-funds-section">
                  <h4>{t('settings.payments.addFundsTitle')}</h4>
                  <form onSubmit={handleAddFunds}>
                    <label htmlFor="add-funds-amount">{t('settings.payments.addFundsAmountLabel')}</label>
                    <input
                      id="add-funds-amount"
                      className="buttonv2"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={addFundsAmount}
                      onChange={(e) => setAddFundsAmount(e.target.value)}
                      placeholder={t('settings.payments.addFundsAmountPlaceholder')}
                      disabled={isAddingFunds}
                    />
                    <button
                      type="submit"
                      className="btn-new-event"
                      disabled={isAddingFunds}
                    >
                      {isAddingFunds ? t('settings.payments.addingFunds') : t('settings.payments.addFunds')}
                    </button>
                  </form>
                </div>

                <div className="wallet-payment-method-section">
                  <h4>{t('settings.payments.paymentMethod')}</h4>
                  <form onSubmit={handleUpdatePaymentMethod}>
                    <label htmlFor="payment-method">{t('settings.payments.paymentMethod')}</label>
                    <input
                      id="payment-method"
                      type="text"
                      className="buttonv2"
                      value={paymentMethodForm.paymentMethod}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, paymentMethod: e.target.value })}
                      placeholder={t('settings.payments.paymentMethodPlaceholder')}
                      disabled={isSavingPaymentMethod}
                    />
                    
                    <label htmlFor="bank-account-number">{t('settings.payments.bankAccountNumber')}</label>
                    <input
                      id="bank-account-number"
                      type="text"
                      className="buttonv2"
                      value={paymentMethodForm.bankAccountNumber}
                      onChange={(e) => setPaymentMethodForm({ ...paymentMethodForm, bankAccountNumber: e.target.value })}
                      placeholder={t('settings.payments.bankAccountPlaceholder')}
                      disabled={isSavingPaymentMethod}
                    />
                    
                    <button
                      type="submit"
                      className="btn-new-event"
                      disabled={isSavingPaymentMethod}
                    >
                      {isSavingPaymentMethod ? t('common.saving') : t('settings.payments.savePaymentMethod')}
                    </button>
                  </form>
                </div>

                {walletStatus.message && (
                  <p className={`status-message ${walletStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                    {walletStatus.message}
                  </p>
                )}
              </>
            )}
          </div>
        ) : activeTab === 'powiadomienia' ? (
<div className="settings-panel">
    <h3>{t('settings.notifications.title')}</h3>
    <p className="settings-subtitle">{t('settings.notifications.subtitle')}</p>
    {isLoadingNotificationSettings && (
      <p className="settings-subtitle">{t('settings.notifications.loading')}</p>
    )}
    {/*Sekcja powiadomień tylko dla użytkownika*/}
    {currentUser?.rola === 'USER' && (
      <>
    <div className="settings-list">
      <div className="settings-row">
        <span>{t('settings.notifications.adminLogin')}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.adminLogin}
            disabled={isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('adminLogin', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="settings-row">
        <span>{t('settings.notifications.newEvent')}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.newEvent}
            disabled={isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('newEvent', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className="settings-row">
        <span>{t('settings.notifications.favoriteLogin')}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.favoriteLogin}
            disabled={isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('favoriteLogin', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className={`settings-row${observedOnlyNotificationsDisabled ? ' is-disabled' : ''}`}>
        <span>{t('settings.notifications.observedEventEnd')} <small className="badge-beta">
        <span 
        className="permission-tooltip has-tooltip" 
        data-tooltip={t('settings.notifications.observedOnlyTooltip')}
        >
        *
        </span></small></span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.observedEventEnd}
            disabled={observedOnlyNotificationsDisabled || isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('observedEventEnd', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className={`settings-row${observedOnlyNotificationsDisabled ? ' is-disabled' : ''}`}>
        <span>{t('settings.notifications.observedEventStart')} <small className="badge-beta">
        <span 
        className="permission-tooltip has-tooltip" 
        data-tooltip={t('settings.notifications.observedOnlyTooltip')}
        >
        *
        </span>
          </small></span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.observedEventStart}
            disabled={observedOnlyNotificationsDisabled || isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('observedEventStart', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>

      <div className={`settings-row${observedOnlyNotificationsDisabled ? ' is-disabled' : ''}`}>
        <span>{t('settings.notifications.observedSeatFreed')} <small className="badge-beta">
        <span 
        className="permission-tooltip has-tooltip" 
        data-tooltip={t('settings.notifications.observedOnlyTooltip')}
        >
        *
        </span></small></span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.observedSeatFreed}
            disabled={observedOnlyNotificationsDisabled || isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('observedSeatFreed', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
      </div>
    </div>
    </>
    )}
    {/*Sekcja powiadomień tylko dla administratora*/}
    {currentUser?.rola === 'ADMIN' && (
      <>
      <div className="settings-list">
        <div className="settings-row">
        <span>{t('settings.notifications.newRefundRequest')}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.newRefundRequest}
            disabled={isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('newRefundRequest', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
        </div>

        <div className="settings-row">
        <span>{t('settings.notifications.newOrganizerRequest')}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.newOrganizerRequest}
            disabled={isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('newOrganizerRequest', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
        </div>

        <div className="settings-row">
        <span>{t('settings.notifications.newSecurityReport')}</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={notificationSettings.newSecurityReport}
            disabled={isLoadingNotificationSettings || isSavingNotificationSettings}
            onChange={(event) => handleNotificationSettingChange('newSecurityReport', event.target.checked)}
          />
          <span className="slider"></span>
        </label>
        </div>
      </div>
    </>
    )}
    {notificationSettingsStatus.message && (
      <p className={`status-message ${notificationSettingsStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
        {notificationSettingsStatus.message}
      </p>
    )}
  </div>

        ) : activeTab === 'obserwowane' ? (
          <div className="settings-panel">
            
            <h3>{t('settings.observed.title')}</h3>
            <p className="settings-subtitle">
            {t('settings.observed.subtitle.prefix')}{' '}
  <span className="settings-subtitle-no-events-link" onClick={() => setActiveTab('powiadomienia')}>
    {t('settings.tabs.powiadomienia')}
  </span>
  {' '}
            
  {t('settings.observed.subtitle.postfix')}
            </p>
            {isLoadingObserved && <p className="settings-subtitle">{t('settings.observed.loading')}</p>}
            {!isLoadingObserved && observedEvents.length === 0 ? (
              <div className="settings-subtitle-no-events-centered">
              <p className="settings-subtitle-no-events">{t('settings.observed.empty')}</p>
              <p className="settings-subtitle-no-events-description">
                {t('settings.observed.emptyPrompt')}{' '}
                <span
                  className="settings-subtitle-no-events-link"
                  onClick={() => navigate('/wydarzenia')}
                >
                  {t('settings.observed.eventsPage')}
                </span>
                .
              </p>
              </div>
            ) : null}
            {!isLoadingObserved && observedEvents.length > 0 ? (
              <ul className="settings-observed-list">
                {observedEvents.map((event) => (
                  <li key={event.id} className="settings-observed-item">
                    <div className="settings-observed-item__main">
                      <strong>{event.tytul || t('settings.observed.eventTitleFallback', { id: event.id })}</strong>
                      <span>{event.salaNazwa || t('settings.observed.unknownHall')}</span>
                      <span>{formatObservedEventDate(event.dataRozp)}</span>
                      {event.kategoriaNazwa ? <span>{event.kategoriaNazwa}</span> : null}
                    </div>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={async () => {
                        if (!currentUser?.id) return;
                        try {
                          await removeObservedEvent(authCredentials, currentUser.id, event.id);
                          setObservedEvents(await refreshObservedEvents(authCredentials, currentUser.id));
                        } catch (error) {
                          setObservedStatus({
                            type: 'error',
                            message: error.response?.data?.message || t('settings.observed.removeError'),
                          });
                        }
                      }}
                    >
                      {t('settings.observed.remove')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {observedStatus.message && (
              <p className={`status-message ${observedStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                {observedStatus.message}
              </p>
            )}
          </div>
          
        ) : activeTab === 'bezpieczenstwo' ? (
          <div className="settings-panel">
            <h3>{t('settings.security.title')}</h3>
            <nav className="settings-subnav" aria-label={t('settings.security.subnavLabel')}>
              {securityTabs.map((tab) => (
                <span
                  key={tab.id}
                  className={`permission-tooltip ${tab.adminOnly && !isAdminUser ? 'has-tooltip' : ''}`}
                  data-tooltip={tab.adminOnly && !isAdminUser ? t('settings.security.adminOnlyTooltip') : ''}
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
                  <h4>{t('settings.security.tabs.changePassword')}</h4>
                  <form className="settings-password-form" onSubmit={handleSavePassword}>
                    <label htmlFor="old-password">
                      {t('settings.security.password.old')}
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
                          aria-label={passwordVisibility.oldPassword ? t('settings.security.password.hide') : t('settings.security.password.show')}
                        >
                          <img
                            src={passwordVisibility.oldPassword ? '/icons/eye_open.png' : '/icons/eye_closed.png'}
                            alt={passwordVisibility.oldPassword ? t('settings.security.password.hide') : t('settings.security.password.show')}
                            className="password-visibility-icon"
                          />
                        </button>
                      </div>
                    </label>
                    <label htmlFor="new-password">
                      {t('settings.security.password.new')}
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
                          aria-label={passwordVisibility.newPassword ? t('settings.security.password.hide') : t('settings.security.password.show')}
                        >
                          <img
                            src={passwordVisibility.newPassword ? '/icons/eye_open.png' : '/icons/eye_closed.png'}
                            alt={passwordVisibility.newPassword ? t('settings.security.password.hide') : t('settings.security.password.show')}
                            className="password-visibility-icon"
                          />
                        </button>
                      </div>
                    </label>
                    <label htmlFor="confirm-new-password">
                      {t('settings.security.password.confirm')}
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
                          aria-label={passwordVisibility.confirmNewPassword ? t('settings.security.password.hide') : t('settings.security.password.show')}
                        >
                          <img
                            src={passwordVisibility.confirmNewPassword ? '/icons/eye_open.png' : '/icons/eye_closed.png'}
                            alt={passwordVisibility.confirmNewPassword ? t('settings.security.password.hide') : t('settings.security.password.show')}
                            className="password-visibility-icon"
                          />
                        </button>
                      </div>
                    </label>
                    <button type="submit" className="btn-new-event settings-password-submit" disabled={isSavingPassword}>
                      {isSavingPassword ? t('settings.security.password.saving') : t('settings.security.password.save')}
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
                  <h4>{t('settings.security.twoFactor.title')}</h4>
                  <p>{t('settings.security.twoFactor.description')}</p>
                  <p>{t('settings.security.twoFactor.apps')}</p>
                  {isLoadingTwoFactorStatus ? (
                    <p>{t('settings.security.twoFactor.loadingStatus')}</p>
                  ) : twoFactorEnabled ? (
                    <div className="settings-2fa-block">
                      <p>
                        {t('settings.security.twoFactor.status')}: <span className="header-accent">{t('settings.security.twoFactor.statusOn')}</span>
                      </p>
                      <form className="settings-2fa-form" onSubmit={handleDisableTwoFactor}>
                        <label htmlFor="disable-2fa-code">
                          {t('settings.security.twoFactor.code')}
                          <input
                            id="disable-2fa-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={twoFactorDisableCode}
                            onChange={(event) => setTwoFactorDisableCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder={t('settings.security.twoFactor.codePlaceholder')}
                          />
                        </label>
                        <button type="submit" className="btn-secondary" disabled={isSavingTwoFactor}>
                          {isSavingTwoFactor ? t('settings.security.twoFactor.disabling') : t('settings.security.twoFactor.disable')}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="settings-2fa-block">
                      <p>
                        {t('settings.security.twoFactor.status')}: <span className="header-accent">{t('settings.security.twoFactor.statusOff')}</span>
                      </p>
                      {!twoFactorSetup.secret ? (
                        <button
                          type="button"
                          className="btn-new-event"
                          onClick={handleGenerateTwoFactorSecret}
                          disabled={isGeneratingTwoFactorSecret}
                        >
                          {isGeneratingTwoFactorSecret ? t('settings.security.twoFactor.generating') : t('settings.security.twoFactor.startSetup')}
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
                            {t('settings.security.twoFactor.code')}
                            <input
                              id="enable-2fa-code"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]{6}"
                              maxLength={6}
                              value={twoFactorEnableCode}
                              onChange={(event) => setTwoFactorEnableCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder={t('settings.security.twoFactor.codePlaceholder')}
                            />
                          </label>
                          <button type="submit" className="btn-new-event settings-password-submit" disabled={isSavingTwoFactor}>
                            {isSavingTwoFactor ? t('settings.security.twoFactor.enabling') : t('settings.security.twoFactor.enable')}
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
                  <h4>{t('settings.security.session.title')}</h4>
                  <p>{t('settings.security.session.description')}</p>
                  {isLoadingSessionSettings && <p>{t('settings.security.session.loading')}</p>}
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
                      <summary>{t('settings.security.session.sectionBase')}</summary>
                      <div className="settings-session-toggle">
                        <span>{t('settings.security.session.enableCounter')}</span>
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
                        {t('settings.security.session.durationMinutes')}
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
                        {t('settings.security.session.warningMinutes')}
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
                      <summary>{t('settings.security.session.sectionCounting')}</summary>
                      <p>{t('settings.security.session.countingDescription')}</p>
                      <label htmlFor="session-count-mode">
                        {t('settings.security.session.countMode')}
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
                          <option value="ABSOLUTE">{t('settings.security.session.countModeAbsolute')}</option>
                          <option value="RELATIVE">{t('settings.security.session.countModeRelative')}</option>
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
                      <summary>{t('settings.security.session.sectionExpiry')}</summary>
                      <p>{t('settings.security.session.expiryDescription')}</p>
                      <label htmlFor="session-expiry-action">
                        {t('settings.security.session.expiryAction')}
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
                          <option value="LOCK_SCREEN">{t('settings.security.session.expiryLock')}</option>
                          <option value="LOGOUT">{t('settings.security.session.expiryLogout')}</option>
                        </select>
                      </label>
                    </details>

                    <button
                      type="submit"
                      className="btn-new-event settings-password-submit"
                      disabled={isLoadingSessionSettings || isSavingSessionSettings}
                    >
                      {isSavingSessionSettings ? t('settings.security.session.saving') : t('settings.security.session.save')}
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
                  <h4>{t('settings.security.loginHistory.title')}</h4>
                  <p>{t('settings.security.loginHistory.description')}</p>
                  {isLoadingLoginHistory && <p>{t('settings.security.loginHistory.loading')}</p>}
                  {!isLoadingLoginHistory && (
                    <div className="settings-login-history-wrap">
                      <table className="settings-login-history-table">
                        <thead>
                          <tr>
                            <th>{t('settings.security.loginHistory.col.dateTime')}</th>
                            <th>{t('settings.security.loginHistory.col.device')}</th>
                            <th>{t('settings.security.loginHistory.col.location')}</th>
                            <th>{t('settings.security.loginHistory.col.status')}</th>
                            <th>{t('settings.security.loginHistory.col.action')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginHistory.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="settings-login-history-empty">
                                {t('settings.security.loginHistory.empty')}
                              </td>
                            </tr>
                          ) : (
                            loginHistory.map((entry) => {
                              const statusLabel = mapLoginStatusLabel(entry.status);
                              const isSuccess = entry.status === 'SUKCES';
                              return (
                                <tr key={entry.id != null ? String(entry.id) : `${entry.loginTime}-${entry.status}`}>
                                  <td>{formatLoginTime(entry.loginTime)}</td>
                                  <td>{entry.deviceInfo || t('settings.security.loginHistory.unknownDevice')}</td>
                                  <td>{entry.location || t('settings.security.loginHistory.unknownLocation')}</td>
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
                                      {t('settings.security.loginHistory.report')}
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
                        <h4 id="settings-report-title">{t('settings.security.loginHistory.reportDialogTitle')}</h4>
                        <p>{t('settings.security.loginHistory.reportDialogDescription')}</p>
                        <textarea
                          id="settings-report-note"
                          rows={4}
                          value={reportNote}
                          onChange={(e) => setReportNote(e.target.value)}
                          placeholder={t('settings.security.loginHistory.reportNotePlaceholder')}
                          disabled={isSubmittingReport}
                        />
                        <div className="settings-report-actions">
                          <button type="button" className="btn-secondary" onClick={() => !isSubmittingReport && setReportLoginLogId(null)} disabled={isSubmittingReport}>
                            {t('settings.security.loginHistory.reportCancel')}
                          </button>
                          <button type="button" className="btn-new-event" onClick={handleSubmitLoginReport} disabled={isSubmittingReport}>
                            {isSubmittingReport ? t('settings.security.loginHistory.reportSending') : t('settings.security.loginHistory.reportSend')}
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
                <p>{t('settings.layouts.onlyOrganizer')}</p>
              ) : (
                <div className="settings-layouts">
                  {isLoadingLayouts && <p>{t('settings.layouts.loading')}</p>}
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
                                  setSelectedElementId(null);
                                }}
                                disabled={!sala.maPlan}
                              >
                                {sala.nazwa} {!sala.maPlan ? t('settings.layouts.noHallPlan') : ''}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p>{t('settings.layouts.noHallsForPlace')}</p>
                        )}
                      </div>
                    )) : (
                      <p>{t('settings.layouts.noPlacesOrHalls')}</p>
                    )}
                  </div>

                  {selectedSala && (
                    <div className="settings-layout-editor">
                      <div className="settings-layout-editor-header">
                        <div>
                          <h4>{selectedSala.nazwa}</h4>
                          <p>{t('settings.layouts.capacityLine', { place: selectedSala.miejsceNazwa, count: selectedSala.pojemnosc || 0 })}</p>
                          <div className="settings-layout-editor-dimensions">
                            <label>
                              {t('settings.layouts.areaWidth')}
                              <input
                                type="number"
                                className="buttonv2"
                                min="240"
                                value={selectedLayoutWidth}
                                onChange={(event) => updateSelectedSalaPlan(selectedSalaElements, Number(event.target.value) || 240, selectedLayoutHeight)}
                              />
                            </label>
                            <label>
                              {t('settings.layouts.areaHeight')}
                              <input
                                type="number"
                                className="buttonv2"
                                min="180"
                                value={selectedLayoutHeight}
                                onChange={(event) => updateSelectedSalaPlan(selectedSalaElements, selectedLayoutWidth, Number(event.target.value) || 180)}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="settings-layout-editor-actions">
                          <button type="button" className="btn-secondary" onClick={addSeatToSelectedSala}>
                            {t('settings.layouts.addSeat')}
                          </button>
                          <input
                            type="text"
                            maxLength="2"
                            value={rowLabelDraft}
                            onChange={(event) => setRowLabelDraft(event.target.value.replace(/[^a-z]/gi, '').toUpperCase())}
                            placeholder={t('settings.layouts.rowPlaceholder')}
                            className="settings-layout-row-input buttonv2"
                          />
                          <button type="button" className="btn-secondary" onClick={addRowToSelectedSala}>
                            {t('settings.layouts.addRow')}
                          </button>
                          <button type="button" className="btn-secondary" onClick={rotateSelectedSeat} disabled={!selectedElementId}>
                            {t('settings.layouts.rotate')}
                          </button>
                          <button type="button" className="btn-new-event" onClick={saveSelectedSalaPlan}>
                            {t('settings.layouts.save')}
                          </button>
                        </div>
                      </div>

                      {selectedElementId && selectedSalaRows.some((item) => item.id === selectedElementId) && (
                        <div className="settings-layout-editor-dimensions">
                          {selectedSalaRows.filter((item) => item.id === selectedElementId).map((row) => (
                            <React.Fragment key={row.id}>
                              <label>
                                {t('settings.layouts.rowWidth')}
                                <input
                                  type="number"
                                  min="80"
                                  className="buttonv2"
                                  value={Number(row.width) || ROW_BASE_WIDTH}
                                  onChange={(event) => updateSelectedSalaPlan(selectedSalaElements.map((item) => item.id === row.id ? { ...item, width: Number(event.target.value) || ROW_BASE_WIDTH } : item))}
                                />
                              </label>
                              <label>
                                {t('settings.layouts.rowHeight')}
                                <input
                                  type="number"
                                  min="40"
                                  className="buttonv2"
                                  value={Number(row.height) || ROW_BASE_HEIGHT}
                                  onChange={(event) => updateSelectedSalaPlan(selectedSalaElements.map((item) => item.id === row.id ? { ...item, height: Number(event.target.value) || ROW_BASE_HEIGHT } : item))}
                                />
                              </label>
                            </React.Fragment>
                          ))}
                        </div>
                      )}

                      <div className="settings-layout-canvas" style={{ width: selectedLayoutWidth, height: selectedLayoutHeight }}>
                        {selectedSalaRows.map((row) => (
                          <div
                            key={row.id}
                            className={`settings-layout-row ${selectedElementId === row.id ? 'is-selected' : ''}`}
                            style={{
                              left: row.x,
                              top: row.y,
                              width: Number(row.width) || ROW_BASE_WIDTH,
                              height: Number(row.height) || ROW_BASE_HEIGHT
                            }}
                            onMouseDown={(event) => {
                              const rect = event.currentTarget.parentElement.getBoundingClientRect();
                              setSelectedElementId(row.id);
                              setDragState({
                                seatId: row.id,
                                offsetX: event.clientX - rect.left - row.x,
                                offsetY: event.clientY - rect.top - row.y,
                                canvasRect: rect
                              });
                            }}
                          >
                            <span>{row.rowLabel || t('settings.layouts.rowShort')}</span>
                          </div>
                        ))}
                        {selectedSalaSeats.map((seat) => {
                          const seatSize = getElementDimensions(seat);
                          return (
                            <button
                              key={seat.id}
                              type="button"
                              className={`settings-layout-seat ${selectedElementId === seat.id ? 'is-selected' : ''}`}
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
                                setSelectedElementId(seat.id);
                                setDragState({
                                  seatId: seat.id,
                                  offsetX: event.clientX - rect.left - seat.x,
                                  offsetY: event.clientY - rect.top - seat.y,
                                  canvasRect: rect
                                });
                              }}
                            >
                              {getSeatDisplayLabel(seat)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : activeTab === 'wyglad' ? (
              <div className="settings-appearance">
                <p>{t('settings.appearance.title')}</p>
                <div className="settings-theme-actions">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={`btn-new-event settings-theme-btn ${theme === option.id ? 'is-active' : ''}`}
                      onClick={() => setTheme(option.id)}
                      aria-pressed={theme === option.id}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : activeTab === 'jezyk' ? (
              <div className="settings-language">
                <p>{t('settings.language.title')}</p>
                <div className="settings-list">
                  <div className="settings-row">
                    <span>{t('settings.language.option.pl')}</span>
                    <label className="switch">
                      <input
                        type="radio"
                        name="settings-language"
                        value="pl"
                        checked={languageForm === 'pl'}
                        onChange={(event) => setLanguageForm(event.target.value)}
                        disabled={isSavingLanguage}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="settings-row">
                    <span>{t('settings.language.option.en')}</span>
                    <label className="switch">
                      <input
                        type="radio"
                        name="settings-language"
                        value="en"
                        checked={languageForm === 'en'}
                        onChange={(event) => setLanguageForm(event.target.value)}
                        disabled={isSavingLanguage}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <button type="button" 
                style={{ marginTop: '10px' }}
                className="btn-new-event settings-password-submit" onClick={handleSaveLanguage} disabled={isSavingLanguage}>
                  {isSavingLanguage ? t('settings.language.saving') : t('settings.language.save')}
                </button>
                {languageStatus.message && (
                  <p className={`status-message ${languageStatus.type === 'error' ? 'status-error' : 'status-success'}`}>
                    {languageStatus.message}
                  </p>
                )}
              </div>
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
