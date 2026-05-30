import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import WydarzenieCard from '../components/WydarzenieCard';
import PurchaseModal from '../components/PurchaseModal';

const Dashboard = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const [openWydarzenia, setOpenWydarzenia] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [zakupFormOpen, setZakupFormOpen] = useState(false);
  const [selectedZakupEvent, setSelectedZakupEvent] = useState(null);
  const [dostepneBilety, setDostepneBilety] = useState([]);
  const [zakupLoading, setZakupLoading] = useState(false);
  const [zakupForm, setZakupForm] = useState({ biletId: '', ilosc: '1', potwierdzPlatnosc: false, seatId: '' });

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  const fetchOpenWydarzenia = useCallback(async () => {
    try {
      const response = await apiClient.get('/wydarzenia/open', getRequestConfig());
      setOpenWydarzenia(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się pobrać aktualnych wydarzeń.' });
    }
  }, [getRequestConfig]);

  useEffect(() => {
    fetchOpenWydarzenia();
  }, [fetchOpenWydarzenia]);

  const handleMoreInfo = (wydarzenieId) => {
    navigate(`/wydarzenia/${wydarzenieId}`);
  };

  const openZakupForm = async (eventItem) => {
    setZakupLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await apiClient.get(`/zakupy/wydarzenia/${eventItem.id}/bilety`, getRequestConfig());
      setDostepneBilety(response.data);
      setSelectedZakupEvent(eventItem);
      setZakupForm({
        biletId: response.data[0]?.biletId ? String(response.data[0].biletId) : '',
        ilosc: '1',
        potwierdzPlatnosc: false,
        seatId: ''
      });
      setZakupFormOpen(true);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się pobrać dostępnych biletów.' });
    } finally {
      setZakupLoading(false);
    }
  };

  const onZakupSubmit = async (e) => {
    e.preventDefault();
    setZakupLoading(true);

    try {
      await apiClient.post(`/zakupy/wydarzenia/${selectedZakupEvent.id}`, {
        biletId: Number(zakupForm.biletId),
        ilosc: Number(zakupForm.ilosc),
        potwierdzPlatnosc: zakupForm.potwierdzPlatnosc,
        seatId: zakupForm.seatId || null
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Zakup zakończony pomyślnie.' });
      setZakupFormOpen(false);
      fetchOpenWydarzenia();
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się zakończyć zakupu.' });
    } finally {
      setZakupLoading(false);
    }
  };

  return (
    <div className="dashboard-home">
      <section className="dashboard-intro">
        <p className="dashboard-kicker">EventFlow</p>
        <h2>Panel główny</h2>
        <p>
          EventFlow pomaga organizować wydarzenia, zarządzać salami, biletami,
          personelem, opiniami i zgłoszeniami w jednym miejscu.
        </p>
        <div className="dashboard-tabs-guide">
          <span><strong>Wydarzenia</strong> - przegląd aktywnych wydarzeń, zakup biletów i szczegóły.</span>
          <span><strong>Bilety</strong> - zakupione bilety oraz prośby o zwrot.</span>
          <span><strong>Ustawienia</strong> - konto, sale i układy miejsc dla organizatorów.</span>
          <span><strong>Panel admina</strong> - moderacja zwrotów, zgłoszeń i danych systemowych.</span>
        </div>
      </section>

      <section className="dashboard-patch-notes">
        <h3>Notatki ze zmian</h3>
        <ul>
          <li>Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.</li>
          <li>Obserwowane wydarzenia pojawiają się wyżej i można je odobserwować.</li>
          <li>Po zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.</li>
          <li>Panel główny dostał krótki przewodnik po najważniejszych zakładkach.</li>
        </ul>
      </section>

      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      <div className="dashboard-events">
        <h3>Trwające i nadchodzące wydarzenia</h3>
        <div className="events-grid">
          {openWydarzenia.length > 0 ? (
            openWydarzenia.slice(0, 3).map((item) => (
              <WydarzenieCard
                key={item.id}
                item={item}
                currentUserRole={currentUser?.rola}
                onMoreInfo={handleMoreInfo}
                onPurchase={openZakupForm}
              />
            ))
          ) : (
            <p>Brak wydarzeń, które jeszcze się nie zakończyły.</p>
          )}
        </div>
      </div>

      <PurchaseModal
        isOpen={zakupFormOpen}
        onClose={() => setZakupFormOpen(false)}
        selectedEvent={selectedZakupEvent}
        dostepneBilety={dostepneBilety}
        zakupForm={zakupForm}
        setZakupForm={setZakupForm}
        onSubmit={onZakupSubmit}
        loading={zakupLoading}
      />
    </div>
  );
};

export default Dashboard;
