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
@Table(name = "platnosci")
@Data
public class Platnosc {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String metoda;

	private LocalDateTime data;

	private Boolean zgodnosc;

	private String stan;

	@Column(name = "tranz_id")
	private String tranzId;
}
