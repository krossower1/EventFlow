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
@Table(name = "personel")
@Data
public class Personel {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "wyd_id", nullable = false)
	private Long wydId;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	private String rola;

	@Column(name = "data_zajet")
	private LocalDateTime dataZajet;
}
