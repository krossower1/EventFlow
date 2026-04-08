package com.eventflow.com.controller.dto;

import java.util.List;

public record WydarzenieOptionsDto(
	List<MiejsceOptionDto> miejsca,
	List<KategoriaDto> kategorie
) {
}
