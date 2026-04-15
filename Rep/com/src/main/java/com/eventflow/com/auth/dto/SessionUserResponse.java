package com.eventflow.com.auth.dto;

public record SessionUserResponse(
	String login,
	String rola,
	String imie,
	String nazwisko
) {
}
