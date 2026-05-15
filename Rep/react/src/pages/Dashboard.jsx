import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';
import WydarzenieCard from '../components/WydarzenieCard';
import PurchaseModal from '../components/PurchaseModal';

const Dashboard = () => {
  const { currentUser, authCredentials } = useContext(AuthContext);
  const navigate = useNavigate();
  const[openWydarzenia, setOpenWydarzenia] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Stany dla formularza zakupu
  const[zakupFormOpen, setZakupFormOpen] = useState(false);
  const [selectedZakupEvent, setSelectedZakupEvent] = useState(null);
  const [dostepneBilety, setDostepneBilety] = useState([]);
  const [zakupLoading, setZakupLoading] = useState(false);
  const[zakupForm, setZakupForm] = useState({ biletId: '', ilosc: '1', potwierdzPlatnosc: false, seatId: '' });

  // Pobieranie aktywnych wydarzeń
  const fetchOpenWydarzenia = useCallback(async () => {
    const getRequestConfig = () => {
      const config = { withCredentials: true };
      if (authCredentials.login && authCredentials.password) {
        config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
      }
      return config;
    };

    try {
      const response = await apiClient.get('/wydarzenia/open', getRequestConfig());
      setOpenWydarzenia(response.data);
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się pobrać aktualnych wydarzeń.' });
    }
  }, [authCredentials]);

  useEffect(() => {
    fetchOpenWydarzenia();
  }, [fetchOpenWydarzenia]);

  // Akcja "Więcej informacji"
  const handleMoreInfo = (wydarzenieId) => {
    navigate(`/wydarzenia/${wydarzenieId}`); // Przekierowanie do ścieżki szczegółów (zrobimy ją w kolejnym kroku)
  };

  // Obsługa zakupu
  const openZakupForm = async (eventItem) => {
    setZakupLoading(true);
    setStatus({ type: '', message: '' });

    const getRequestConfig = () => {
      const config = { withCredentials: true };
      if (authCredentials.login && authCredentials.password) {
        config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
      }
      return config;
    };

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

    const getRequestConfig = () => {
      const config = { withCredentials: true };
      if (authCredentials.login && authCredentials.password) {
        config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
      }
      return config;
    };

    try {
      await apiClient.post(`/zakupy/wydarzenia/${selectedZakupEvent.id}`, {
        biletId: Number(zakupForm.biletId),
        ilosc: Number(zakupForm.ilosc),
        potwierdzPlatnosc: zakupForm.potwierdzPlatnosc,
        seatId: zakupForm.seatId || null
      }, getRequestConfig());
      setStatus({ type: 'success', message: 'Zakup zakończony pomyślnie.' });
      setZakupFormOpen(false);
      fetchOpenWydarzenia(); // Odśwież postęp biletów
    } catch (error) {
      setStatus({ type: 'error', message: 'Nie udało się zakończyć zakupu.' });
    } finally {
      setZakupLoading(false);
    }
  };

  return (
    <div>
      <h2>Panel główny</h2>
      <p>Witaj w dashboardzie EventFlow! Wybierz zakładkę, aby zarządzać różnymi aspektami aplikacji.</p>
      
      {status.message && <p className={`status-message ${status.type}`}>{status.message}</p>}

      <div className="dashboard-events">
        <h3>Trwające i nadchodzące wydarzenia</h3>
        <div className="events-grid">
          {openWydarzenia.length > 0 ? (
            openWydarzenia.slice(0, 3).map((item) => (
              <WydarzenieCard 
                key={item.id} 
                item={item} 
                currentUserRole={currentUser.rola} 
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