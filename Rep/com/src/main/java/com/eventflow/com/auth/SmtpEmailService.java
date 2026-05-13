package com.eventflow.com.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailService implements EmailService {

	private final JavaMailSender mailSender;
	private final String fromAddress;
	private final String securityAlertsRecipient;

	public SmtpEmailService(
		JavaMailSender mailSender,
		@Value("${app.mail.from}") String fromAddress,
		@Value("${app.security.alerts-email:}") String securityAlertsRecipient
	) {
		this.mailSender = mailSender;
		this.fromAddress = fromAddress;
		this.securityAlertsRecipient = securityAlertsRecipient;
	}

	@Override
	public void sendVerificationCode(String recipientEmail, String verificationCode) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(fromAddress);
		message.setTo(recipientEmail);
		message.setSubject("EventFlow - kod weryfikacyjny");
		message.setText(buildBody(verificationCode));

		try {
			mailSender.send(message);
		} catch (MailException exception) {
			throw new IllegalStateException("Nie udalo sie wyslac maila weryfikacyjnego", exception);
		}
	}

	private String buildBody(String verificationCode) {
		return """
			Witaj,

			Twoj kod weryfikacyjny do EventFlow to: %s

			Kod jest wazny przez 15 minut.
			""".formatted(verificationCode);
	}

	/**
	 * Wysyłka alertu skrzynki zgłoszeń: odbiorca tylko z konfiguracji {@code app.security.alerts-email}.
	 * Pusty recipient — metoda kończy się cicho (bez wyjątku), żeby środowiska dev działały bez skrzynki alertowej.
	 * Przy błędzie SMTP rzuca wyjątek — wywołujący ({@link com.eventflow.com.service.SecurityTicketService}) łapie go przy zapisie zgłoszenia.
	 */
	@Override
	public void sendSecurityInboxAlert(String subject, String body) {
		String recipient = securityAlertsRecipient;
		if (recipient == null || recipient.isBlank()) {
			return;
		}
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(fromAddress);
		message.setTo(recipient);
		message.setSubject(subject);
		message.setText(body);
		try {
			mailSender.send(message);
		} catch (MailException exception) {
			throw new IllegalStateException("Nie udalo sie wyslac alertu bezpieczenstwa", exception);
		}
	}

	@Override
	public void sendForcedPasswordResetNotice(String recipientEmail, String temporaryPassword) {
		if (recipientEmail == null || recipientEmail.isBlank()) {
			return;
		}
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(fromAddress);
		message.setTo(recipientEmail);
		message.setSubject("EventFlow — wymuszona zmiana hasła");
		message.setText("""
			Witaj,

			Zespół administracyjny wymusił reset hasła ze względów bezpieczeństwa.

			Tymczasowe hasło do konta: %s

			Zaloguj się i od razu zmień hasło w Ustawienia → Bezpieczeństwo → Zmiana hasła.

			Jeśli to nie Ty, natychmiast skontaktuj się z administratorem systemu.
			""".formatted(temporaryPassword));
		try {
			mailSender.send(message);
		} catch (MailException exception) {
			throw new IllegalStateException("Nie udalo sie wyslac maila z tymczasowym haslem", exception);
		}
	}
}
