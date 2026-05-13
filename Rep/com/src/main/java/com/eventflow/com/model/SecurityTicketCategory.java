package com.eventflow.com.model;

/**
 * Kategoria zgłoszenia (kolumna {@code security_tickets.category}, zapis jako nazwa enumu).
 * <p>
 * {@link #USER_FLAGGED_LOG} — standardowe zgłoszenie z historii logowań przez użytkownika.
 * {@link #OTHER} — rezerwa na przyszłe typy ręcznie tworzone z panelu lub import.
 */
public enum SecurityTicketCategory {
	USER_FLAGGED_LOG,
	OTHER
}
