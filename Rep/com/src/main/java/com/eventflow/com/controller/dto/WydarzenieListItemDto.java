package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WydarzenieListItemDto(
	Long id,
	String tytul,
	String status,
	String salaNazwa,
	String kategoriaNazwa,
	LocalDateTime dataRozp,
	LocalDateTime dataZamk,
	Boolean maDostepneBilety,
	List<BiletPostepDto> postepyBiletow
) {
}
