package com.eventflow.com.controller.dto;

import java.util.List;

public record SalaResponseDto(
	Long id,
	Long miejsceId,
	String nazwa,
	Integer pojemnosc,
	Integer pietro,
	Boolean maPlan,
	List<SalaMiejsceDto> seats
) {
}
