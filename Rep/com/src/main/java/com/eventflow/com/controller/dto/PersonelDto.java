package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record PersonelDto(
	Long id,
	Long userId,
	String userLogin,
	String userImie,
	String userNazwisko,
	String rola,
	LocalDateTime dataZajet
) {
}
