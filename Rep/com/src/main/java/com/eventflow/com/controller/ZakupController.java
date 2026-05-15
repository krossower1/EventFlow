package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.DostepnyBiletDto;
import com.eventflow.com.controller.dto.ZakupBiletuRequestDto;
import com.eventflow.com.model.Bilet;
import com.eventflow.com.model.Platnosc;
import com.eventflow.com.model.PozZam;
import com.eventflow.com.model.Sala;
import com.eventflow.com.model.User;
import com.eventflow.com.model.Wydarzenie;
import com.eventflow.com.model.WystBilet;
import com.eventflow.com.model.Zamowienie;
import com.eventflow.com.repository.BiletRepository;
import com.eventflow.com.repository.PlatnoscRepository;
import com.eventflow.com.repository.PozZamRepository;
import com.eventflow.com.repository.SalaRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import com.eventflow.com.repository.WystBiletRepository;
import com.eventflow.com.repository.ZamowienieRepository;
import com.eventflow.com.service.QrCodeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/zakupy")
@CrossOrigin(origins = "http://localhost:3000")
public class ZakupController {
	private final UserRepository userRepository;
	private final BiletRepository biletRepository;
	private final PozZamRepository pozZamRepository;
	private final PlatnoscRepository platnoscRepository;
	private final ZamowienieRepository zamowienieRepository;
	private final WystBiletRepository wystBiletRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final SalaRepository salaRepository;

	private final QrCodeService qrCodeService;

	public ZakupController(
		UserRepository userRepository,
		BiletRepository biletRepository,
		PozZamRepository pozZamRepository,
		PlatnoscRepository platnoscRepository,
		ZamowienieRepository zamowienieRepository,
		WystBiletRepository wystBiletRepository,
		WydarzenieRepository wydarzenieRepository,
		SalaRepository salaRepository,
		QrCodeService qrCodeService
	) {
		this.userRepository = userRepository;
		this.biletRepository = biletRepository;
		this.pozZamRepository = pozZamRepository;
		this.platnoscRepository = platnoscRepository;
		this.zamowienieRepository = zamowienieRepository;
		this.wystBiletRepository = wystBiletRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.salaRepository = salaRepository;
		this.qrCodeService = qrCodeService;
	}

	@GetMapping("/wydarzenia/{wydarzenieId}/bilety")
	public ResponseEntity<List<DostepnyBiletDto>> getDostepneBilety(
		@PathVariable Long wydarzenieId,
		Authentication authentication
	) {
		requireAuthenticatedUser(authentication);
		LocalDateTime now = LocalDateTime.now();

		List<DostepnyBiletDto> result = biletRepository.findByWydarzenieId(wydarzenieId).stream()
			.map(bilet -> toDostepnyBiletDto(bilet, now))
			.filter(item -> item != null)
			.toList();

		return ResponseEntity.ok(result);
	}

	@PostMapping("/wydarzenia/{wydarzenieId}")
	@Transactional
	public ResponseEntity<String> kupBilet(
		@PathVariable Long wydarzenieId,
		Authentication authentication,
		@RequestBody ZakupBiletuRequestDto request
	) {
		User user = requireAuthenticatedUser(authentication);

		if (request.biletId() == null || request.ilosc() == null || request.ilosc() <= 0) {
			throw new ResponseStatusException(BAD_REQUEST, "Podaj poprawny bilet i ilosc do zakupu.");
		}
		if (!Boolean.TRUE.equals(request.potwierdzPlatnosc())) {
			throw new ResponseStatusException(BAD_REQUEST, "Potwierdz platnosc przed finalizacja zakupu.");
		}

		Bilet bilet = biletRepository.findById(request.biletId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Wybrany bilet nie istnieje."));
		if (!bilet.getWydarzenieId().equals(wydarzenieId)) {
			throw new ResponseStatusException(BAD_REQUEST, "Wybrany bilet nie nalezy do tego wydarzenia.");
		}
		Wydarzenie wydarzenie = wydarzenieRepository.findById(wydarzenieId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));
		Sala sala = salaRepository.findById(wydarzenie.getSalaId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono sali dla wydarzenia."));
		boolean requiresSeatSelection = Boolean.TRUE.equals(sala.getMaPlan()) && sala.getPlanJson() != null && !sala.getPlanJson().isBlank();

		LocalDateTime now = LocalDateTime.now();
		if (bilet.getStartSprzedazy() != null && bilet.getStartSprzedazy().isAfter(now)) {
			throw new ResponseStatusException(BAD_REQUEST, "Sprzedaz tego biletu jeszcze sie nie rozpoczela.");
		}
		if (bilet.getKoniecSprzedazy() != null && bilet.getKoniecSprzedazy().isBefore(now)) {
			throw new ResponseStatusException(BAD_REQUEST, "Sprzedaz tego biletu jest juz zakonczona.");
		}

		PozZam pozZam = pozZamRepository.findByBiletId(bilet.getId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Brak puli dostepnych biletow dla wybranej klasy."));
		if (pozZam.getIlosc() == null || pozZam.getIlosc() < request.ilosc()) {
			throw new ResponseStatusException(BAD_REQUEST, "Brak wymaganej liczby biletow w dostepnej puli.");
		}
		if (requiresSeatSelection) {
			List<String> assignedSeatIds = parseSeatIds(bilet.getSeatIds());
			if (request.ilosc() != 1) {
				throw new ResponseStatusException(BAD_REQUEST, "Dla sal z planem mozesz kupic tylko jedno miejsce na raz.");
			}
			if (request.seatId() == null || request.seatId().isBlank()) {
				throw new ResponseStatusException(BAD_REQUEST, "Wybierz miejsce z planu sali.");
			}
			if (!assignedSeatIds.contains(request.seatId())) {
				throw new ResponseStatusException(BAD_REQUEST, "Wybrane miejsce nie nalezy do tej klasy biletu.");
			}
			boolean occupied = wystBiletRepository.findByBiletIdIn(
				biletRepository.findByWydarzenieId(wydarzenieId).stream().map(Bilet::getId).toList()
			).stream().anyMatch(item -> request.seatId().equals(item.getSeatId()));
			if (occupied) {
				throw new ResponseStatusException(BAD_REQUEST, "Wybrane miejsce jest juz zajete.");
			}
		}

		Platnosc platnosc = new Platnosc();
		platnosc.setMetoda("CHECKBOX");
		platnosc.setData(now);
		platnosc.setZgodnosc(true);
		platnosc.setStan("zakonczona");
		platnosc.setTranzId(generateTransactionId());
		Platnosc savedPlatnosc = platnoscRepository.save(platnosc);

		Zamowienie zamowienie = new Zamowienie();
		zamowienie.setUserId(user.getId());
		zamowienie.setPlatnId(savedPlatnosc.getId());
		zamowienie.setPozZamId(pozZam.getId());
		zamowienie.setData(now);
		zamowienie.setIlosc(request.ilosc());
		zamowienie.setWaluta("PLN");
		zamowienie.setStan("zakonczone");
		Zamowienie savedZamowienie = zamowienieRepository.save(zamowienie);

		pozZam.setIlosc(pozZam.getIlosc() - request.ilosc());
		pozZamRepository.save(pozZam);

		for (int i = 0; i < request.ilosc(); i++) {
			WystBilet wystBilet = new WystBilet();
			wystBilet.setZamId(savedZamowienie.getId());
			wystBilet.setBiletId(bilet.getId());
			wystBilet.setStan("aktywny");
			wystBilet.setWydanyData(now);
			wystBilet.setUzytyData(null);
			wystBilet.setKod(generateTicketCode(savedZamowienie.getId(), i));
			wystBilet.setSeatId(requiresSeatSelection ? request.seatId() : null);
			String qrCodeData = qrCodeService.generateQrCodeDataUrl(wystBilet.getKod());
			wystBilet.setQrCode(qrCodeData);
			wystBiletRepository.save(wystBilet);
		}

		return ResponseEntity.status(CREATED).body("Zakup zakonczony pomyslnie.");
	}

	private DostepnyBiletDto toDostepnyBiletDto(Bilet bilet, LocalDateTime now) {
		Wydarzenie wydarzenie = wydarzenieRepository.findById(bilet.getWydarzenieId()).orElse(null);
		Sala sala = wydarzenie == null ? null : salaRepository.findById(wydarzenie.getSalaId()).orElse(null);
		boolean requiresSeatSelection = sala != null && Boolean.TRUE.equals(sala.getMaPlan()) && sala.getPlanJson() != null && !sala.getPlanJson().isBlank();
		List<String> assignedSeatIds = parseSeatIds(bilet.getSeatIds());
		List<String> occupiedSeatIds = requiresSeatSelection
			? wystBiletRepository.findByBiletIdIn(biletRepository.findByWydarzenieId(bilet.getWydarzenieId()).stream().map(Bilet::getId).toList())
				.stream()
				.map(WystBilet::getSeatId)
				.filter(seatId -> seatId != null && !seatId.isBlank())
				.distinct()
				.toList()
			: List.of();

		PozZam pozZam = pozZamRepository.findByBiletId(bilet.getId()).orElse(null);
		if (pozZam == null || pozZam.getIlosc() == null || pozZam.getIlosc() <= 0) {
			return null;
		}
		if (bilet.getStartSprzedazy() != null && bilet.getStartSprzedazy().isAfter(now)) {
			return null;
		}
		if (bilet.getKoniecSprzedazy() != null && bilet.getKoniecSprzedazy().isBefore(now)) {
			return null;
		}
		if (requiresSeatSelection && assignedSeatIds.isEmpty()) {
			return null;
		}

		return new DostepnyBiletDto(
			bilet.getId(),
			bilet.getKlasa(),
			bilet.getCena(),
			bilet.getWaluta(),
			pozZam.getIlosc(),
			bilet.getStartSprzedazy(),
			bilet.getKoniecSprzedazy(),
			requiresSeatSelection,
			assignedSeatIds,
			requiresSeatSelection ? sala.getPlanJson() : null,
			occupiedSeatIds
		);
	}

	private List<String> parseSeatIds(String seatIds) {
		if (seatIds == null || seatIds.isBlank()) {
			return List.of();
		}
		return Arrays.stream(seatIds.split(","))
			.map(String::trim)
			.filter(item -> !item.isBlank())
			.distinct()
			.toList();
	}

	private User requireAuthenticatedUser(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}
		return userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono uzytkownika."));
	}

	private String generateTransactionId() {
		long value = ThreadLocalRandom.current().nextLong(100_000_000L, 999_999_999L);
		return String.valueOf(value);
	}

	private String generateTicketCode(Long zamowienieId, int index) {
		long suffix = ThreadLocalRandom.current().nextLong(1000L, 9999L);
		return "EV-" + zamowienieId + "-" + index + "-" + suffix;
	}
}
