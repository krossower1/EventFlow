package com.eventflow.com.controller.dto;

import java.util.List;

public record WydarzenieCreateRequestDto(
	Long salaId,
	String tytul,
	String opis,
	Long kategoriaId,
	String status,
	String dataRozp,
	String dataZamk,
	Boolean createNowaKategoria,
	String nowaKategoriaNazwa,
	String nowaKategoriaOpis,
	List<BiletCreateRequestDto> bilety
) {
}
