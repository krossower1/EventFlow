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
@Table(name = "zamowienia")
@Data
public class Zamowienie {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "platn_id", nullable = false)
	private Long platnId;

	@Column(name = "poz_zam_id", nullable = false)
	private Long pozZamId;

	private LocalDateTime data;

	private Integer ilosc;

	private String waluta;

	private String stan;
}
