package com.eventflow.com.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BiletCreateRequestDto(
	String klasa,
	BigDecimal cena,
	String waluta,
	Integer ilosc,
	LocalDateTime startSprzedazy,
	LocalDateTime koniecSprzedazy
) {
}
