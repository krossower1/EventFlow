package com.eventflow.com.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserBiletDto(
	Long id,
	String kod,
	String stan,
	LocalDateTime wydanyData,
	LocalDateTime uzytyData,
	String klasa,
	String wydarzenieTytul,
	BigDecimal cena,
	String waluta,
	Boolean maProsbeZwrotu,
	String stanZwrotu
) {
}
