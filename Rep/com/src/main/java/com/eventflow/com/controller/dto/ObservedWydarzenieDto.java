package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

/**
 * Wiersz listy „Obserwowane” w ustawieniach — dane wydarzenia wzbogacone o datę dodania do obserwowanych.
 */
public record ObservedWydarzenieDto(
	/** Identyfikator wydarzenia. */
	Long id,
	String tytul,
	String status,
	String salaNazwa,
	String kategoriaNazwa,
	LocalDateTime dataRozp,
	/** {@link com.eventflow.com.model.UserObservedEvent#getCreatedAt()} — kiedy użytkownik kliknął „obserwuj”. */
	LocalDateTime observedAt
) {
}
