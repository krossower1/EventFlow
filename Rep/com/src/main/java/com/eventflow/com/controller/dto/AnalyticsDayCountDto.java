package com.eventflow.com.controller.dto;

import java.time.LocalDate;

/**
 * Pojedynczy dzień w serii zwracanej pod wykres słupkowy „Rejestracje użytkowników”.
 * <p>
 * Pole {@code date} to dzień kalendarzowy (bez czasu), dla którego policzono {@code count}
 * nowych kont użytkowników — moment rejestracji w bazie to {@code users.data_utw}, a backend
 * grupuje rekordy funkcją SQL {@code DATE(data_utw)}. W odpowiedzi zawsze występuje pełna
 * lista 7 kolejnych dni; jeśli w danym dniu nikt się nie zarejestrował, {@code count} wynosi 0,
 * dzięki czemu wykres ma równomiernie rozłożone słupki bez „dziur” w osi czasu.
 *
 * @param date dzień w oknie analityki (ISO-8601: {@code yyyy-MM-dd})
 * @param count liczba nowych użytkowników zarejestrowanych w tym dniu
 */
public record AnalyticsDayCountDto(
	LocalDate date,
	long count
) {
}
