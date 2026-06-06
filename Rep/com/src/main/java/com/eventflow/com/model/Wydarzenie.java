package com.eventflow.com.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "wydarzenia")
@Data
public class Wydarzenie {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "org_id", nullable = false)
	private Long orgId;

	@Column(name = "sala_id", nullable = false)
	private Long salaId;

	private String tytul;

	@Column(columnDefinition = "TEXT")
	private String opis;

	@Column(name = "kategoria_id", nullable = false)
	private Long kategoriaId;

	@Transient
	private String rola;

	@Column(name = "data_utw")
	private LocalDateTime dataUtw;

	private String status;

	@Column(name = "data_rozp")
	private LocalDateTime dataRozp;

	@Column(name = "data_zamk")
	private LocalDateTime dataZamk;

	@Column(name = "org_start_reminder_sent_at")
	private LocalDateTime orgStartReminderSentAt;

	@Column(name = "org_sold_out_notified_at")
	private LocalDateTime orgSoldOutNotifiedAt;
}
