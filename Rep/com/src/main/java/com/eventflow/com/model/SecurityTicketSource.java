package com.eventflow.com.model;

/**
 * Pochodzenie zgłoszenia (kolumna {@code security_tickets.source}).
 * <p>
 * {@link #USER_REPORT} — utworzone przez endpoint zgłoszenia z historii logowań.
 * {@link #SYSTEM_AUTOMATIC} — może występować w starych danych; obecna logika aplikacji nie tworzy takich zgłoszeń.
 */
public enum SecurityTicketSource {
	SYSTEM_AUTOMATIC,
	USER_REPORT
}
