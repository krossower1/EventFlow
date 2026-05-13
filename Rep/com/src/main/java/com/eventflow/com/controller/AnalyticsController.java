package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.AnalyticsOverviewResponse;
import com.eventflow.com.service.AnalyticsService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Warstwa HTTP dla modułu analityki wizualnej (wykresy na stronie React „Analityka”).
 * <p>
 * Nie zawiera logiki agregacji — jedynie udostępnia punkt wejścia {@code GET /overview}
 * i przekazuje {@link Authentication} do serwisu, który odczytuje dane z bazy i buduje DTO.
 * Front (biblioteka Recharts) rysuje na podstawie JSON dwa wykresy: słupkowy rejestracji
 * użytkowników po dniach oraz pierścieniowy udziału kategorii wśród aktywnych wydarzeń.
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

	private final AnalyticsService analyticsService;

	public AnalyticsController(AnalyticsService analyticsService) {
		this.analyticsService = analyticsService;
	}

	/**
	 * Zwraca komplet danych do narysowania obu wykresów oraz powiązanych kafelków KPI
	 * (skróty „dziś / wczoraj / 7 dni” liczone na froncie z tej samej tablicy dni co wykres słupkowy).
	 * Wymaga zalogowania (Spring Security); bez sesji zwracany jest błąd 401.
	 */
	@GetMapping("/overview")
	public AnalyticsOverviewResponse overview(Authentication authentication) {
		return analyticsService.buildOverview(authentication);
	}
}
