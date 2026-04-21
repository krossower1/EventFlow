package com.eventflow.com.controller.dto;

public record ZakupBiletuRequestDto(
	Long biletId,
	Integer ilosc,
	Boolean potwierdzPlatnosc
) {
}
