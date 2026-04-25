package com.eventflow.com.controller.dto;

public record BiletPostepDto(
	Long biletId,
	String klasa,
	Integer sprzedane,
	Integer wszystkie
) {
}
