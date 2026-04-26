package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record ZgloszenieDto(
	Long id,
	Long userId,
	String userLogin,
	String tytul,
	String opis,
	String stan,
	LocalDateTime utworzony,
	LocalDateTime zamkniety
) {
}
