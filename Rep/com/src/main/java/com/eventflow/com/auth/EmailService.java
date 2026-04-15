package com.eventflow.com.auth;

public interface EmailService {
	void sendVerificationCode(String recipientEmail, String verificationCode);
}
