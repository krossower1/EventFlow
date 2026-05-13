package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

/** Pojedyncza linia audytu zgłoszenia w API GET {@code .../security-tickets/{id}/audit}. */
public record SecurityTicketAuditResponse(
	Long id,
	Long actorUserId,
	String actorLogin,
	String message,
	LocalDateTime createdAt
) {
}
