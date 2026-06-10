package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.PurchasedBiletDto;
import com.eventflow.com.controller.dto.UserBiletDto;
import com.eventflow.com.model.Bilet;
import com.eventflow.com.model.Organizator;
import com.eventflow.com.model.User;
import com.eventflow.com.model.Wydarzenie;
import com.eventflow.com.model.WystBilet;
import com.eventflow.com.model.Zamowienie;
import com.eventflow.com.model.Zwrot;
import com.eventflow.com.repository.BiletRepository;
import com.eventflow.com.repository.OrganizatorRepository;
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
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/bilety")
@CrossOrigin(origins = "http://localhost:3000")
public class BiletController {
	private final UserRepository userRepository;
	private final OrganizatorRepository organizatorRepository;
	private final ZamowienieRepository zamowienieRepository;
	private final WystBiletRepository wystBiletRepository;
	private final BiletRepository biletRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final ZwrotRepository zwrotRepository;

	public BiletController(
		UserRepository userRepository,
		OrganizatorRepository organizatorRepository,
		ZamowienieRepository zamowienieRepository,
		WystBiletRepository wystBiletRepository,
		BiletRepository biletRepository,
		WydarzenieRepository wydarzenieRepository,
		ZwrotRepository zwrotRepository
	) {
		this.userRepository = userRepository;
		this.organizatorRepository = organizatorRepository;
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
				if ("zwrocony".equalsIgnoreCase(String.valueOf(wystBilet.getStan()))) {
					return false;
				}
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

	@GetMapping("/sold")
	public ResponseEntity<List<PurchasedBiletDto>> getSoldBilety(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}

		User user = userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono uzytkownika."));

		boolean isAdmin = isAdmin(user);
		boolean isOrg = isOrg(user);
		if (!isAdmin && !isOrg) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko ORG lub ADMIN moze przegladac sprzedane bilety.");
		}

		List<WystBilet> wystBilety;
		if (isAdmin) {
			wystBilety = wystBiletRepository.findAll();
		} else {
			Organizator organizator = organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId())
				.orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "Brak aktywnego profilu organizatora."));
			List<Long> wydarzenieIds = wydarzenieRepository.findByOrgId(organizator.getId()).stream()
				.map(Wydarzenie::getId)
				.toList();
			if (wydarzenieIds.isEmpty()) {
				return ResponseEntity.ok(List.of());
			}
			List<Long> biletIds = biletRepository.findByWydarzenieIdIn(wydarzenieIds).stream()
				.map(Bilet::getId)
				.toList();
			if (biletIds.isEmpty()) {
				return ResponseEntity.ok(List.of());
			}
			wystBilety = wystBiletRepository.findByBiletIdIn(biletIds);
		}

		if (wystBilety.isEmpty()) {
			return ResponseEntity.ok(List.of());
		}

		Map<Long, Zamowienie> zamowienieById = zamowienieRepository.findAllById(
			wystBilety.stream().map(WystBilet::getZamId).distinct().toList()
		).stream().collect(Collectors.toMap(Zamowienie::getId, Function.identity()));

		Set<Long> userIds = zamowienieById.values().stream()
			.map(Zamowienie::getUserId)
			.filter(Objects::nonNull)
			.collect(Collectors.toSet());
		Map<Long, User> userById = userRepository.findAllById(userIds).stream()
			.collect(Collectors.toMap(User::getId, Function.identity()));

		Map<Long, Bilet> biletById = biletRepository.findAllById(
			wystBilety.stream().map(WystBilet::getBiletId).distinct().toList()
		).stream().collect(Collectors.toMap(Bilet::getId, Function.identity()));

		Map<Long, Wydarzenie> wydarzenieById = wydarzenieRepository.findAllById(
			biletById.values().stream().map(Bilet::getWydarzenieId).distinct().toList()
		).stream().collect(Collectors.toMap(Wydarzenie::getId, Function.identity()));

		List<PurchasedBiletDto> result = wystBilety.stream()
			.sorted(Comparator.comparing(WystBilet::getWydanyData, Comparator.nullsLast(Comparator.reverseOrder())))
			.map(wystBilet -> {
				Zamowienie zamowienie = zamowienieById.get(wystBilet.getZamId());
				User buyer = zamowienie == null ? null : userById.get(zamowienie.getUserId());
				Bilet bilet = biletById.get(wystBilet.getBiletId());
				Wydarzenie wydarzenie = bilet == null ? null : wydarzenieById.get(bilet.getWydarzenieId());

				return new PurchasedBiletDto(
					wystBilet.getId(),
					buyer != null ? buyer.getImie() : null,
					buyer != null ? buyer.getNazwisko() : null,
					wydarzenie != null ? wydarzenie.getId() : null,
					wydarzenie != null ? wydarzenie.getTytul() : "-",
					bilet != null ? bilet.getKlasa() : "-",
					bilet != null ? bilet.getCena() : null,
					bilet != null ? bilet.getWaluta() : "PLN",
					wystBilet.getKod(),
					wystBilet.getStan(),
					wystBilet.getWydanyData(),
					wystBilet.getQrCode()
				);
			})
			.toList();

		return ResponseEntity.ok(result);
	}

	private boolean isAdmin(User user) {
		return user.getRola() != null && user.getRola().equalsIgnoreCase("ADMIN");
	}

	private boolean isOrg(User user) {
		return user.getRola() != null && user.getRola().equalsIgnoreCase("ORG");
	}
}
