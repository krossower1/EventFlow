package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String imie;
	private String nazwisko;

	@Column(nullable = false, unique = true)
	private String email;

	// Numer telefonu jest opcjonalny, ale jeśli podany, musi być unikalny w systemie.
	@Column(name = "telefon", unique = true)
	private String telefon;

	@Column(nullable = false, unique = true)
	private String login;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String haslo;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String salt;

	@Column(name = "email_verified")
	private Boolean emailVerified = false;

	@Column(length = 6)
	private String verificationCode;

	@Column(name = "verification_code_expires_at")
	private LocalDateTime verificationCodeExpiresAt;

	@Column(name = "two_factor_enabled")
	private Boolean twoFactorEnabled = false;

	@Column(name = "two_factor_secret", length = 128)
	private String twoFactorSecret;

	@Column(name = "two_factor_temp_secret", length = 128)
	private String twoFactorTempSecret;

	@Column(name = "session_timeout_enabled", nullable = false)
	private Boolean sessionTimeoutEnabled = true;

	@Column(name = "session_timeout_minutes", nullable = false)
	private Integer sessionTimeoutMinutes = 30;

	@Column(name = "session_warning_minutes", nullable = false)
	private Integer sessionWarningMinutes = 1;

	@Column(name = "session_expiry_action", nullable = false, length = 24)
	private String sessionExpiryAction = "LOGOUT";

	@Column(name = "session_count_mode", nullable = false, length = 24)
	private String sessionCountMode = "RELATIVE";

	@Column(columnDefinition = "TEXT")
	private String platnosc;

	private String rola;

	@Column(name = "data_utw")
	private LocalDateTime dataUtw;

	/** Powiadomienie: logowanie administratora do systemu (zakładka Ustawienia → Powiadomienia). */
	@Column(name = "notify_admin_login", nullable = false)
	private Boolean notifyAdminLogin = true;

	@Column(name = "notify_new_event", nullable = false)
	private Boolean notifyNewEvent = true;

	@Column(name = "notify_favorite_login", nullable = false)
	private Boolean notifyFavoriteLogin = false;

	@Column(name = "notify_observed_event_end", nullable = false)
	private Boolean notifyObservedEventEnd = true;

	@Column(name = "notify_observed_event_start", nullable = false)
	private Boolean notifyObservedEventStart = true;

	@Column(name = "notify_observed_seat_freed", nullable = false)
	private Boolean notifyObservedSeatFreed = true;

	private Boolean aktywnosc;
}
