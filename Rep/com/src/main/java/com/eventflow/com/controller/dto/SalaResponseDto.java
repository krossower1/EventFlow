package com.eventflow.com.controller.dto;

public record SalaResponseDto(
	Long id,
	Long miejsceId,
	String nazwa,
	Integer pojemnosc,
	Integer pietro,
	Boolean maPlan
) {
}
