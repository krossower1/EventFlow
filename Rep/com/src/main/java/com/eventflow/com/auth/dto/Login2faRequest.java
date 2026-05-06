package com.eventflow.com.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record Login2faRequest(
	@NotBlank(message = "Login is required")
	String login,
	@NotBlank(message = "Password is required")
	String password,
	@NotBlank(message = "2FA code is required")
	String code
) {
}
