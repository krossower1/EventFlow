import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import './App.css';

// Importy komponentów szkieletu
import MainLayout from './components/layout/MainLayout';
import AuthPage from './pages/AuthPage';

// Importy poszczególnych zakładek (stron)
import Dashboard from './pages/Dashboard';
import BiletyPage from './pages/BiletyPage';
import WydarzeniaPage from './pages/WydarzeniaPage';
import MiejscaPage from './pages/MiejscaPage';
import EventDetailPage from './pages/EventDetailPage';
import UsersPage from './pages/UsersPage';
import UstawieniaPage from './pages/UstawieniaPage';

// Moduł sterujący dostępem
const AppRoutes = () => {
  const { isLoggedIn, sessionLoading } = useContext(AuthContext);

  if (sessionLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>
            <img src="/image(1).ico" alt="EventFlow Icon" className="logo-icon" />
            EventFlow
          </h1>
          <p>Sprawdzanie aktywnej sesji...</p>
        </div>
      </div>
    );
  }

  // Niezalogowany zawsze trafia na ekran logowania
  if (!isLoggedIn) {
    return <AuthPage />;
  }

  // Zalogowany ma dostęp do szkieletu aplikacji i podstron
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Przekierowanie głównego adresu na zakładkę /dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Gotowe zakładki */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bilety" element={<BiletyPage />} />
        <Route path="wydarzenia" element={<WydarzeniaPage />} />
        <Route path="wydarzenia/:id" element={<EventDetailPage />} />
        <Route path="miejsca" element={<MiejscaPage />} />
        <Route path="uczestnicy" element={<UsersPage />} />
        <Route path="ustawienia" element={<UstawieniaPage />} />
        {/* Zakładki, które zrobimy w następnych krokach (Miejsca, Wydarzenia) */}
        <Route path="*" element={<div style={{padding: '20px'}}>W budowie. Przejdź do Panelu Głównego.</div>} />
      </Route>
    </Routes>
  );
};

// Główny punkt startowy aplikacji z wstrzykniętymi providerami
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;