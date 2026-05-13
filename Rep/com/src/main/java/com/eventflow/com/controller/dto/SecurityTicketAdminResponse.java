package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

/**
 * Widok zgłoszenia zwracany do panelu admina (lista, szczegóły po akcji).
 * <p>
 * Pola {@code source} i {@code category} to nazwy enumów (String), żeby front nie zależał od kolejności ordinal.
 * {@code affectedUserActive}: {@code false} gdy konto ofiary ma {@code aktywnosc = false} (brak logowania).
 */
public record SecurityTicketAdminResponse(
	Long id,
	Long reporterUserId,
	String reporterLogin,
	Long affectedUserId,
	String affectedLogin,
	boolean affectedUserActive,
	String source,
	String category,
	String description,
	String status,
	Long assignedAdminId,
	String assignedAdminLogin,
	Long relatedLoginLogId,
	LocalDateTime createdAt,
	LocalDateTime updatedAt
) {
}
