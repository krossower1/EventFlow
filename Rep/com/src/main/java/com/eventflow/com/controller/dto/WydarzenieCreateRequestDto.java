package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record WydarzenieCreateRequestDto(
	Long miejsceId,
	String tytul,
	String opis,
	Long kategoriaId,
	String rola,
	String status,
	LocalDateTime dataRozp,
	LocalDateTime dataZamk,
	Boolean createNowaKategoria,
	String nowaKategoriaNazwa,
	String nowaKategoriaOpis
) {
}
