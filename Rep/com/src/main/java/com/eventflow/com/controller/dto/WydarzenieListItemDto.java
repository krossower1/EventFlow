package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record WydarzenieListItemDto(
	Long id,
	String tytul,
	String status,
	String miejsceNazwa,
	String kategoriaNazwa,
	LocalDateTime dataRozp,
	LocalDateTime dataZamk
) {
}
