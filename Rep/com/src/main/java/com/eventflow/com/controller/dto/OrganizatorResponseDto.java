package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record OrganizatorResponseDto(
	Long id,
	Long userId,
	String userLogin,
	String userEmail,
	String firma,
	String kwalifikacje,
	String strona,
	Boolean zweryfikow,
	LocalDateTime dataUtw
) {
}
