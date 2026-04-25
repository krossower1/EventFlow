package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record OpiniaDto(
	Long id,
	Long userId,
	String userLogin,
	Integer ocena,
	String opis,
	LocalDateTime data
) {
}
