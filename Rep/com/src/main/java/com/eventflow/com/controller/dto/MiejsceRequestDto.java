package com.eventflow.com.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MiejsceRequestDto(
	@NotBlank String nazwa,
	String panstwo,
	@NotBlank String miasto,
	@NotBlank String ulica,
	@NotBlank String kodPoczt,
	@NotNull Integer pojemnosc,
	String opis
) {
}
