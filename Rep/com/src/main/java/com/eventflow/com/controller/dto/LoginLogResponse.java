package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

// Payload API dla sekcji "Historia logowań" widocznej w ustawieniach użytkownika.
public record LoginLogResponse(
	Long id,
	LocalDateTime loginTime,
	String location,
	String deviceInfo,
	String status
) {
}
