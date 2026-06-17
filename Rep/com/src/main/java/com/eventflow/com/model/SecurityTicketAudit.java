package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

/**
 * Jedna linia dziennika audytu dla zgłoszenia — tabela {@code security_ticket_audits}.
 * <p>
 * Każda istotna akcja admina (status, przypisanie, szybkie akcje, utworzenie zgłoszenia)
 * powinna generować czytelny wpis {@link #message}.
 */
@Entity
@Table(name = "security_ticket_audits")
@Data
public class SecurityTicketAudit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "ticket_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private SecurityTicket ticket;

	/** Kto wykonał akcję; może być {@code null} dla zdarzeń „systemowych” w przyszłości. */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "actor_user_id")
	private User actorUser;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String message;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();
}
