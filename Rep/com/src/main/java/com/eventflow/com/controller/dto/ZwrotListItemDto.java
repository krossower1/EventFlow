package com.eventflow.com.controller.dto;

import java.math.BigDecimal;

public record ZwrotListItemDto(
	Long id,
	Long platnId,
	String userLogin,
	String wydarzenieTytul,
	String klasa,
	BigDecimal kwota,
	String waluta,
	String powod,
	String stan,
	Boolean otrzymany,
	Boolean przyznany
) {
}
