package com.eventflow.com.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizator")
@Data
public class Organizator {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false, unique = true)
	private Long userId;

	private String firma;

	@Column(columnDefinition = "TEXT")
	private String kwalifikacje;

	private String strona;

	private Boolean zweryfikow;

	@Column(name = "data_utw")
	private LocalDateTime dataUtw;
}
