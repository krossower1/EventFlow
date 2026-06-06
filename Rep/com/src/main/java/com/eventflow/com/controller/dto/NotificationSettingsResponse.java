package com.eventflow.com.controller.dto;

public record NotificationSettingsResponse(
	boolean adminLogin,
	boolean newEvent,
	boolean favoriteLogin,
	boolean observedEventEnd,
	boolean observedEventStart,
	boolean observedSeatFreed,
	boolean newRefundRequest,
	boolean newOrganizerRequest,
	boolean newSecurityReport,
	boolean orgEventJoin,
	boolean orgEventSoldOut,
	boolean orgEventReview,
	boolean orgEventStart,
	boolean orgEventRefund
) {}
