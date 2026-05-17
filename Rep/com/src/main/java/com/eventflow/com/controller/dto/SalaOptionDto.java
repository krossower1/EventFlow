package com.eventflow.com.controller.dto;

import java.util.List;

public record SalaOptionDto(
	Long id,
	String nazwa,
	String miejsceNazwa,
	Boolean maPlan,
	List<SalaMiejsceDto> seats
) {
}
