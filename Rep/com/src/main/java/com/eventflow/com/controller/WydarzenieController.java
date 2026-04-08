package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.*;
import com.eventflow.com.model.*;
import com.eventflow.com.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/wydarzenia")
@CrossOrigin(origins = "http://localhost:3000")
public class WydarzenieController {
	private static final String NOWA_KATEGORIA = "__NOWA_KATEGORIA__";

	private final UserRepository userRepository;
	private final OrganizatorRepository organizatorRepository;
	private final MiejsceRepository miejsceRepository;
	private final KategoriaRepository kategoriaRepository;
	private final WydarzenieRepository wydarzenieRepository;

	public WydarzenieController(
		UserRepository userRepository,
		OrganizatorRepository organizatorRepository,
		MiejsceRepository miejsceRepository,
		KategoriaRepository kategoriaRepository,
		WydarzenieRepository wydarzenieRepository
	) {
		this.userRepository = userRepository;
		this.organizatorRepository = organizatorRepository;
		this.miejsceRepository = miejsceRepository;
		this.kategoriaRepository = kategoriaRepository;
		this.wydarzenieRepository = wydarzenieRepository;
	}

	@GetMapping("/options")
	public ResponseEntity<WydarzenieOptionsDto> getOptions(Authentication authentication) {
		User user = requireOrgUser(authentication);

		List<MiejsceOptionDto> miejsca = miejsceRepository.findByUserId(user.getId()).stream()
			.map(m -> new MiejsceOptionDto(m.getId(), m.getNazwa()))
			.toList();

		List<KategoriaDto> kategorie = kategoriaRepository.findAll().stream()
			.map(k -> new KategoriaDto(k.getId(), k.getNazwa(), k.getOpis()))
			.toList();

		return ResponseEntity.ok(new WydarzenieOptionsDto(miejsca, kategorie));
	}

	@GetMapping("/my")
	public ResponseEntity<List<WydarzenieListItemDto>> getMyWydarzenia(Authentication authentication) {
		User user = requireOrgUser(authentication);
		Organizator organizator = organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId())
			.orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "Brak aktywnego profilu organizatora."));

		List<WydarzenieListItemDto> result = wydarzenieRepository.findByOrgId(organizator.getId()).stream()
			.map(w -> new WydarzenieListItemDto(
				w.getId(),
				w.getTytul(),
				w.getStatus(),
				miejsceRepository.findById(w.getMiejsceId()).map(Miejsce::getNazwa).orElse("-"),
				kategoriaRepository.findById(w.getKategoriaId()).map(Kategoria::getNazwa).orElse("-"),
				w.getDataRozp(),
				w.getDataZamk()
			))
			.toList();

		return ResponseEntity.ok(result);
	}

	@PostMapping
	public ResponseEntity<String> createWydarzenie(
		Authentication authentication,
		@RequestBody WydarzenieCreateRequestDto request
	) {
		User user = requireOrgUser(authentication);
		Organizator organizator = organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId())
			.orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "Brak aktywnego profilu organizatora."));

		if (request.miejsceId() == null || request.tytul() == null || request.tytul().isBlank()
			|| request.rola() == null || request.rola().isBlank()
			|| request.status() == null || request.status().isBlank()
			|| request.dataRozp() == null || request.dataZamk() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Wypelnij wymagane pola wydarzenia.");
		}

		Miejsce miejsce = miejsceRepository.findById(request.miejsceId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Wybrane miejsce nie istnieje."));
		if (!miejsce.getUserId().equals(user.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "Mozesz wybrac tylko swoje miejsce.");
		}

		Long kategoriaId = resolveKategoriaId(request);

		Wydarzenie wydarzenie = new Wydarzenie();
		wydarzenie.setOrgId(organizator.getId());
		wydarzenie.setMiejsceId(miejsce.getId());
		wydarzenie.setTytul(request.tytul());
		wydarzenie.setOpis(request.opis());
		wydarzenie.setKategoriaId(kategoriaId);
		wydarzenie.setRola(request.rola());
		wydarzenie.setDataUtw(LocalDateTime.now());
		wydarzenie.setStatus(request.status());
		wydarzenie.setDataRozp(request.dataRozp());
		wydarzenie.setDataZamk(request.dataZamk());

		wydarzenieRepository.save(wydarzenie);
		return ResponseEntity.status(CREATED).body("Wydarzenie zostalo dodane.");
	}

	private Long resolveKategoriaId(WydarzenieCreateRequestDto request) {
		boolean createNowa = Boolean.TRUE.equals(request.createNowaKategoria());
		if (createNowa) {
			if (request.nowaKategoriaNazwa() == null || request.nowaKategoriaNazwa().isBlank()) {
				throw new ResponseStatusException(BAD_REQUEST, "Podaj nazwe nowej kategorii.");
			}
			Kategoria kategoria = new Kategoria();
			kategoria.setNazwa(request.nowaKategoriaNazwa());
			kategoria.setOpis(request.nowaKategoriaOpis());
			return kategoriaRepository.save(kategoria).getId();
		}

		if (request.kategoriaId() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Wybierz istniejaca kategorie.");
		}
		return kategoriaRepository.findById(request.kategoriaId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Wybrana kategoria nie istnieje."))
			.getId();
	}

	private User requireOrgUser(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}
		User user = userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono uzytkownika."));
		if (user.getRola() == null || !user.getRola().equalsIgnoreCase("ORG")) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko konto ORG moze wykonac te akcje.");
		}
		return user;
	}
}
