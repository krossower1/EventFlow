package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.UserBiletDto;
import com.eventflow.com.model.Bilet;
import com.eventflow.com.model.Wydarzenie;
import com.eventflow.com.model.WystBilet;
import com.eventflow.com.model.Zamowienie;
import com.eventflow.com.model.Zwrot;
import com.eventflow.com.repository.BiletRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import com.eventflow.com.repository.WystBiletRepository;
import com.eventflow.com.repository.ZamowienieRepository;
import com.eventflow.com.repository.ZwrotRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/bilety")
@CrossOrigin(origins = "http://localhost:3000")
public class BiletController {
	private final UserRepository userRepository;
	private final ZamowienieRepository zamowienieRepository;
	private final WystBiletRepository wystBiletRepository;
	private final BiletRepository biletRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final ZwrotRepository zwrotRepository;

	public BiletController(
		UserRepository userRepository,
		ZamowienieRepository zamowienieRepository,
		WystBiletRepository wystBiletRepository,
		BiletRepository biletRepository,
		WydarzenieRepository wydarzenieRepository,
		ZwrotRepository zwrotRepository
	) {
		this.userRepository = userRepository;
		this.zamowienieRepository = zamowienieRepository;
		this.wystBiletRepository = wystBiletRepository;
		this.biletRepository = biletRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.zwrotRepository = zwrotRepository;
	}

	@GetMapping("/my")
	public ResponseEntity<List<UserBiletDto>> getMyBilety(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}

		var user = userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono uzytkownika."));

		List<Zamowienie> zamowienia = zamowienieRepository.findByUserId(user.getId());
		if (zamowienia.isEmpty()) {
			return ResponseEntity.ok(List.of());
		}

		Map<Long, Zamowienie> zamowienieById = zamowienia.stream()
			.collect(Collectors.toMap(Zamowienie::getId, Function.identity()));

		List<WystBilet> wystBilety = wystBiletRepository.findByZamIdIn(
			zamowienia.stream().map(Zamowienie::getId).toList()
		);

		Map<Long, Bilet> biletById = biletRepository.findAllById(
			wystBilety.stream().map(WystBilet::getBiletId).distinct().toList()
		).stream().collect(Collectors.toMap(Bilet::getId, Function.identity()));

		Map<Long, Wydarzenie> wydarzenieById = wydarzenieRepository.findAllById(
			biletById.values().stream().map(Bilet::getWydarzenieId).distinct().toList()
		).stream().collect(Collectors.toMap(Wydarzenie::getId, Function.identity()));

		List<UserBiletDto> result = wystBilety.stream()
			.filter(wystBilet -> {
				// Filter out tickets with stan "zwrocony"
				if ("zwrocony".equalsIgnoreCase(String.valueOf(wystBilet.getStan()))) {
					return false;
				}
				// Filter out tickets with accepted refunds
				Zamowienie zamowienie = zamowienieById.get(wystBilet.getZamId());
				if (zamowienie != null) {
					Zwrot zwrot = zwrotRepository.findByPlatnId(zamowienie.getPlatnId()).orElse(null);
					if (zwrot != null && Boolean.TRUE.equals(zwrot.getPrzyznany())) {
						return false;
					}
				}
				return true;
			})
			.sorted(Comparator.comparing(WystBilet::getWydanyData, Comparator.nullsLast(Comparator.reverseOrder())))
			.map(wystBilet -> {
				Zamowienie zamowienie = zamowienieById.get(wystBilet.getZamId());
				Bilet bilet = biletById.get(wystBilet.getBiletId());
				Wydarzenie wydarzenie = bilet == null ? null : wydarzenieById.get(bilet.getWydarzenieId());
				Zwrot zwrot = zamowienie == null ? null : zwrotRepository.findByPlatnId(zamowienie.getPlatnId()).orElse(null);

				return new UserBiletDto(
					wystBilet.getId(),
					wystBilet.getKod(),
					wystBilet.getStan(),
					wystBilet.getWydanyData(),
					wystBilet.getUzytyData(),
					bilet != null ? bilet.getKlasa() : "-",
					wydarzenie != null ? wydarzenie.getTytul() : "-",
					bilet != null ? bilet.getCena() : null,
					bilet != null ? bilet.getWaluta() : "PLN",
					zwrot != null,
					zwrot != null ? zwrot.getStan() : null,
					wystBilet.getQrCode()
				);
			})
			.toList();

		return ResponseEntity.ok(result);
	}
}
