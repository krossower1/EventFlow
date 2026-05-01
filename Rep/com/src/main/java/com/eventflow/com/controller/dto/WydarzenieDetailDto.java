package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WydarzenieDetailDto(
	Long id,
	String tytul,
	String opis,
	String status,
	String salaNazwa,
	String kategoriaNazwa,
	LocalDateTime dataRozp,
	LocalDateTime dataZamk,
	Boolean maDostepneBilety,
	Boolean canManagePersonel,
	List<BiletPostepDto> postepyBiletow,
	List<PersonelDto> personel,
	List<OpiniaDto> opinie,
	List<ZgloszenieDto> zgloszenia
) {
}
