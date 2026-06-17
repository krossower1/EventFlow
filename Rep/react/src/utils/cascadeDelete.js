import {
  invalidateObservedCache,
  OBSERVED_EVENTS_CHANGED,
  __getObservedCache,
} from './obserwowaneWydarzenia';

/**
 * Usuwa wydarzenie z lokalnego cache obserwowanych (kaskada po stronie React).
 */
export const removeEventFromObservedCache = (eventId) => {
  if (eventId == null) return;

  const cache = __getObservedCache();
  cache.events = cache.events.filter((entry) => entry.id !== eventId);
  cache.ids.delete(eventId);
  window.dispatchEvent(new CustomEvent(OBSERVED_EVENTS_CHANGED));
};

/** Po usunięciu użytkownika — czyści powiązane wpisy w stanie UI. */
export const cascadeAfterUserDelete = (deletedUserId, { setFavoriteIds, setSelectedUser, setData } = {}) => {
  if (deletedUserId == null) return;

  if (typeof setFavoriteIds === 'function') {
    setFavoriteIds((prev) => prev.filter((id) => id !== deletedUserId));
  }
  if (typeof setSelectedUser === 'function') {
    setSelectedUser(null);
  }
  if (typeof setData === 'function') {
    setData((prev) => prev.filter((user) => user.id !== deletedUserId));
  }
};

/** Po usunięciu wydarzenia — usuwa z list i cache obserwowanych. */
export const cascadeAfterEventDelete = (eventId, { setMyWydarzenia, setOpenWydarzenia } = {}) => {
  if (eventId == null) return;

  if (typeof setMyWydarzenia === 'function') {
    setMyWydarzenia((prev) => prev.filter((item) => item.id !== eventId));
  }
  if (typeof setOpenWydarzenia === 'function') {
    setOpenWydarzenia((prev) => prev.filter((item) => item.id !== eventId));
  }
  removeEventFromObservedCache(eventId);
};

/** Po usunięciu miejsca — usuwa je z listy wraz z salami. */
export const cascadeAfterMiejsceDelete = (miejsceId, setMiejsca) => {
  if (miejsceId == null || typeof setMiejsca !== 'function') return;
  setMiejsca((prev) => prev.filter((miejsce) => miejsce.id !== miejsceId));
};

/** Po usunięciu sali — usuwa salę z zagnieżdżonej listy miejsca. */
export const cascadeAfterSalaDelete = (miejsceId, salaId, setMiejsca) => {
  if (miejsceId == null || salaId == null || typeof setMiejsca !== 'function') return;
  setMiejsca((prev) => prev.map((miejsce) => {
    if (miejsce.id !== miejsceId) return miejsce;
    return {
      ...miejsce,
      sale: (miejsce.sale || []).filter((sala) => sala.id !== salaId),
    };
  }));
};

/** Po usunięciu własnego konta — pełne wyczyszczenie cache sesji. */
export const cascadeAfterOwnAccountDelete = () => {
  invalidateObservedCache();
};
