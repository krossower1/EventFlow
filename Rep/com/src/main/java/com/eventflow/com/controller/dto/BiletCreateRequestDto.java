package com.eventflow.com.controller.dto;

import java.math.BigDecimal;
import java.util.List;

public record BiletCreateRequestDto(
	String klasa,
	BigDecimal cena,
	String waluta,
	Integer ilosc,
	String startSprzedazy,
	String koniecSprzedazy,
	List<String> seatIds,
	String kategoriaBiletu
) {
}
