package com.eventflow.com.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record OrganizatorRequestDto(
	@NotBlank(message = "Firma jest wymagana")
	String firma,
	@NotBlank(message = "Kwalifikacje sa wymagane")
	String kwalifikacje,
	@NotBlank(message = "Strona jest wymagana")
	String strona
) {
}
