package com.eventflow.com.controller.dto;

import java.util.List;

public record WydarzenieOptionsDto(
	List<SalaOptionDto> sale,
	List<KategoriaDto> kategorieSystemowe,
	List<KategoriaDto> kategorieUzytkownika
) {
}
