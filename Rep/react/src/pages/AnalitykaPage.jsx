import React, { useMemo } from 'react';
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

/** Ostatnie 7 dni: dziś + 6 dni wstecz, od najstarszej do najnowszej (indeks 6 = dziś). */
function buildLast7DayRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    days.push(d);
  }
  return days;
}

function formatAxisLabel(d) {
  const weekday = new Intl.DateTimeFormat('pl-PL', { weekday: 'short' }).format(d);
  const dayMonth = `${d.getDate()}.${d.getMonth() + 1}.`;
  return `${weekday.replace(/\.$/, '')} ${dayMonth}`;
}

function buildBarData(dates, countsPerDay) {
  return dates.map((date, i) => ({
    label: formatAxisLabel(date),
    rejestracje: countsPerDay[i] ?? 0,
  }));
}

/** Top 5 kategorii + suma reszty jako „Pozostałe”. */
function buildTop5Donut(categories) {
  const sorted = [...categories].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, 5);
  const rest = sorted.slice(5);
  const otherSum = rest.reduce((s, x) => s + x.count, 0);
  const rows = top.map((x) => ({ name: x.name, value: x.count }));
  if (otherSum > 0) {
    rows.push({ name: 'Pozostałe', value: otherSum });
  }
  const total = rows.reduce((s, x) => s + x.value, 0);
  return { rows, total };
}

const DONUT_COLORS = ['#06b6d4', '#78283e', '#3b82f6', '#22c55e', '#eab308', '#94a3b8'];

// --- Dane demonstracyjne (zastąp odpowiedzią z API) ---
const MOCK_DAILY_NEW_USERS = [3, 5, 2, 8, 12, 7, 5];
const MOCK_CATEGORY_COUNTS = [
  { name: 'Koncerty', count: 34 },
  { name: 'Stand-up', count: 28 },
  { name: 'Sport', count: 22 },
  { name: 'Targi', count: 18 },
  { name: 'Warsztaty', count: 15 },
  { name: 'Kino', count: 12 },
  { name: 'Teatr', count: 9 },
  { name: 'Gaming', count: 6 },
  { name: 'Inne', count: 4 },
];

const tooltipBarStyle = {
  background: 'var(--card-bg)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: 'var(--text-main)',
};

const AnalitykaPage = () => {
  const dates = useMemo(() => buildLast7DayRange(), []);
  const counts = MOCK_DAILY_NEW_USERS;

  const barData = useMemo(() => buildBarData(dates, counts), [dates, counts]);
  const todayCount = counts[6];
  const yesterdayCount = counts[5];
  const sum7 = counts.reduce((a, b) => a + b, 0);

  const { rows: pieRows, total: activeEventsFromCategories } = useMemo(
    () => buildTop5Donut(MOCK_CATEGORY_COUNTS),
    []
  );

  return (
    <div className="analityka-page">
      <h2>Sprawdź, co słychać w liczbach!       <img src="/icons/chart.png" alt="" width={32} height={32} style={{marginBottom: '10px'}}/>
      </h2>

      <p className="analityka-lead">
      Zobacz, ile nowych osób dołączyło do nas w tym tygodniu i jakie wydarzenia rządzą na platformie. Kilka prostych wykresów, które pomogą Ci ogarnąć, co aktualnie najbardziej popularne i co przyciąga ludzi.
      </p>

      <div className="analityka-kpi-grid">
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">DZISIAJ</span>
            <img src="/icons/add.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">+{todayCount}</span>
          <span className="analityka-kpi-hint">nowi użytkownicy</span>
        </div>
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">WCZORAJ</span>
            <img src="/icons/add.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">+{yesterdayCount}</span>
          <span className="analityka-kpi-hint">nowi użytkownicy</span>
        </div>
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">OSTATNIE 7 DNI</span>
            <img src="/icons/people.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">+{sum7}</span>
          <span className="analityka-kpi-hint">nowi użytkownicy (suma słupków)</span>
        </div>
        <div className="analityka-kpi-card">
          <div className="analityka-kpi-header">
            <span className="header-accent">ŁĄCZNIE WYDARZEŃ</span>
            <img src="/icons/calendar.png" alt="" className="analityka-kpi-header-icon" width={28} height={28} />
          </div>
          <span className="analityka-kpi-value">{activeEventsFromCategories}</span>
          <span className="analityka-kpi-hint">aktywne (suma kategorii, demo)</span>
        </div>
      </div>

      <div className="analityka-charts-grid">
        <section className="analityka-chart-card" aria-labelledby="analityka-bar-title">
          <h3 className="header-accent">REJESTRACJE UŻYTKOWNIKÓW</h3>
          <p className="analityka-chart-sub">Ostatnie 7 dni liczone od dzisiaj.</p>
          <div className="analityka-chart-body">
            <div className="analityka-recharts-fill">
              <ResponsiveContainer width="100%" height="100%">
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
                    formatter={(value) => [`${value}`, 'Nowi użytkownicy']}
                    labelFormatter={(label) => label}
                  />
                  <Bar dataKey="rejestracje" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={48} name="Rejestracje" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="analityka-chart-card" aria-labelledby="analityka-donut-title">
          <h3 className="header-accent">KATEGORIE WYDARZEŃ</h3>
          <p className="analityka-chart-sub">Top 5 najpopularniejszych kategorii.</p>
          <div className="analityka-donut-wrap">
            <div className="analityka-recharts-fill">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
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
                      <Cell key={entry.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="rgba(0,0,0,0.25)" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipBarStyle} formatter={(value) => [`${value}`, 'Wydarzenia']} />
                  <Legend wrapperStyle={{ color: 'var(--text-muted)', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="analityka-donut-center">
              <span className="analityka-donut-center-label">Wszystkich</span>
              <span className="analityka-donut-center-value">{activeEventsFromCategories}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalitykaPage;
