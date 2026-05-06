package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_logs")
@Data
// Rekord audytowy pojedynczej próby logowania użytkownika.
public class LoginLog {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "login_time", nullable = false)
	private LocalDateTime loginTime = LocalDateTime.now();

	@Column(name = "location", length = 100)
	private String location;

	@Column(name = "device_info", length = 255)
	private String deviceInfo;

	@Column(name = "status", length = 50, nullable = false)
	private String status;
}
