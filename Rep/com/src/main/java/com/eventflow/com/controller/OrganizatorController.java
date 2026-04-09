package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.OrganizatorRequestDto;
import com.eventflow.com.controller.dto.OrganizatorResponseDto;
import com.eventflow.com.model.Organizator;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.OrganizatorRepository;
import com.eventflow.com.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/organizator")
@CrossOrigin(origins = "http://localhost:3000")
public class OrganizatorController {
	private final OrganizatorRepository organizatorRepository;
	private final UserRepository userRepository;

	public OrganizatorController(OrganizatorRepository organizatorRepository, UserRepository userRepository) {
		this.organizatorRepository = organizatorRepository;
		this.userRepository = userRepository;
	}

	@PostMapping("/request")
	public ResponseEntity<String> createRequest(
		Authentication authentication,
		@Valid @RequestBody OrganizatorRequestDto request
	) {
		User currentUser = getCurrentUser(authentication);
		// ADMIN nie składa własnego wniosku o rolę organizatora.
		if (isAdmin(currentUser)) {
			return ResponseEntity.badRequest().body("Admin nie sklada wniosku organizatora.");
		}
		// Dla jednego użytkownika dopuszczamy tylko jeden aktywny wniosek.
		if (organizatorRepository.existsByUserId(currentUser.getId())) {
			return ResponseEntity.badRequest().body("Wniosek dla tego uzytkownika juz istnieje.");
		}

		Organizator organizator = new Organizator();
		organizator.setUserId(currentUser.getId());
		organizator.setFirma(request.firma());
		organizator.setKwalifikacje(request.kwalifikacje());
		organizator.setStrona(request.strona());
		organizator.setZweryfikow(false);
		organizator.setDataUtw(LocalDateTime.now());
		organizatorRepository.save(organizator);

		return ResponseEntity.ok("Wniosek organizatora zostal zapisany.");
	}

	@GetMapping
	public ResponseEntity<List<OrganizatorResponseDto>> getAllRequests(Authentication authentication) {
		User currentUser = getCurrentUser(authentication);
		// Lista wszystkich wniosków jest dostępna wyłącznie dla ADMIN.
		if (!isAdmin(currentUser)) {
			return ResponseEntity.status(403).build();
		}

		List<OrganizatorResponseDto> result = organizatorRepository.findAll().stream()
			.map(this::toDto)
			.toList();
		return ResponseEntity.ok(result);
	}

	@PostMapping("/{id}/approve")
	public ResponseEntity<String> approveRequest(@PathVariable Long id, Authentication authentication) {
		User currentUser = getCurrentUser(authentication);
		// Tylko ADMIN może zatwierdzić wniosek i nadać rolę ORG.
		if (!isAdmin(currentUser)) {
			return ResponseEntity.status(403).body("Brak uprawnien.");
		}

		Organizator organizator = organizatorRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wniosku."));

		User targetUser = userRepository.findById(organizator.getUserId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono uzytkownika dla wniosku."));

		organizator.setZweryfikow(true);
		organizatorRepository.save(organizator);

		// Po akceptacji aktualizujemy rolę użytkownika w tabeli users.
		targetUser.setRola("ORG");
		userRepository.save(targetUser);

		return ResponseEntity.ok("Wniosek zatwierdzony.");
	}

	@DeleteMapping("/{id}/reject")
	public ResponseEntity<String> rejectRequest(@PathVariable Long id, Authentication authentication) {
		User currentUser = getCurrentUser(authentication);
		// Odrzucanie wniosków również jest akcją administracyjną.
		if (!isAdmin(currentUser)) {
			return ResponseEntity.status(403).body("Brak uprawnien.");
		}

		if (!organizatorRepository.existsById(id)) {
			return ResponseEntity.badRequest().body("Nie znaleziono wniosku.");
		}
		organizatorRepository.deleteById(id);
		return ResponseEntity.ok("Wniosek odrzucony i usuniety.");
	}

	private OrganizatorResponseDto toDto(Organizator organizator) {
		// DTO wzbogacamy o login/email z users dla czytelności panelu admina.
		User user = userRepository.findById(organizator.getUserId()).orElse(null);
		return new OrganizatorResponseDto(
			organizator.getId(),
			organizator.getUserId(),
			user != null ? user.getLogin() : "-",
			user != null ? user.getEmail() : "-",
			organizator.getFirma(),
			organizator.getKwalifikacje(),
			organizator.getStrona(),
			organizator.getZweryfikow(),
			organizator.getDataUtw()
		);
	}

	private User getCurrentUser(Authentication authentication) {
		// Wspólna metoda pobiera użytkownika z kontekstu security.
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}
		return userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono aktualnego uzytkownika."));
	}

	private boolean isAdmin(User user) {
		return user.getRola() != null && user.getRola().equalsIgnoreCase("ADMIN");
	}
}
