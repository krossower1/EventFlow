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
@Table(name = "wyst_bilety")
@Data
public class WystBilet {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "zam_id", nullable = false)
	private Long zamId;

	@Column(name = "bilet_id", nullable = false)
	private Long biletId;

	private String stan;

	@Column(name = "wydany_data")
	private LocalDateTime wydanyData;

	@Column(name = "uzyty_data")
	private LocalDateTime uzytyData;

	private String kod;

	@Column(name = "seat_id")
	private String seatId;

	@Column(name = "qr_code", columnDefinition = "TEXT")
	private String qrCode;
}
