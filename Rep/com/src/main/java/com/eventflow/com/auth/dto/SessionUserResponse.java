package com.eventflow.com.auth.dto;

public record SessionUserResponse(
	Long id,
	String login,
	String rola,
	String imie,
	String nazwisko,
	String email,
	String telefon
) {
}
