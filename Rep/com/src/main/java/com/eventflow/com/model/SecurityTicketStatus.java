package com.eventflow.com.model;

/**
 * Cykl życia zgłoszenia w skrzynce administratora.
 */
public enum SecurityTicketStatus {
	/** Nowe, niepodjęte. */
	NEW,
	/** Ktoś pracuje nad sprawą (często ustawiane razem z przypisaniem). */
	IN_PROGRESS,
	/** Zamknięte pozytywnie. */
	RESOLVED,
	/** Uznane za fałszywy alarm / odrzucone. */
	DISMISSED
}
