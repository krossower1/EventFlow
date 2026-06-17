package com.eventflow.com.controller.dto;

public record BiletPostepDto(
	Long biletId,
	String klasa,
	String kategoriaBiletu,
	Integer sprzedane,
	Integer wszystkie,
	String startSprzedazy,
	String koniecSprzedazy
) {
}
