package com.eventflow.com.controller.dto;

import jakarta.validation.constraints.NotNull;

public record MiejsceIloscSalUpdateRequestDto(
	@NotNull Integer nowaIloscSal,
	@NotNull Boolean potwierdzenie
) {
}
