package com.eventflow.com.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "miejsca")
@Data
public class Miejsce {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nazwa;
	private String panstwo;
	private String miasto;
	private String ulica;

	@Column(name = "kod_poczt")
	private String kodPoczt;

	private Integer pojemnosc;

	@Column(columnDefinition = "TEXT")
	private String opis;

	// Pole techniczne do powiazania miejsca z kontem ORG.
	@Column(name = "user_id", nullable = false)
	private Long userId;
}
