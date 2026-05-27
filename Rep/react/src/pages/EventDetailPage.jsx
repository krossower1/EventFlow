import React from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EventDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  return (
    <div>
      <h2>{t('eventDetail.title')}</h2>
      <p>{t('eventDetail.subtitle', { id })}</p>
      {/* Tutaj będzie logika pobierania i wyświetlania szczegółów wydarzenia */}
    </div>
  );
};

export default EventDetailPage;