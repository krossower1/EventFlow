package com.eventflow.com.controller.dto;

public record SalaOptionDto(
	Long id,
	String nazwa,
	String miejsceNazwa,
	Boolean maPlan,
	String planJson
) {
}
