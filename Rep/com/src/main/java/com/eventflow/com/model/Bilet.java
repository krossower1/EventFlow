package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bilety")
@Data
public class Bilet {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "wydarzenie_id", nullable = false)
	private Long wydarzenieId;

	private String klasa;

	private BigDecimal cena;

	private String waluta;

	private Integer ilosc;

	@Column(name = "start_sprzedazy")
	private LocalDateTime startSprzedazy;

	@Column(name = "koniec_sprzedazy")
	private LocalDateTime koniecSprzedazy;

	@Column(name = "seat_ids", columnDefinition = "TEXT")
	private String seatIds;

	@Column(name = "kategoria_biletu")
	private String kategoriaBiletu;
}
