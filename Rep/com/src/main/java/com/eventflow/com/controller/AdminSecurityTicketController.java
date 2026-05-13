package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.SecurityTicketAdminResponse;
import com.eventflow.com.controller.dto.SecurityTicketAssignRequest;
import com.eventflow.com.controller.dto.SecurityTicketAuditResponse;
import com.eventflow.com.controller.dto.SecurityTicketStatusUpdateRequest;
import com.eventflow.com.model.SecurityTicketCategory;
import com.eventflow.com.model.SecurityTicketStatus;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.service.SecurityTicketService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

/**
 * REST API skrzynki zgłoszeń bezpieczeństwa — wyłącznie dla administratorów.
 * <p>
 * Bazowy prefiks: {@code /api/admin/security-tickets}. Każda metoda wymaga użytkownika z rolą ADMIN
 * (sprawdzenie po {@link Authentication#getName()} i encji {@link User} w bazie).
 * Logika biznesowa leży w {@link SecurityTicketService}; kontroler tylko mapuje HTTP, parsuje query i zwraca DTO.
 */
@RestController
@RequestMapping("/api/admin/security-tickets")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminSecurityTicketController {

	private final UserRepository userRepository;
	private final SecurityTicketService securityTicketService;

	public AdminSecurityTicketController(UserRepository userRepository, SecurityTicketService securityTicketService) {
		this.userRepository = userRepository;
		this.securityTicketService = securityTicketService;
	}

	/** Liczba zgłoszeń w statusie NEW (np. pod przyszły licznik w UI). */
	@GetMapping("/count-new")
	public long countNew(Authentication authentication) {
		requireAdminUser(authentication);
		return securityTicketService.countNewTickets();
	}

	/**
	 * Lista zgłoszeń z opcjonalnymi filtrami query: {@code status}, {@code category}, {@code affectedUserId}.
	 * Puste / brak parametru = brak filtra w danym wymiarze.
	 */
	@GetMapping
	public List<SecurityTicketAdminResponse> list(
		Authentication authentication,
		@RequestParam(name = "status", required = false) String status,
		@RequestParam(name = "category", required = false) String category,
		@RequestParam(name = "affectedUserId", required = false) Long affectedUserId
	) {
		User admin = requireAdminUser(authentication);
		return securityTicketService.listForAdmin(
			admin,
			parseStatus(status),
			parseCategory(category),
			affectedUserId
		);
	}

	/** Audyt tekstowy jednego zgłoszenia (historia działań adminów). */
	@GetMapping("/{id}/audit")
	public List<SecurityTicketAuditResponse> audit(@PathVariable Long id, Authentication authentication) {
		User admin = requireAdminUser(authentication);
		return securityTicketService.listAuditsForAdmin(admin, id);
	}

	/** Body: {@code { "status": "IN_PROGRESS" }} — musi być poprawna nazwa enumu {@link SecurityTicketStatus}. */
	@PutMapping("/{id}/status")
	public SecurityTicketAdminResponse updateStatus(
		@PathVariable Long id,
		@RequestBody SecurityTicketStatusUpdateRequest body,
		Authentication authentication
	) {
		User admin = requireAdminUser(authentication);
		SecurityTicketStatus next = parseStatusRequired(body.status());
		securityTicketService.updateStatus(admin, id, next);
		return securityTicketService.getForAdmin(admin, id);
	}

	/** Body: {@code { "assignedAdminId": 123 }} lub {@code null} — cofnięcie przypisania. */
	@PutMapping("/{id}/assign")
	public SecurityTicketAdminResponse assign(
		@PathVariable Long id,
		@RequestBody SecurityTicketAssignRequest body,
		Authentication authentication
	) {
		User admin = requireAdminUser(authentication);
		securityTicketService.assign(admin, id, body.assignedAdminId());
		return securityTicketService.getForAdmin(admin, id);
	}

	/** Ustawia status DISMISSED (skrót od strony UI zamiast PUT status). */
	@PostMapping("/{id}/quick-dismiss")
	public SecurityTicketAdminResponse quickDismiss(@PathVariable Long id, Authentication authentication) {
		User admin = requireAdminUser(authentication);
		securityTicketService.quickDismiss(admin, id);
		return securityTicketService.getForAdmin(admin, id);
	}

	/** Wywołuje zawieszenie konta użytkownika powiązanego ze zgłoszeniem (reguły w serwisie). */
	@PostMapping("/{id}/quick-block")
	public SecurityTicketAdminResponse quickBlock(@PathVariable Long id, Authentication authentication) {
		User admin = requireAdminUser(authentication);
		securityTicketService.quickBlockAccount(admin, id);
		return securityTicketService.getForAdmin(admin, id);
	}

	/** Przywraca {@code aktywnosc} konta ofiary po wcześniejszym zawieszeniu (quick-block). */
	@PostMapping("/{id}/quick-unblock")
	public SecurityTicketAdminResponse quickUnblock(@PathVariable Long id, Authentication authentication) {
		User admin = requireAdminUser(authentication);
		securityTicketService.quickUnblockAccount(admin, id);
		return securityTicketService.getForAdmin(admin, id);
	}

	/** Wymusza reset hasła ofiary przez {@link com.eventflow.com.auth.AuthService}. */
	@PostMapping("/{id}/quick-force-password-reset")
	public SecurityTicketAdminResponse quickForcePasswordReset(@PathVariable Long id, Authentication authentication) {
		User admin = requireAdminUser(authentication);
		securityTicketService.quickForcePasswordReset(admin, id);
		return securityTicketService.getForAdmin(admin, id);
	}

	/** Usuwa zgłoszenie i powiązane audyty (kolejność w serwisie). */
	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id, Authentication authentication) {
		User admin = requireAdminUser(authentication);
		securityTicketService.deleteTicket(admin, id);
	}

	/**
	 * Rozwiązuje {@link Authentication} do encji {@link User} i weryfikuje rolę ADMIN.
	 *
	 * @throws ResponseStatusException 400 bez uwierzytelnienia / brak użytkownika, 403 jeśli nie ADMIN
	 */
	private User requireAdminUser(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Brak uwierzytelnienia.");
		}
		User user = userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono użytkownika."));
		if (!"ADMIN".equalsIgnoreCase(user.getRola())) {
			throw new ResponseStatusException(FORBIDDEN, "Brak uprawnień administratora.");
		}
		return user;
	}

	/** Parsuje wymagany status z body — pusty string = błąd 400. */
	private SecurityTicketStatus parseStatusRequired(String raw) {
		if (raw == null || raw.isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Podaj status.");
		}
		try {
			return SecurityTicketStatus.valueOf(raw.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(BAD_REQUEST, "Nieznany status: " + raw);
		}
	}

	/** Parsuje opcjonalny status z query — brak / pusty = {@code null}. */
	private SecurityTicketStatus parseStatus(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return SecurityTicketStatus.valueOf(raw.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(BAD_REQUEST, "Nieznany status: " + raw);
		}
	}

	/** Parsuje opcjonalną kategorię z query — musi pasować do {@link SecurityTicketCategory}. */
	private SecurityTicketCategory parseCategory(String raw) {
		if (raw == null || raw.isBlank()) {
			return null;
		}
		try {
			return SecurityTicketCategory.valueOf(raw.trim().toUpperCase());
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(BAD_REQUEST, "Nieznana kategoria: " + raw);
		}
	}
}
