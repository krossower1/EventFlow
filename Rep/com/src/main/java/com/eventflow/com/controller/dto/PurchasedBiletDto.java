package com.eventflow.com.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchasedBiletDto(
	Long id,
	String imie,
	String nazwisko,
	Long wydarzenieId,
	String wydarzenieTytul,
	String klasa,
	BigDecimal cena,
	String waluta,
	String kod,
	String stan,
	LocalDateTime wydanyData,
	String qrCode
) {
}
