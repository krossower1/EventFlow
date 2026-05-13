package com.eventflow.com.controller.dto;

import java.util.List;

/**
 * Komplet danych zwracany jednym żądaniem HTTP pod stronę z wykresami (Recharts) w zakładce Analityka.
 * <p>
 * Front wykorzystuje pola w następujący sposób:
 * <ul>
 *   <li>{@code registrationsByDay} — seria punktów na wykres słupkowy: oś X = dzień, oś Y = liczba
 *       nowych kont utworzonych tego dnia (źródło w bazie: {@code users.data_utw}).</li>
 *   <li>{@code activeEventsTotal} — liczba wszystkich wydarzeń w statusie {@code AKTYWNY} w widoczności
 *       użytkownika (globalnie lub po {@code org_id}); wyświetlana w KPI oraz w środku wykresu donut,
 *       aby była spójna z licznikiem nawet po scaleniu mniejszych kategorii na froncie w segment „Pozostałe”.</li>
 *   <li>{@code eventsByCategory} — pełna lista par (nazwa kategorii, liczba wydarzeń) przed redukcją do TOP 5;
 *       redukcja odbywa się w React dla czytelności pierścienia.</li>
 *   <li>{@code metricTimeZone} — identyfikator strefy (np. {@code Europe/Warsaw}), w której backend
 *       ustalił północ i granice kolejnych „dni” dla okna 7-dniowego.</li>
 * </ul>
 *
 * @param registrationsByDay Dokładnie 7 elementów od (dziś − 6) do dziś włącznie — seria pod wykres słupkowy.
 * @param activeEventsTotal Liczba wydarzeń {@code AKTYWNY} (globalnie lub tylko organizatora — patrz serwis).
 * @param eventsByCategory Surowa lista kategorii pod wykres pierścieniowy (front: TOP 5 + „Pozostałe”).
 * @param metricTimeZone Strefa użyta przy liczeniu granic dnia kalendarzowego na serwerze.
 */
public record AnalyticsOverviewResponse(
	List<AnalyticsDayCountDto> registrationsByDay,
	long activeEventsTotal,
	List<AnalyticsCategoryCountDto> eventsByCategory,
	String metricTimeZone
) {
}
