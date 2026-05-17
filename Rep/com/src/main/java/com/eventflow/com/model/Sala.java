package com.eventflow.com.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sale")
@Data
public class Sala {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "miejsce_id", nullable = false)
	private Long miejsceId;

	private String nazwa;
	private Integer pojemnosc;
	private Integer pietro;

	@Column(name = "ma_plan")
	private Boolean maPlan;

	@OneToMany(mappedBy = "sala", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
	private List<SalaMiejsce> seats = new ArrayList<>();
}
