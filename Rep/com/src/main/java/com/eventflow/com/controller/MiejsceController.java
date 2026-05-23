package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.*;
import com.eventflow.com.model.Miejsce;
import com.eventflow.com.model.Sala;
import com.eventflow.com.model.SalaMiejsce;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.MiejsceRepository;
import com.eventflow.com.repository.SalaMiejsceRepository;
import com.eventflow.com.repository.SalaRepository;
import com.eventflow.com.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.springframework.http.HttpStatus.*;

@RestController
@RequestMapping("/api/miejsca")
@CrossOrigin(origins = "http://localhost:3000")
public class MiejsceController {
	private final MiejsceRepository miejsceRepository;
	private final SalaRepository salaRepository;
	private final SalaMiejsceRepository salaMiejsceRepository;
	private final UserRepository userRepository;

	public MiejsceController(
		MiejsceRepository miejsceRepository,
		SalaRepository salaRepository,
		SalaMiejsceRepository salaMiejsceRepository,
		UserRepository userRepository
	) {
		this.miejsceRepository = miejsceRepository;
		this.salaRepository = salaRepository;
		this.salaMiejsceRepository = salaMiejsceRepository;
		this.userRepository = userRepository;
	}

	@PostMapping
	public ResponseEntity<MiejsceResponseDto> createMiejsce(
		Authentication authentication,
		@Valid @RequestBody MiejsceRequestDto request
	) {
		// Miejsca mogą tworzyć wyłącznie użytkownicy z rolą ORG.
		User currentUser = requireOrg(authentication);

		Miejsce miejsce = new Miejsce();
		miejsce.setNazwa(request.nazwa());
		miejsce.setPanstwo("Polska");
		miejsce.setMiasto(request.miasto());
		miejsce.setUlica(request.ulica());
		miejsce.setKodPoczt(request.kodPoczt());
		miejsce.setIloscSal(request.iloscSal());
		miejsce.setOpis(request.opis());
		miejsce.setUserId(currentUser.getId());

		Miejsce saved = miejsceRepository.save(miejsce);
		return ResponseEntity.status(CREATED).body(toMiejsceDto(saved));
	}

	@GetMapping("/my")
	public ResponseEntity<List<MiejsceResponseDto>> getMyMiejsca(Authentication authentication) {
		User currentUser = requireOrg(authentication);
		// ORG widzi tylko swoje miejsca, przypisane po user_id.
		List<MiejsceResponseDto> result = miejsceRepository.findByUserId(currentUser.getId()).stream()
			.map(this::toMiejsceDto)
			.toList();
		return ResponseEntity.ok(result);
	}

	@PostMapping("/{miejsceId}/sale")
	public ResponseEntity<SalaResponseDto> addSala(
		@PathVariable Long miejsceId,
		Authentication authentication,
		@Valid @RequestBody SalaRequestDto request
	) {
		User currentUser = requireOrg(authentication);
		Miejsce miejsce = miejsceRepository.findById(miejsceId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono miejsca."));

		// Dodatkowa walidacja własności miejsca przed dodaniem sali.
		if (!miejsce.getUserId().equals(currentUser.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "To miejsce nie nalezy do Ciebie.");
		}
		long aktualnaLiczbaSal = salaRepository.countByMiejsceId(miejsceId);
		if (miejsce.getIloscSal() != null && aktualnaLiczbaSal >= miejsce.getIloscSal()) {
			throw new ResponseStatusException(
				BAD_REQUEST,
				"Osiagnieto limit sal dla tego miejsca. Zwieksz ilosc_sal, aby dodac kolejna sale."
			);
		}

		Sala sala = new Sala();
		sala.setMiejsceId(miejsceId);
		sala.setNazwa(request.nazwa());
		sala.setPojemnosc(request.pojemnosc());
		sala.setPietro(request.pietro());
		sala.setMaPlan(request.maPlan());

		Sala saved = salaRepository.save(sala);
		return ResponseEntity.status(CREATED).body(toSalaDto(saved));
	}

	@PutMapping("/sale/{salaId}/plan")
	@Transactional
	public ResponseEntity<SalaResponseDto> updateSalaPlan(
		@PathVariable Long salaId,
		Authentication authentication,
		@Valid @RequestBody SalaPlanUpdateRequestDto request
	) {
		User currentUser = requireOrg(authentication);
		Sala sala = salaRepository.findById(salaId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono sali."));
		Miejsce miejsce = miejsceRepository.findById(sala.getMiejsceId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono miejsca dla sali."));
		if (!miejsce.getUserId().equals(currentUser.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "Ta sala nie nalezy do Ciebie.");
		}
		if (!Boolean.TRUE.equals(sala.getMaPlan())) {
			throw new ResponseStatusException(BAD_REQUEST, "Ta sala nie obsluguje ukladu planu.");
		}

		sala.setLayoutWidth(request.layoutWidth() == null || request.layoutWidth() < 240 ? 720 : request.layoutWidth());
		sala.setLayoutHeight(request.layoutHeight() == null || request.layoutHeight() < 180 ? 420 : request.layoutHeight());
		sala.getSeats().clear();
		salaMiejsceRepository.deleteBySalaId(sala.getId());
		List<SalaMiejsce> seats = request.seats() == null ? List.of() : request.seats().stream()
			.filter(item -> item != null && item.id() != null && !item.id().isBlank())
			.map(item -> {
				SalaMiejsce seat = new SalaMiejsce();
				seat.setSala(sala);
				seat.setSeatKey(item.id().trim());
				seat.setItemType(normalizeItemType(item.type()));
				seat.setBaseLabel(item.baseLabel() == null || item.baseLabel().isBlank() ? item.id().trim() : item.baseLabel().trim());
				seat.setRowLabel(item.rowLabel() == null || item.rowLabel().isBlank() ? null : item.rowLabel().trim().toUpperCase());
				seat.setX(item.x() == null ? 0 : item.x());
				seat.setY(item.y() == null ? 0 : item.y());
				seat.setWidth(item.width());
				seat.setHeight(item.height());
				seat.setRotation(item.rotation() == null ? 0 : item.rotation());
				return seat;
			})
			.toList();
		salaMiejsceRepository.saveAll(seats);
		sala.getSeats().addAll(seats);
		return ResponseEntity.ok(toSalaDto(sala));
	}

	@PatchMapping("/{miejsceId}/ilosc-sal")
	public ResponseEntity<MiejsceResponseDto> increaseIloscSal(
		@PathVariable Long miejsceId,
		Authentication authentication,
		@Valid @RequestBody MiejsceIloscSalUpdateRequestDto request
	) {
		User currentUser = requireOrg(authentication);
		Miejsce miejsce = miejsceRepository.findById(miejsceId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono miejsca."));
		if (!miejsce.getUserId().equals(currentUser.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "To miejsce nie nalezy do Ciebie.");
		}
		if (!Boolean.TRUE.equals(request.potwierdzenie())) {
			throw new ResponseStatusException(BAD_REQUEST, "Potwierdzenie jest wymagane do zmiany ilosc_sal.");
		}
		if (request.nowaIloscSal() == null || request.nowaIloscSal() <= 0) {
			throw new ResponseStatusException(BAD_REQUEST, "Nowa ilosc_sal musi byc dodatnia.");
		}

		int obecnaIloscSal = miejsce.getIloscSal() == null ? 0 : miejsce.getIloscSal();
		if (request.nowaIloscSal() < obecnaIloscSal) {
			throw new ResponseStatusException(BAD_REQUEST, "Nie mozna zmniejszyc ilosc_sal.");
		}
		if (request.nowaIloscSal().equals(obecnaIloscSal)) {
			return ResponseEntity.ok(toMiejsceDto(miejsce));
		}

		miejsce.setIloscSal(request.nowaIloscSal());
		Miejsce updated = miejsceRepository.save(miejsce);
		return ResponseEntity.ok(toMiejsceDto(updated));
	}

	private MiejsceResponseDto toMiejsceDto(Miejsce miejsce) {
		// Każde miejsce zwraca też listę przypisanych sal.
		List<SalaResponseDto> sale = salaRepository.findByMiejsceId(miejsce.getId()).stream()
			.map(this::toSalaDto)
			.toList();
		return new MiejsceResponseDto(
			miejsce.getId(),
			miejsce.getNazwa(),
			miejsce.getPanstwo(),
			miejsce.getMiasto(),
			miejsce.getUlica(),
			miejsce.getKodPoczt(),
			miejsce.getIloscSal(),
			miejsce.getOpis(),
			sale
		);
	}

	private SalaResponseDto toSalaDto(Sala sala) {
		return new SalaResponseDto(
			sala.getId(),
			sala.getMiejsceId(),
			sala.getNazwa(),
			sala.getPojemnosc(),
			sala.getPietro(),
			sala.getMaPlan(),
			sala.getLayoutWidth() == null ? 720 : sala.getLayoutWidth(),
			sala.getLayoutHeight() == null ? 420 : sala.getLayoutHeight(),
			salaMiejsceRepository.findBySalaId(sala.getId()).stream()
				.map(this::toSalaMiejsceDto)
				.toList()
		);
	}

	private SalaMiejsceDto toSalaMiejsceDto(SalaMiejsce seat) {
		return new SalaMiejsceDto(
			seat.getSeatKey(),
			seat.getItemType(),
			seat.getBaseLabel(),
			seat.getRowLabel(),
			seat.getX(),
			seat.getY(),
			seat.getWidth(),
			seat.getHeight(),
			seat.getRotation()
		);
	}

	private String normalizeItemType(String itemType) {
		return "ROW".equalsIgnoreCase(itemType) ? "ROW" : "SEAT";
	}

	private User requireOrg(Authentication authentication) {
		// Wspólna metoda wymusza uwierzytelnienie i rolę ORG.
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
