package com.eventflow.com.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "kategorie")
@Data
public class Kategoria {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String nazwa;

	@Column(columnDefinition = "TEXT")
	private String opis;
}
