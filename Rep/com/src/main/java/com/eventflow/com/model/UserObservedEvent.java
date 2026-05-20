package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Powiązanie użytkownika (rola USER) z wydarzeniem, które obserwuje.
 * Para {@code user_id} + {@code wydarzenie_id} jest unikalna — ten sam wpis nie może powstać dwukrotnie.
 */
@Entity
@Table(
	name = "user_observed_events",
	uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "wydarzenie_id" })
)
@Data
public class UserObservedEvent {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "wydarzenie_id", nullable = false)
	private Long wydarzenieId;

	/** Moment dodania do obserwowanych (używany przy sortowaniu listy w ustawieniach). */
	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	/** Wysłano przypomnienie o zbliżającym się starcie (scheduler). */
	@Column(name = "start_reminder_sent_at")
	private LocalDateTime startReminderSentAt;
}
