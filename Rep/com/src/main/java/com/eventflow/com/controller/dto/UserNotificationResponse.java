package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record UserNotificationResponse(
	Long id,
	String type,
	String message,
	LocalDateTime createdAt,
	boolean read
) {
}
