package com.eventflow.com.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "patch_notes")
@Data
public class PatchNotes {
	@Id
	private Long id = 1L;

	@Column(name = "date_label")
	private String dateLabel;

	@Column(name = "items_text", columnDefinition = "TEXT")
	private String itemsText;
}
