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
@Table(name = "zgloszenia")
@Data
public class Zgloszenie {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "wyd_id", nullable = false)
	private Long wydId;

	private String tytul;

	@Column(columnDefinition = "TEXT")
	private String opis;

	private String stan;

	private LocalDateTime utworzony;

	private LocalDateTime zamkniety;
}
