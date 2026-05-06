package com.eventflow.com.auth.dto;

public record TwoFactorSetupResponse(
	boolean success,
	String message,
	String secret,
	String otpAuthUrl
) {
}
