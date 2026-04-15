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

	public SmtpEmailService(
		JavaMailSender mailSender,
		@Value("${app.mail.from}") String fromAddress
	) {
		this.mailSender = mailSender;
		this.fromAddress = fromAddress;
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
}
