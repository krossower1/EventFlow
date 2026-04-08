package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.*;
import com.eventflow.com.model.Miejsce;
import com.eventflow.com.model.Sala;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.MiejsceRepository;
import com.eventflow.com.repository.SalaRepository;
import com.eventflow.com.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
	private final UserRepository userRepository;

	public MiejsceController(
		MiejsceRepository miejsceRepository,
		SalaRepository salaRepository,
		UserRepository userRepository
	) {
		this.miejsceRepository = miejsceRepository;
		this.salaRepository = salaRepository;
		this.userRepository = userRepository;
	}

	@PostMapping
	public ResponseEntity<MiejsceResponseDto> createMiejsce(
		Authentication authentication,
		@Valid @RequestBody MiejsceRequestDto request
	) {
		User currentUser = requireOrg(authentication);

		Miejsce miejsce = new Miejsce();
		miejsce.setNazwa(request.nazwa());
		miejsce.setPanstwo("Polska");
		miejsce.setMiasto(request.miasto());
		miejsce.setUlica(request.ulica());
		miejsce.setKodPoczt(request.kodPoczt());
		miejsce.setPojemnosc(request.pojemnosc());
		miejsce.setOpis(request.opis());
		miejsce.setUserId(currentUser.getId());

		Miejsce saved = miejsceRepository.save(miejsce);
		return ResponseEntity.status(CREATED).body(toMiejsceDto(saved));
	}

	@GetMapping("/my")
	public ResponseEntity<List<MiejsceResponseDto>> getMyMiejsca(Authentication authentication) {
		User currentUser = requireOrg(authentication);
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

		if (!miejsce.getUserId().equals(currentUser.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "To miejsce nie nalezy do Ciebie.");
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

	private MiejsceResponseDto toMiejsceDto(Miejsce miejsce) {
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
			miejsce.getPojemnosc(),
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
			sala.getMaPlan()
		);
	}

	private User requireOrg(Authentication authentication) {
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
