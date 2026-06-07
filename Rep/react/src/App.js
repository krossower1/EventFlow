import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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
import AdminPanelPage from './pages/AdminPanelPage.jsx';
import AnalitykaPage from './pages/AnalitykaPage';

// Moduł sterujący dostępem
const AppRoutes = () => {
  const { t } = useTranslation();
  const { isLoggedIn, sessionLoading } = useContext(AuthContext);

  if (sessionLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1>
            <img src="/icons/image(1).ico" alt="EventFlow Icon" className="logo-icon" />
            EventFlow
          </h1>
          <p>{t('app.sessionLoading')}</p>
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
        <Route path="analityka" element={<AnalitykaPage />} />
        <Route path="uczestnicy" element={<UsersPage />} />
        <Route path="ustawienia" element={<UstawieniaPage />} />
        <Route path="admin" element={<AdminPanelPage />} />
        <Route path="admin/security-inbox" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<div style={{padding: '20px'}}>{t('app.notFound')}</div>} />
      </Route>
    </Routes>
  );
};

// Główny punkt startowy aplikacji z wstrzykniętymi providerami
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
