package com.eventflow.com.controller.dto;

import java.util.List;

public record SalaPlanUpdateRequestDto(
	List<SalaMiejsceDto> seats
) {
}
