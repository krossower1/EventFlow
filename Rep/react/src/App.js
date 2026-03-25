import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Port 8081 zgodnie z Twoim działającym backendem
    axios.get('http://localhost:8081/api/users')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Błąd:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <h2 style={{ padding: '20px' }}>Ładowanie danych z bazy MySQL...</h2>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Dane z tabeli users w bazie MySQL(EventFlow)</h1>
      
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ backgroundColor: '#eee' }}>
            <th>ID</th>
            <th>Imię i Nazwisko</th>
            <th>Email</th>
            <th>Login / Username</th>
            <th>Rola</th>
            <th>Status</th>
            <th>Data Utworzenia</th>
            <th>Płatność</th>
            <th>Szczegóły Bezpieczeństwa</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.imie || '-'} {user.nazwisko || '-'}</td>
              <td>{user.email}</td>
              <td>
                <strong>{user.username}</strong><br/>
                <small>({user.login})</small>
              </td>
              <td>{user.rola}</td>
              <td>{user.aktywnosc ? "✅ Aktywny" : "❌ Nieaktywny"}</td>
              <td>{user.dataUtw ? new Date(user.dataUtw).toLocaleString() : '-'}</td>
              <td>{user.platnosc || 'Brak'}</td>
              <td>
                <details>
                  <summary>Pokaż Hash/Salt</summary>
                  <div style={{ wordBreak: 'break-all', fontSize: '10px' }}>
                    <strong>Hash:</strong> {user.passwordHash || user.password_hash}<br/>
                    <strong>Salt:</strong> {user.salt}
                  </div>
                </details>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="9">Brak użytkowników w bazie danych.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;