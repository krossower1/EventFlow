package com.eventflow.com.controller.dto;

import java.util.List;

public record MiejsceResponseDto(
	Long id,
	String nazwa,
	String panstwo,
	String miasto,
	String ulica,
	String kodPoczt,
	Integer iloscSal,
	String opis,
	List<SalaResponseDto> sale
) {
}
