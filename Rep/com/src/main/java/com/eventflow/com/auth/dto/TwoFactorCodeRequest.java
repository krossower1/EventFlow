package com.eventflow.com.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record TwoFactorCodeRequest(
	@NotBlank(message = "2FA code is required")
	String code
) {
}
