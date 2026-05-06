package com.eventflow.com.auth;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

@Service
public class TotpService {

	private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
	private static final int SECRET_LENGTH = 32;
	private static final int TIME_STEP_SECONDS = 30;
	private static final int CODE_DIGITS = 6;
	private static final int ALLOWED_DRIFT_STEPS = 2;

	private final SecureRandom secureRandom = new SecureRandom();

	/**
	 * Tworzy losowy sekret Base32 używany przez aplikacje TOTP.
	 * Sekret jest później osadzany w URI otpauth i skanowany jako QR.
	 */
	public String generateSecret() {
		StringBuilder builder = new StringBuilder(SECRET_LENGTH);
		for (int i = 0; i < SECRET_LENGTH; i++) {
			builder.append(BASE32_ALPHABET.charAt(secureRandom.nextInt(BASE32_ALPHABET.length())));
		}
		return builder.toString();
	}

	/**
	 * Weryfikuje kod TOTP użytkownika względem podanego sekretu.
	 * Dopuszcza niewielkie przesunięcie czasu między telefonem a serwerem.
	 */
	public boolean isValidCode(String base32Secret, String code) {
		if (base32Secret == null || base32Secret.isBlank() || code == null) {
			return false;
		}
		String normalizedCode = code.trim();
		if (!normalizedCode.matches("\\d{6}")) {
			return false;
		}

		long currentCounter = (System.currentTimeMillis() / 1000L) / TIME_STEP_SECONDS;
		for (int drift = -ALLOWED_DRIFT_STEPS; drift <= ALLOWED_DRIFT_STEPS; drift++) {
			String generated = generateTotp(base32Secret, currentCounter + drift);
			if (normalizedCode.equals(generated)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Buduje standardowy URI otpauth://totp/... rozpoznawany przez
	 * Google Authenticator, Microsoft Authenticator i podobne aplikacje.
	 */
	public String buildOtpAuthUrl(String issuer, String accountName, String secret) {
		String encodedIssuer = urlEncode(issuer);
		String encodedAccount = urlEncode(accountName);
		return "otpauth://totp/" + encodedIssuer + ":" + encodedAccount
			+ "?secret=" + secret
			+ "&issuer=" + encodedIssuer
			+ "&algorithm=SHA1&digits=6&period=30";
	}

	// Generuje 6-cyfrowy kod TOTP dla konkretnego "kroku czasu".
	private String generateTotp(String base32Secret, long counter) {
		try {
			byte[] key = decodeBase32(base32Secret);
			byte[] counterBytes = new byte[8];
			long value = counter;
			for (int i = 7; i >= 0; i--) {
				counterBytes[i] = (byte) (value & 0xFF);
				value >>= 8;
			}

			Mac mac = Mac.getInstance("HmacSHA1");
			mac.init(new SecretKeySpec(key, "HmacSHA1"));
			byte[] hash = mac.doFinal(counterBytes);

			int offset = hash[hash.length - 1] & 0x0F;
			int binary = ((hash[offset] & 0x7F) << 24)
				| ((hash[offset + 1] & 0xFF) << 16)
				| ((hash[offset + 2] & 0xFF) << 8)
				| (hash[offset + 3] & 0xFF);
			int otp = binary % (int) Math.pow(10, CODE_DIGITS);
			return String.format("%0" + CODE_DIGITS + "d", otp);
		} catch (Exception ex) {
			throw new IllegalStateException("Nie udalo sie wygenerowac kodu TOTP", ex);
		}
	}

	// Dekoduje sekret Base32 do bajtów wymaganych przez HMAC-SHA1.
	private byte[] decodeBase32(String value) {
		String normalized = value.replace("=", "").replaceAll("\\s+", "").toUpperCase();
		int outputLength = normalized.length() * 5 / 8;
		byte[] result = new byte[outputLength];
		int buffer = 0;
		int bitsLeft = 0;
		int index = 0;

		for (int i = 0; i < normalized.length(); i++) {
			int charValue = BASE32_ALPHABET.indexOf(normalized.charAt(i));
			if (charValue < 0) {
				throw new IllegalArgumentException("Niepoprawny sekret Base32");
			}
			buffer = (buffer << 5) | charValue;
			bitsLeft += 5;
			if (bitsLeft >= 8) {
				result[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xFF);
				bitsLeft -= 8;
			}
		}
		return result;
	}

	// Bezpieczne kodowanie wartości używanych w URI otpauth.
	private String urlEncode(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
	}
}
