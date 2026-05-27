package com.eventflow.com.controller.dto;

public record UpdateNotificationSettingsRequest(
	Boolean adminLogin,
	Boolean newEvent,
	Boolean favoriteLogin,
	Boolean observedEventEnd,
	Boolean observedEventStart,
	Boolean observedSeatFreed,
	Boolean newRefundRequest,
	Boolean newOrganizerRequest,
	Boolean newSecurityReport
) {
}
