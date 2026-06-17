package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import lombok.Data;

@Entity
@Table(name = "sala_miejsca")
@Data
public class SalaMiejsce {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "sala_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Sala sala;

	@Column(name = "seat_key", nullable = false)
	private String seatKey;

	@Column(name = "item_type", nullable = false)
	private String itemType;

	@Column(name = "base_label")
	private String baseLabel;

	@Column(name = "row_label")
	private String rowLabel;

	@Column(name = "pos_x", nullable = false)
	private Integer x;

	@Column(name = "pos_y", nullable = false)
	private Integer y;

	@Column(name = "item_width")
	private Integer width;

	@Column(name = "item_height")
	private Integer height;

	@Column(name = "rotation_deg", nullable = false)
	private Integer rotation;
}
