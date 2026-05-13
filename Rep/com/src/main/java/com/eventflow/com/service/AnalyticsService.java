package com.eventflow.com.service;

import com.eventflow.com.controller.dto.AnalyticsCategoryCountDto;
import com.eventflow.com.controller.dto.AnalyticsDayCountDto;
import com.eventflow.com.controller.dto.AnalyticsOverviewResponse;
import com.eventflow.com.model.Organizator;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.OrganizatorRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/**
 * Serwis domenowy dla zakładki Analityka: zbiera z bazy agregaty potrzebne do wykresów
 * (słupkowy rejestracji oraz pierścieniowy kategorii wydarzeń) i pakuje je w jeden obiekt
 * DTO zwracany przez REST.
 * <p>
 * <b>Rejestracje (oś czasu wykresu słupkowego):</b> liczymy rekordy w tabeli {@code users},
 * grupując po <i>dniu kalendarzowym</i> kolumny {@code data_utw}. Okno to zawsze siedem
 * kolejnych dni: od początku dnia „dziś − 6” do końca „dziś” (włącznie), przy czym granice
 * dnia wyliczamy w {@link ZoneId#systemDefault()} serwera JVM — identyczna strefa powinna
 * być używana przy zapisie {@code data_utw} przy rejestracji ({@code LocalDateTime.now()}),
 * żeby liczby były intuicyjne.
 * <p>
 * <b>Wydarzenia i kategorie (wykres pierścieniowy + licznik KPI):</b> uwzględniamy wyłącznie
 * wiersze {@code wydarzenia} o statusie {@code AKTYWNY}. Dla roli {@code ORG} zawężamy
 * zestawienie do {@code org_id} powiązanego z kontem w tabeli {@code organizator}, tak aby
 * organizator widział wyłącznie własne wydarzenia; administrator ({@code ADMIN}) oraz
 * pozostali użytkownicy dostają widok całej platformy (brak filtra {@code org_id}).
 */
@Service
public class AnalyticsService {

	private static final String STATUS_AKTYWNY = "AKTYWNY";

	private final UserRepository userRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final OrganizatorRepository organizatorRepository;

	public AnalyticsService(
		UserRepository userRepository,
		WydarzenieRepository wydarzenieRepository,
		OrganizatorRepository organizatorRepository
	) {
		this.userRepository = userRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.organizatorRepository = organizatorRepository;
	}

	/**
	 * Główna metoda agregująca dane pod jednorazowe odświeżenie widoku Analityka na froncie.
	 * <ol>
	 *   <li>Weryfikujemy uwierzytelnienie i wczytujemy encję {@link User} po loginie z tokena.</li>
	 *   <li>Wyliczamy przedział czasu [początek dnia (dziś−6), początek jutra) dla strefy serwera.</li>
	 *   <li>Pobieramy zgrupowane zliczenia rejestracji po dniach i uzupełniamy brakujące dni zerami
	 *       tak, by lista miała <b>dokładnie 7 pozycji</b> — front nie musi domyślać się brakujących dat.</li>
	 *   <li>Na podstawie roli ustalamy zakres wydarzeń — metoda {@link #resolveEventOrgScope(User)}.</li>
	 *   <li>Liczymy sumę aktywnych wydarzeń oraz listę par (nazwa kategorii, liczba) pod wykres donut.</li>
	 * </ol>
	 *
	 * @param authentication kontekst Spring Security (sesja + Basic Auth z frontu)
	 * @return komplet pól JSON dla {@code GET /api/analytics/overview}; pole {@code metricTimeZone}
	 *         ułatwia zrozumienie użytkownikowi, w jakiej strefie liczone są „dni” kalendarzowe
	 */
	public AnalyticsOverviewResponse buildOverview(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			throw new ResponseStatusException(UNAUTHORIZED, "Wymagane zalogowanie");
		}
		User user = userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono użytkownika"));

		ZoneId zone = ZoneId.systemDefault();
		LocalDate today = LocalDate.now(zone);
		LocalDate first = today.minusDays(6);
		LocalDateTime fromInclusive = first.atStartOfDay(zone).toLocalDateTime();
		LocalDateTime toExclusive = today.plusDays(1).atStartOfDay(zone).toLocalDateTime();

		// Mapa: dzień kalendarzowy -> liczba nowych kont (wynik natywnego GROUP BY po DATE(data_utw))
		Map<LocalDate, Long> byDay = new HashMap<>();
		for (Object[] row : userRepository.countRegistrationsGroupedByDay(fromInclusive, toExclusive)) {
			LocalDate d = toLocalDate(row[0]);
			long c = ((Number) row[1]).longValue();
			byDay.put(d, c);
		}

		// Stała długość 7: nawet gdy w danym dniu nikt się nie rejestrował, zwracamy count = 0
		List<AnalyticsDayCountDto> registrations = new ArrayList<>(7);
		for (int i = 0; i < 7; i++) {
			LocalDate d = first.plusDays(i);
			registrations.add(new AnalyticsDayCountDto(d, byDay.getOrDefault(d, 0L)));
		}

		Long orgScopeId = resolveEventOrgScope(user);
		long activeTotal = orgScopeId == null
			? wydarzenieRepository.countByStatus(STATUS_AKTYWNY)
			: wydarzenieRepository.countByStatusAndOrgId(STATUS_AKTYWNY, orgScopeId);

		List<Object[]> categoryRows = orgScopeId == null
			? wydarzenieRepository.countActiveEventsByCategoryAll(STATUS_AKTYWNY)
			: wydarzenieRepository.countActiveEventsByCategoryForOrg(STATUS_AKTYWNY, orgScopeId);

		List<AnalyticsCategoryCountDto> categories = categoryRows.stream()
			.map(r -> new AnalyticsCategoryCountDto(String.valueOf(r[0]), ((Number) r[1]).longValue()))
			.toList();

		return new AnalyticsOverviewResponse(registrations, activeTotal, categories, zone.getId());
	}

	/**
	 * Hibernate / sterownik JDBC zwraca pierwszą kolumnę {@code DATE(...)} w natywnym SQL
	 * jako {@link java.sql.Date}, czasem jako {@link LocalDate} — ta metoda normalizuje typ
	 * do {@link LocalDate}, żeby dalsza logika (mapa {@code byDay}) była odporna na wariant
	 * zwracany przez sterownik.
	 */
	private static LocalDate toLocalDate(Object sqlDateOrSimilar) {
		if (sqlDateOrSimilar instanceof java.sql.Date d) {
			return d.toLocalDate();
		}
		if (sqlDateOrSimilar instanceof LocalDate ld) {
			return ld;
		}
		if (sqlDateOrSimilar instanceof java.time.Instant ins) {
			return ins.atZone(ZoneId.systemDefault()).toLocalDate();
		}
		return LocalDate.parse(sqlDateOrSimilar.toString());
	}

	/**
	 * Decyduje, czy zapytania o wydarzenia mają obejmować całą platformę, czy tylko jednego organizatora.
	 * <ul>
	 *   <li>{@code ADMIN} — {@code null}: brak filtra {@code org_id} (pełny obraz dla administratora).</li>
	 *   <li>{@code ORG} — identyfikator rekordu {@link Organizator#getId()} powiązanego z {@code user_id}
	 *       zalogowanego użytkownika; jeśli brak rekordu organizatora, zwracamy {@code null}
	 *       (zachowanie jak widok globalny — edge case konta bez wpisu organizatora).</li>
	 *   <li>Inne role — {@code null}: zwykły użytkownik widzi statystyki całej platformy.</li>
	 * </ul>
	 */
	private Long resolveEventOrgScope(User user) {
		if (user.getRola() != null && "ADMIN".equalsIgnoreCase(user.getRola().trim())) {
			return null;
		}
		if (user.getRola() != null && "ORG".equalsIgnoreCase(user.getRola().trim())) {
			return organizatorRepository.findByUserId(user.getId())
				.map(Organizator::getId)
				.orElse(null);
		}
		return null;
	}
}
