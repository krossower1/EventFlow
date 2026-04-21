package com.eventflow.com.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DostepnyBiletDto(
	Long biletId,
	String klasa,
	BigDecimal cena,
	String waluta,
	Integer dostepnaIlosc,
	LocalDateTime startSprzedazy,
	LocalDateTime koniecSprzedazy
) {
}
