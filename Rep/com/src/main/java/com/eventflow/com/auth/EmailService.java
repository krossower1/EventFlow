package com.eventflow.com.auth;

public interface EmailService {
	void sendVerificationCode(String recipientEmail, String verificationCode);

	/**
	 * Opcjonalny alert na adres z {@code app.security.alerts-email} (pusty = brak wysyłki).
	 * Używane przy nowych „krytycznych” zgłoszeniach bezpieczeństwa — patrz {@link com.eventflow.com.service.SecurityTicketService}.
	 */
	void sendSecurityInboxAlert(String subject, String body);

	void sendForcedPasswordResetNotice(String recipientEmail, String temporaryPassword);
}
