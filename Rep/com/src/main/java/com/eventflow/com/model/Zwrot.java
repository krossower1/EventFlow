package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Table(name = "zwroty")
@Data
public class Zwrot {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "platn_id", nullable = false)
	private Long platnId;

	private BigDecimal kwota;

	private String waluta;

	@Column(columnDefinition = "TEXT")
	private String powod;

	private String stan;

	private Boolean otrzymany;

	private Boolean przyznany;
}
