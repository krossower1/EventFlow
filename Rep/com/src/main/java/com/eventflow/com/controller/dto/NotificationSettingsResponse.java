package com.eventflow.com.controller.dto;

public record NotificationSettingsResponse(
	boolean adminLogin,
	boolean newEvent,
	boolean favoriteLogin,
	boolean observedEventEnd,
	boolean observedEventStart,
	boolean observedSeatFreed
) {
}
