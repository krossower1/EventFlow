package com.eventflow.com.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SalaRequestDto(
	@NotBlank String nazwa,
	@NotNull Integer pojemnosc,
	@NotNull Integer pietro,
	@NotNull Boolean maPlan
) {
}
