package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.PatchNotesResponse;
import com.eventflow.com.controller.dto.PatchNotesUpdateRequest;
import com.eventflow.com.model.PatchNotes;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.PatchNotesRepository;
import com.eventflow.com.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class PatchNotesController {
	private static final Long PATCH_NOTES_ID = 1L;

	private final PatchNotesRepository patchNotesRepository;
	private final UserRepository userRepository;

	public PatchNotesController(PatchNotesRepository patchNotesRepository, UserRepository userRepository) {
		this.patchNotesRepository = patchNotesRepository;
		this.userRepository = userRepository;
	}

	@GetMapping("/patch-notes")
	public PatchNotesResponse getPatchNotes() {
		return toResponse(getOrCreatePatchNotes());
	}

	@PutMapping("/patch-notes")
	public PatchNotesResponse updatePatchNotes(
		Authentication authentication,
		@RequestBody PatchNotesUpdateRequest request
	) {
		requireAdminUser(authentication);
		if (request.dateLabel() == null || request.dateLabel().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Podaj etykietę daty.");
		}
		if (request.items() == null || request.items().stream().allMatch(item -> item == null || item.isBlank())) {
			throw new ResponseStatusException(BAD_REQUEST, "Dodaj co najmniej jedną notatkę.");
		}

		PatchNotes patchNotes = getOrCreatePatchNotes();
		patchNotes.setDateLabel(request.dateLabel().trim());
		patchNotes.setItemsText(serializeItems(request.items()));
		return toResponse(patchNotesRepository.save(patchNotes));
	}

	private PatchNotes getOrCreatePatchNotes() {
		return patchNotesRepository.findById(PATCH_NOTES_ID).orElseGet(() -> {
			PatchNotes patchNotes = new PatchNotes();
			patchNotes.setId(PATCH_NOTES_ID);
			patchNotes.setDateLabel("Zmiany dnia 29.05.2026");
			patchNotes.setItemsText(String.join(
				"\n",
				"Nieaktywne i zakończone wydarzenia są ukryte na liście wydarzeń.",
				"Obserwowane wydarzenia pojawiają się wyżej i można je odobserwować.",
				"Po zaakceptowaniu zwrotu bilet znika z listy biletów użytkownika.",
				"Panel główny dostał krótki przewodnik po najważniejszych zakładkach."
			));
			return patchNotesRepository.save(patchNotes);
		});
	}

	private PatchNotesResponse toResponse(PatchNotes patchNotes) {
		return new PatchNotesResponse(
			patchNotes.getDateLabel(),
			deserializeItems(patchNotes.getItemsText())
		);
	}

	private List<String> deserializeItems(String itemsText) {
		if (itemsText == null || itemsText.isBlank()) {
			return List.of();
		}
		return Arrays.stream(itemsText.split("\\R"))
			.map(String::trim)
			.filter(line -> !line.isBlank())
			.collect(Collectors.toList());
	}

	private String serializeItems(List<String> items) {
		return items.stream()
			.map(String::trim)
			.filter(line -> !line.isBlank())
			.collect(Collectors.joining("\n"));
	}

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
}
