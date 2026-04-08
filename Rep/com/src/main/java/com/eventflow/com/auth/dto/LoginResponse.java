package com.eventflow.com.auth.dto;

public record LoginResponse(
	boolean success,
	String message,
	String rola,
	String imie,
	String nazwisko
) {
}
