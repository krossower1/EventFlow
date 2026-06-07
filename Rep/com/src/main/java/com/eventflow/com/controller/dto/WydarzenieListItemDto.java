package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WydarzenieListItemDto(
	Long id,
	String tytul,
	String status,
	String salaNazwa,
	Long kategoriaId,
	String kategoriaNazwa,
	LocalDateTime dataRozp,
	LocalDateTime dataZamk,
	Boolean maDostepneBilety,
	List<BiletPostepDto> postepyBiletow,
	String miejsceNazwa,
	String miasto,
	String kodPocztowy,
	String ulica,
	String creatorLogin,
	Double averageRating
) {
}
