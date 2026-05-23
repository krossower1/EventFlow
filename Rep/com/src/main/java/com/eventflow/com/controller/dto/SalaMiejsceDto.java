package com.eventflow.com.controller.dto;

public record SalaMiejsceDto(
	String id,
	String type,
	String baseLabel,
	String rowLabel,
	Integer x,
	Integer y,
	Integer width,
	Integer height,
	Integer rotation
) {
}
