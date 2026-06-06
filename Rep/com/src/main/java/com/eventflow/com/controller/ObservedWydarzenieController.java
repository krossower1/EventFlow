package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.ObservedWydarzenieDto;
import com.eventflow.com.model.Kategoria;
import com.eventflow.com.model.Sala;
import com.eventflow.com.model.User;
import com.eventflow.com.model.UserObservedEvent;
import com.eventflow.com.model.Wydarzenie;
import com.eventflow.com.repository.KategoriaRepository;
import com.eventflow.com.repository.SalaRepository;
import com.eventflow.com.repository.UserObservedEventRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

/**
 * API obserwowanych wydarzeń (zakładka Ustawienia → Obserwowane, gwiazdka na {@code WydarzenieCard}).
 * Dostęp wyłącznie dla roli USER; dodanie wymaga statusu wydarzenia AKTYWNY.
 */
@RestController
@RequestMapping("/api/obserwowane")
@CrossOrigin(origins = "http://localhost:3000")
public class ObservedWydarzenieController {
	private static final String STATUS_AKTYWNY = "AKTYWNY";

	private final UserRepository userRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final UserObservedEventRepository userObservedEventRepository;
	private final SalaRepository salaRepository;
	private final KategoriaRepository kategoriaRepository;

	public ObservedWydarzenieController(
		UserRepository userRepository,
		WydarzenieRepository wydarzenieRepository,
		UserObservedEventRepository userObservedEventRepository,
		SalaRepository salaRepository,
		KategoriaRepository kategoriaRepository
	) {
		this.userRepository = userRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.userObservedEventRepository = userObservedEventRepository;
		this.salaRepository = salaRepository;
		this.kategoriaRepository = kategoriaRepository;
	}

	/**
	 * Pełna lista obserwowanych wydarzeń zalogowanego użytkownika USER (najpierw ostatnio dodane).
	 */
	@GetMapping
	public List<ObservedWydarzenieDto> getObserved(Authentication authentication) {
		User currentUser = requireUserRole(authentication);
		return userObservedEventRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
			.map(this::toDto)
			.toList();
	}

	/**
	 * Same identyfikatory wydarzeń — lekka odpowiedź do cache na kartach (bez nazw sali/kategorii).
	 */
	@GetMapping("/ids")
	public List<Long> getObservedIds(Authentication authentication) {
		User currentUser = requireUserRole(authentication);
		return userObservedEventRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
			.map(UserObservedEvent::getWydarzenieId)
			.toList();
	}

	/**
	 * Dodaje wydarzenie do obserwowanych. Idempotentne w sensie komunikatu: jeśli już obserwowane, zwraca 200.
	 *
	 * @throws ResponseStatusException BAD_REQUEST gdy brak wydarzenia lub status inny niż AKTYWNY
	 */
	@PostMapping("/{wydarzenieId}")
	@Transactional
	public ResponseEntity<String> addObserved(
		@PathVariable Long wydarzenieId,
		Authentication authentication
	) {
		User currentUser = requireUserRole(authentication);
		Wydarzenie wydarzenie = wydarzenieRepository.findById(wydarzenieId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));
		if (!STATUS_AKTYWNY.equals(normalizeStatus(wydarzenie.getStatus()))) {
			throw new ResponseStatusException(BAD_REQUEST, "Mozna obserwowac tylko wydarzenia o statusie AKTYWNY.");
		}
		if (userObservedEventRepository.findByUserIdAndWydarzenieId(currentUser.getId(), wydarzenieId).isPresent()) {
			return ResponseEntity.ok("Wydarzenie jest juz obserwowane.");
		}

		UserObservedEvent observed = new UserObservedEvent();
		observed.setUserId(currentUser.getId());
		observed.setWydarzenieId(wydarzenieId);
		observed.setCreatedAt(LocalDateTime.now());
		userObservedEventRepository.save(observed);
		return ResponseEntity.status(CREATED).body("Dodano do obserwowanych.");
	}

	/**
	 * Usuwa wydarzenie z listy obserwowanych bieżącego użytkownika.
	 */
	@DeleteMapping("/{wydarzenieId}")
	@Transactional
	public ResponseEntity<String> removeObserved(
		@PathVariable Long wydarzenieId,
		Authentication authentication
	) {
		User currentUser = requireUserRole(authentication);
		UserObservedEvent observed = userObservedEventRepository.findByUserIdAndWydarzenieId(currentUser.getId(), wydarzenieId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "To wydarzenie nie jest obserwowane."));
		userObservedEventRepository.delete(observed);
		return ResponseEntity.ok("Usunieto z obserwowanych.");
	}

	/** Mapuje wpis obserwowania na DTO; gdy wydarzenie zostało usunięte z bazy, zwraca placeholdery. */
	private ObservedWydarzenieDto toDto(UserObservedEvent observed) {
		Wydarzenie wydarzenie = wydarzenieRepository.findById(observed.getWydarzenieId()).orElse(null);
		if (wydarzenie == null) {
			return new ObservedWydarzenieDto(
				observed.getWydarzenieId(),
				"Wydarzenie usuniete",
				"-",
				"-",
				"-",
				null,
				observed.getCreatedAt()
			);
		}
		return new ObservedWydarzenieDto(
			wydarzenie.getId(),
			wydarzenie.getTytul(),
			normalizeStatus(wydarzenie.getStatus()),
			salaRepository.findById(wydarzenie.getSalaId()).map(Sala::getNazwa).orElse("-"),
			kategoriaRepository.findById(wydarzenie.getKategoriaId()).map(Kategoria::getNazwa).orElse("-"),
			wydarzenie.getDataRozp(),
			observed.getCreatedAt()
		);
	}

	/** Ujednolica warianty zapisu statusu (np. AKTYWNE → AKTYWNY) */
	private String normalizeStatus(String status) {
		if (status == null) {
			return STATUS_AKTYWNY;
		}
		return switch (status.trim().toUpperCase()) {
			case "AKTYWNE" -> STATUS_AKTYWNY;
			default -> status.trim().toUpperCase();
		};
	}

	/** Wymaga zalogowanego użytkownika o roli USER — inne role dostają 403. */
	private User requireUserRole(Authentication authentication) {
		User user = requireCurrentUser(authentication);
		if (!isUser(user)) {
			throw new ResponseStatusException(FORBIDDEN, "");
		}
		return user;
	}

	private boolean isUser(User user) {
		return user.getRola() != null && user.getRola().equalsIgnoreCase("USER");
	}

	private User requireCurrentUser(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}
		return userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono aktualnego uzytkownika."));
	}
}
