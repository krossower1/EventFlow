import React from 'react';
import { useParams } from 'react-router-dom';

const EventDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Szczegóły Wydarzenia</h2>
      <p>Wyświetlanie szczegółów wydarzenia o ID: {id}</p>
      {/* Tutaj będzie logika pobierania i wyświetlania szczegółów wydarzenia */}
    </div>
  );
};

export default EventDetailPage;