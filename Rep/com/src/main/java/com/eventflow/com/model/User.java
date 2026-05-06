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

	@Column(columnDefinition = "TEXT")
	private String platnosc;

	private String rola;

	@Column(name = "data_utw")
	private LocalDateTime dataUtw;

	private Boolean aktywnosc;
}
