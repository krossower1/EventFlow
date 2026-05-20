import {
  addObservedEventApi,
  fetchObservedEventIds,
  fetchObservedEvents,
  removeObservedEventApi,
} from '../services/obserwowaneService';

/**
 * Zdarzenie DOM emitowane po zmianie listy obserwowanych — nasłuchują WydarzenieCard i UstawieniaPage.
 */
export const OBSERVED_EVENTS_CHANGED = 'obserwowaneWydarzeniaChanged';

/** Ujednolica status z API/karty (np. „aktywne” → AKTYWNY) przed warunkiem na przycisku gwiazdki. */
export const normalizeEventStatus = (status) => {
  if (!status) return '';
  const normalized = status.trim().toUpperCase();
  if (normalized === 'AKTYWNE') return 'AKTYWNY';
  return normalized;
};

/** Czy wydarzenie można dodać do obserwowanych (zgodnie z regułą backendu). */
export const isEventStatusActive = (status) => normalizeEventStatus(status) === 'AKTYWNY';

/** Pamięć podręczna sesji — jedno pobranie listy zamiast GET na każdej karcie. */
const cache = {
  events: [],
  ids: new Set(),
  loaded: false,
  loadPromise: null,
};

/** Powiadamia komponenty o odświeżeniu stanu gwiazdki / listy w ustawieniach. */
const notifyChanged = (userId) => {
  window.dispatchEvent(new CustomEvent(OBSERVED_EVENTS_CHANGED, { detail: { userId } }));
};

/**
 * Po odświeżeniu strony użytkownik jest uwierzytelniony ciasteczkiem sesji (JSESSIONID),
 * bez zapisanych login/hasło w pamięci — wystarczy userId + withCredentials w axios.
 */
const canUseObservedApi = (userId) => userId != null;

/** Czyści cache (wylogowanie) — kolejne wejście wymusi GET. */
export const invalidateObservedCache = () => {
  cache.loaded = false;
  cache.loadPromise = null;
  cache.events = [];
  cache.ids = new Set();
};

const applyCache = (events) => {
  cache.events = events;
  cache.ids = new Set(events.map((entry) => entry.id));
  cache.loaded = true;
};

/**
 * Ładuje listę obserwowanych raz na sesję (współdzielone promise między kartami).
 * @returns {Promise<typeof cache>}
 */
export const ensureObservedLoaded = async (authCredentials, userId) => {
  if (!canUseObservedApi(userId)) {
    return cache;
  }
  if (cache.loaded) return cache;
  if (!cache.loadPromise) {
    cache.loadPromise = fetchObservedEvents(authCredentials)
      .then((events) => {
        applyCache(events);
        return cache;
      })
      .catch((error) => {
        invalidateObservedCache();
        throw error;
      })
      .finally(() => {
        cache.loadPromise = null;
      });
  }
  await cache.loadPromise;
  return cache;
};

/** Kopia listy z cache (np. po refreshObservedEvents). */
export const getObservedEvents = () => [...cache.events];

/** Synchroniczne sprawdzenie po załadowaniu cache — używane na WydarzenieCard. */
export const isEventObserved = (eventId) => {
  if (eventId == null) return false;
  return cache.ids.has(eventId);
};

/**
 * Wymusza pobranie listy z API i aktualizuje cache + zdarzenie OBSERVED_EVENTS_CHANGED.
 */
export const refreshObservedEvents = async (authCredentials, userId) => {
  invalidateObservedCache();
  if (!canUseObservedApi(userId)) {
    notifyChanged(userId);
    return [];
  }
  const events = await fetchObservedEvents(authCredentials);
  applyCache(events);
  notifyChanged(userId);
  return events;
};

/**
 * Odświeża tylko zbiór ID (lżejsze niż pełna lista) — zapasowa ścieżka, gdy wystarczy stan gwiazdki.
 */
export const refreshObservedIds = async (authCredentials, userId) => {
  if (!canUseObservedApi(userId)) {
    invalidateObservedCache();
    notifyChanged(userId);
    return [];
  }
  const ids = await fetchObservedEventIds(authCredentials);
  cache.ids = new Set(ids);
  cache.loaded = true;
  notifyChanged(userId);
  return ids;
};

/**
 * Dodaje wydarzenie przez API i przeładowuje cache; zwraca false gdy już było obserwowane lub brak danych.
 */
export const addObservedEvent = async (authCredentials, userId, event) => {
  if (!canUseObservedApi(userId) || event?.id == null) return false;
  if (cache.ids.has(event.id)) return false;
  await addObservedEventApi(authCredentials, event.id);
  await refreshObservedEvents(authCredentials, userId);
  return true;
};

/** Usuwa z obserwowanych i synchronizuje cache z backendem. */
export const removeObservedEvent = async (authCredentials, userId, eventId) => {
  if (!canUseObservedApi(userId) || eventId == null) return;
  await removeObservedEventApi(authCredentials, eventId);
  await refreshObservedEvents(authCredentials, userId);
};
