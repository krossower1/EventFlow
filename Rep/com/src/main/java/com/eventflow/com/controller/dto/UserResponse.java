package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record UserResponse(
	Long id,
	String imie,
	String nazwisko,
	String email,
	String login,
	String rola,
	Boolean aktywnosc,
	LocalDateTime dataUtw,
	String platnosc,
	String haslo,
	String salt
) {
}
