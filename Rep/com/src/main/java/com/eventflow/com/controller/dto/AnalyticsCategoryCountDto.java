package com.eventflow.com.controller.dto;

/**
 * Jedna kategoria w rozkładzie liczby <b>aktywnych</b> wydarzeń (status {@code AKTYWNY} w tabeli
 * {@code wydarzenia}), połączona z nazwą z tabeli {@code kategorie}.
 * <p>
 * Lista takich rekordów trafia na front jako {@code eventsByCategory} i jest tam opcjonalnie
 * zwężana do pięciu największych segmentów plus syntetycznego segmentu „Pozostałe”, sumującego
 * wszystkie mniejsze kategorie — to wyłącznie decyzja prezentacyjna, by wykres pierścieniowy
 * (donut) i legenda pozostały czytelne przy dużej liczbie etykiet w systemie.
 *
 * @param name wartość kolumny {@code kategorie.nazwa} (etykieta segmentu wykresu)
 * @param count liczba wydarzeń {@code AKTYWNY} przypisanych do tej kategorii w aktualnym zakresie ({@code org_id} lub cała platforma)
 */
public record AnalyticsCategoryCountDto(
	String name,
	long count
) {
}
