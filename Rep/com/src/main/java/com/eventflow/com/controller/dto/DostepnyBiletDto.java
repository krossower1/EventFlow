package com.eventflow.com.controller.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DostepnyBiletDto(
	Long biletId,
	String klasa,
	BigDecimal cena,
	String waluta,
	Integer dostepnaIlosc,
	LocalDateTime startSprzedazy,
	LocalDateTime koniecSprzedazy,
	Boolean requiresSeatSelection,
	List<String> assignedSeatIds,
	List<SalaMiejsceDto> salaSeats,
	List<String> occupiedSeatIds
) {
}
