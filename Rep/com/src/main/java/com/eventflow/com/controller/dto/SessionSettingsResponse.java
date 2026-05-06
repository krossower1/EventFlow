package com.eventflow.com.controller.dto;

public record SessionSettingsResponse(
	Boolean enabled,
	Integer durationMinutes,
	Integer warningMinutes,
	String expiryAction,
	String countMode
) {
}
