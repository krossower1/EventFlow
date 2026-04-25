package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WydarzenieDetailDto(
	Long id,
	String tytul,
	String opis,
	String status,
	String miejsceNazwa,
	String kategoriaNazwa,
	LocalDateTime dataRozp,
	LocalDateTime dataZamk,
	Boolean maDostepneBilety,
	List<BiletPostepDto> postepyBiletow,
	List<OpiniaDto> opinie
) {
}
