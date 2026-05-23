package com.eventflow.com.controller.dto;

import java.util.List;

public record SalaPlanUpdateRequestDto(
	Integer layoutWidth,
	Integer layoutHeight,
	List<SalaMiejsceDto> seats
) {
}
