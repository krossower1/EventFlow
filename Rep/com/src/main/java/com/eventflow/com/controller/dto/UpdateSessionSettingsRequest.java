package com.eventflow.com.controller.dto;

public record UpdateSessionSettingsRequest(
	Boolean enabled,
	Integer durationMinutes,
	Integer warningMinutes,
	String expiryAction,
	String countMode
) {
}
