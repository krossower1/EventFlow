import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import { apiClient, getAuthHeaders } from '../api/apiClient';

/*
 * =============================================================================
 * ANALITYKA — DANE POD WYKRESY (Recharts)
 * =============================================================================
 * Cała strona korzysta z jednego endpointu: GET /api/analytics/overview.
 *
 * Oś czasu „ostatnie 7 dni” (dziś + 6 dni wstecz) i podział dnia kalendarzowego
 * są liczone na serwerze; pole `metricTimeZone` w odpowiedzi informuje, jakiej
 * strefy użyto przy ustalaniu północy (granicy dnia).
 *
 * - Wykres słupkowy: tablica `registrationsByDay` → każdy element to jeden dzień
 *   i liczba nowych kont (moment rejestracji = `users.data_utw` w bazie).
 * - Wykres pierścieniowy (donut): `eventsByCategory` to pełna lista kategorii
 *   z liczbą aktywnych wydarzeń; na froncie celowo zwężamy widok do TOP 5
 *   kategorii i jednego segmentu „Pozostałe”, żeby legenda i segmenty pozostały czytelne.
 * - W środku donut wyświetlamy `activeEventsTotal` z API (sumaryczna liczba
 *   wydarzeń AKTYWNY w zakresie widoczności użytkownika), a nie sumę segmentów
 *   po redukcji do TOP 5 — liczba w centrum zgadza się z KPI.
 * =============================================================================
 */

/**
 * Zamienia datę `yyyy-MM-dd` z JSON na obiekt `Date` w **lokalnej strefie przeglądarki**
 * używany wyłącznie do formatowania etykiet osi X. Nie zmienia logiki grupowania po stronie serwera.
 */
function parseLocalDate(isoDate) {
  if (!isoDate || typeof isoDate !== 'string') return null;
  const [y, m, d] = isoDate.split('-').map((x) => Number(x));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

/**
 * Buduje podpis osi poziomej wykresu słupkowego: krótki dzień tygodnia (pl) oraz data (dzień.miesiąc.),
 * żeby użytkownik widział zarówno kontekst tygodnia, jak i konkretny dzień przypisany do słupka.
 */
function formatAxisLabel(d) {
  if (!d || Number.isNaN(d.getTime())) return '';
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
  const dayMonth = `${d.getDate()}.${d.getMonth() + 1}.`;
  return `${weekday.replace(/\.$/, '')} ${dayMonth}`;
}

/**
 * Mapuje `registrationsByDay` z API na format Recharts `BarChart`: `label` (oś X) i `rejestracje` (oś Y).
 * Backend zwraca dokładnie 7 wpisów w kolejności chronologicznej (najstarszy → dziś) — musi być zachowana.
 */
function buildBarDataFromApi(registrationsByDay) {
  if (!Array.isArray(registrationsByDay)) return [];
  return registrationsByDay.map((row) => {
    const dt = parseLocalDate(row.date);
    return {
      label: formatAxisLabel(dt),
      rejestracje: Number(row.count) || 0,
    };
  });
}

/**
 * Redukuje listę kategorii do segmentów `PieChart` (donut): sortowanie malejące, TOP 5 osobnych segmentów,
 * pozostałe kategorie sumowane w jeden segment „Pozostałe”. Zwraca `{ name, value }` pod `dataKey="value"`.
 */
function buildTop5Donut(categories, otherLabel) {
  const normalized = (categories || [])
    .map((x) => ({ name: String(x.name ?? '—'), count: Number(x.count) || 0 }))
    .filter((x) => x.count > 0);
  const sorted = [...normalized].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const otherSum = rest.reduce((s, x) => s + x.count, 0);
  const rows = top.map((x) => ({ name: x.name, value: x.count }));
  if (otherSum > 0) {
    rows.push({ name: otherLabel, value: otherSum });
  }
  return { rows };
}

/** Kolory segmentów donut (kolejność po sortowaniu malejącym według liczby wydarzeń). */
const DONUT_COLORS = ['#06b6d4', '#78283e', '#3b82f6', '#22c55e', '#eab308', '#94a3b8'];

/** Wspólny styl Tooltip dla słupka i pierścienia (spójny z motywem ciemnym). */
const tooltipBarStyle = {
  background: 'var(--card-bg)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: 'var(--text-main)',
};

const AnalitykaPage = () => {
  const { t } = useTranslation();
  const { authCredentials } = useContext(AuthContext);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getRequestConfig = useCallback(() => {
    const config = { withCredentials: true };
    if (authCredentials.login && authCredentials.password) {
      config.headers = getAuthHeaders(authCredentials.login, authCredentials.password);
    }
    return config;
  }, [authCredentials]);

  /**
   * Pobiera jednym żądaniem dane pod KPI i oba wykresy. Przy błędzie czyścimy `overview`,
   * żeby nie pokazywać starych liczb obok komunikatu o niepowodzeniu.
   */
  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/analytics/overview', getRequestConfig());
      setOverview(data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.statusText ||
        err?.message ||
        t('analytics.error.load');
      setError(typeof msg === 'string' ? msg : t('analytics.error.load'));
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, [getRequestConfig, t]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  /**
   * Siedem liczb rejestracji w kolejności API — te same wartości co seria słupkowa; indeksy 5 i 6 = wczoraj i dziś (KPI).
   */
  const counts = useMemo(() => {
    const days = overview?.registrationsByDay;
    if (!Array.isArray(days) || days.length === 0) {
      return [0, 0, 0, 0, 0, 0, 0];
    }
    return days.map((d) => Number(d.count) || 0);
  }, [overview]);

  /** Dane wejściowe `BarChart` — powiązane 1:1 z `counts` / `registrationsByDay`. */
  const barData = useMemo(() => buildBarDataFromApi(overview?.registrationsByDay), [overview]);

  const todayCount = counts[6] ?? 0;
  const yesterdayCount = counts[5] ?? 0;
  const sum7 = counts.reduce((a, b) => a + b, 0);

  const activeEventsTotal = overview != null ? Number(overview.activeEventsTotal) || 0 : 0;

  /**
   * Segmenty donut; środek pierścienia pokazuje `activeEventsTotal` (spójnie z KPI), nie sumę widocznych segmentów po TOP 5.
   */
  const { rows: pieRows } = useMemo(
    () => buildTop5Donut(overview?.eventsByCategory, t('analytics.charts.donut.other')),
    [overview, t]
  );

  const metricZone = overview?.metricTimeZone;

  return (
    <div className="analityka-page">
      <h2>
        {t('analytics.page.title')}{' '}
        <img src="/icons/chart.png" alt="" width={32} height={32} style={{ marginBottom: '10px' }} />
      </h2>

      <p className="analityka-lead">
        {t('analytics.page.lead')}
        {metricZone ? (
          <>
            {' '}
            <strong>{t('analytics.page.calendarDaysStrong')}</strong> {t('analytics.page.serverZonePrefix')} {metricZone}.
          </>
        ) : null}
      </p>

      {error ? <p className="status-message status-error">{error}</p> : null}
      {loading ? <p className="analityka-status-muted">{t('analytics.status.loading')}</p> : null}

      {/*
        KPI: te same źródła co wykresy — rejestracje z `counts`, wydarzenia z `activeEventsTotal` (API).
      */}
      <div className="analityka-kpi-grid">
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">{t('analytics.kpi.today.title')}</span>
            <img src="/icons/add.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">+{todayCount}</span>
          <span className="analityka-kpi-hint">{t('analytics.kpi.usersHint')}</span>
        </div>
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">{t('analytics.kpi.yesterday.title')}</span>
            <img src="/icons/add.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">+{yesterdayCount}</span>
          <span className="analityka-kpi-hint">{t('analytics.kpi.usersHint')}</span>
        </div>
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">{t('analytics.kpi.last7Days.title')}</span>
            <img src="/icons/people.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">+{sum7}</span>
          <span className="analityka-kpi-hint">{t('analytics.kpi.last7Days.hint')}</span>
        </div>
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">{t('analytics.kpi.totalEvents.title')}</span>
            <img src="/icons/calendar.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">{activeEventsTotal}</span>
          <span className="analityka-kpi-hint">{t('analytics.kpi.totalEvents.hint')}</span>
        </div>
      </div>

      {/*
        Wykresy: siatka z `align-items: stretch` — równe wysokości kart; wewnątrz flex + `ResponsiveContainer` height 100%.
      */}
      <div className="analityka-charts-grid">
        <section className="analityka-chart-card" aria-labelledby="analityka-bar-title">
          <h3 className="header-accent" id="analityka-bar-title">
            {t('analytics.charts.bar.title')}
          </h3>
          <p className="analityka-chart-sub">{t('analytics.charts.bar.subtitle')}</p>
          <div className="analityka-chart-body">
            <div className="analityka-recharts-fill">
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {/*
                    BarChart: oś X = `label`, oś Y = `rejestracje`. Każdy rekord = jeden dzień z API.
                  */}
                  <BarChart data={barData} margin={{ top: 12, right: 12, left: -8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                      interval={0}
                      height={56}
                      tickMargin={8}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                      width={36}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }}
                      contentStyle={tooltipBarStyle}
                      formatter={(value) => [`${value}`, t('analytics.charts.bar.tooltipUsers')]}
                      labelFormatter={(label) => label}
                    />
                    <Bar
                      dataKey="rejestracje"
                      fill="#06b6d4"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                      name={t('analytics.charts.bar.seriesName')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="analityka-empty-chart">
                  {loading ? t('analytics.status.ellipsis') : t('analytics.charts.bar.empty')}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="analityka-chart-card" aria-labelledby="analityka-donut-title">
          <h3 className="header-accent" id="analityka-donut-title">
            {t('analytics.charts.donut.title')}
          </h3>
          <p className="analityka-chart-sub">{t('analytics.charts.donut.subtitle')}</p>
          <div className="analityka-donut-wrap">
            <div className="analityka-recharts-fill">
              {pieRows.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    {/*
                      Donut: `innerRadius` > 0. Środek to warstwa HTML (`.analityka-donut-center`), nie Label z Recharts.
                    */}
                    <Pie
                      data={pieRows}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={74}
                      outerRadius={112}
                      paddingAngle={2}
                    >
                      {pieRows.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                          stroke="rgba(0,0,0,0.25)"
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipBarStyle} formatter={(value) => [`${value}`, t('analytics.charts.donut.tooltipEvents')]} />
                    <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="analityka-empty-chart">
                  {loading
                    ? t('analytics.status.ellipsis')
                    : t('analytics.charts.donut.empty')}
                </div>
              )}
            </div>
            {/*
              Liczba w środku = `activeEventsTotal` z API (zgodność z KPI), nie suma segmentów po TOP 5.
            */}
            <div className="analityka-donut-center">
              <span className="analityka-donut-center-label">{t('analytics.charts.donut.centerLabel')}</span>
              <span className="analityka-donut-center-value">{activeEventsTotal}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalitykaPage;
