package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Pojedyncze zgłoszenie bezpieczeństwa — wiersz w tabeli {@code security_tickets}.
 * <p>
 * Typowe źródło z UI: {@link SecurityTicketSource#USER_REPORT} z kategorią
 * {@link SecurityTicketCategory#USER_FLAGGED_LOG} (zgłoszenie wpisu z historii logowań).
 */
@Entity
@Table(name = "security_tickets")
@Data
public class SecurityTicket {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	/** Kto utworzył zgłoszenie; przy raporcie z historii = ten sam co {@link #affectedUser}. */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reporter_user_id")
	private User reporterUser;

	/** Konto, którego dotyczy sprawa (wymagane). */
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "affected_user_id", nullable = false)
	private User affectedUser;

	/** Skąd powstało zgłoszenie (użytkownik vs. stary wpis systemowy w bazie). */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	private SecurityTicketSource source;

	/** Klasyfikacja biznesowa zgłoszenia (wartości zapisywane jako VARCHAR). */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	private SecurityTicketCategory category;

	/** Pełny opis tekstowy (np. zrzut danych z LoginLog + notatka użytkownika). */
	@Column(columnDefinition = "TEXT", nullable = false)
	private String description;

	/** Stan obsługi w skrzynce admina. */
	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 24)
	private SecurityTicketStatus status = SecurityTicketStatus.NEW;

	/** Administrator odpowiedzialny za sprawę (opcjonalnie). */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assigned_admin_id")
	private User assignedAdmin;

	/** Odsyłacz do {@code login_logs.id}, jeśli zgłoszenie pochodzi z historii logowań. */
	@Column(name = "related_login_log_id")
	private Long relatedLoginLogId;

	/**
	 * Flaga: czy wysłano już opcjonalny e-mail alertowy ({@code app.security.alerts-email})
	 * dla tego zgłoszenia — żeby nie wysyłać duplikatów przy ponownym zapisie.
	 */
	@Column(name = "critical_alert_email_sent", nullable = false)
	private boolean criticalAlertEmailSent;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt = LocalDateTime.now();
}
