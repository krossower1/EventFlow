package com.eventflow.com.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
	@NotBlank(message = "First name is required")
	String imie,
	@NotBlank(message = "Last name is required")
	String nazwisko,
	@NotBlank(message = "Email is required")
	@Email(message = "Email must be valid")
	String email,
	@NotBlank(message = "Login is required")
	String login,
	@NotBlank(message = "Password is required")
	@Size(min = 6, message = "Password must be at least 6 characters")
	String password
) {
}
