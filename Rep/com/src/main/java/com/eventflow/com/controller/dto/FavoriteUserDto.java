package com.eventflow.com.controller.dto;

public record FavoriteUserDto(
	Long id,
	String login,
	String imie,
	String nazwisko,
	String email,
	String rola
) {
}
