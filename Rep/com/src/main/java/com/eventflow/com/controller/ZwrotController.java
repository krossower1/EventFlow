package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.ZwrotListItemDto;
import com.eventflow.com.controller.dto.ZwrotRequestDto;
import com.eventflow.com.model.Bilet;
import com.eventflow.com.model.User;
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
import com.eventflow.com.service.NotificationService;
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

import java.util.Comparator;
import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/zwroty")
@CrossOrigin(origins = "http://localhost:3000")
public class ZwrotController {
	private final UserRepository userRepository;
	private final WystBiletRepository wystBiletRepository;
	private final ZamowienieRepository zamowienieRepository;
	private final BiletRepository biletRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final ZwrotRepository zwrotRepository;
	private final NotificationService notificationService;

	public ZwrotController(
		UserRepository userRepository,
		WystBiletRepository wystBiletRepository,
		ZamowienieRepository zamowienieRepository,
		BiletRepository biletRepository,
		WydarzenieRepository wydarzenieRepository,
		ZwrotRepository zwrotRepository,
		NotificationService notificationService
	) {
		this.userRepository = userRepository;
		this.wystBiletRepository = wystBiletRepository;
		this.zamowienieRepository = zamowienieRepository;
		this.biletRepository = biletRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.zwrotRepository = zwrotRepository;
		this.notificationService = notificationService;
	}

	@PostMapping("/wyst-bilety/{wystBiletId}")
	@Transactional
	public ResponseEntity<String> createZwrot(
		@PathVariable Long wystBiletId,
		Authentication authentication,
		@RequestBody ZwrotRequestDto request
	) {
		User user = requireAuthenticatedUser(authentication);

		if (request.powod() == null || request.powod().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Podaj powod prosby o zwrot.");
		}

		WystBilet wystBilet = wystBiletRepository.findById(wystBiletId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono biletu."));
		Zamowienie zamowienie = zamowienieRepository.findById(wystBilet.getZamId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono zamowienia dla biletu."));

		if (!zamowienie.getUserId().equals(user.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "Ten bilet nie nalezy do Ciebie.");
		}

		if (zwrotRepository.findByPlatnId(zamowienie.getPlatnId()).isPresent()) {
			throw new ResponseStatusException(BAD_REQUEST, "Dla tego zakupu istnieje juz prosba o zwrot.");
		}

		Bilet bilet = biletRepository.findById(wystBilet.getBiletId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono klasy biletu."));

		Zwrot zwrot = new Zwrot();
		zwrot.setPlatnId(zamowienie.getPlatnId());
		zwrot.setKwota(bilet.getCena());
		zwrot.setWaluta(bilet.getWaluta());
		zwrot.setPowod(request.powod().trim());
		zwrot.setStan("oczekuje");
		zwrot.setOtrzymany(true);
		zwrot.setPrzyznany(false);
		Zwrot saved = zwrotRepository.save(zwrot);
		notificationService.notifyNewRefundRequest(saved);

		return ResponseEntity.ok("Prosba o zwrot zostala wyslana.");
	}

	@GetMapping
	public ResponseEntity<List<ZwrotListItemDto>> getZwroty(Authentication authentication) {
		User user = requireAuthenticatedUser(authentication);
		if (!"ADMIN".equalsIgnoreCase(user.getRola())) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko administrator moze przegladac zwroty.");
		}

		List<ZwrotListItemDto> result = zwrotRepository.findAllByOrderByIdDesc().stream()
			.sorted(Comparator.comparing(Zwrot::getId).reversed())
			.map(this::toZwrotListItem)
			.toList();

		return ResponseEntity.ok(result);
	}

	@PostMapping("/{zwrotId}/approve")
	@Transactional
	public ResponseEntity<String> approveZwrot(@PathVariable Long zwrotId, Authentication authentication) {
		User user = requireAuthenticatedUser(authentication);
		if (!"ADMIN".equalsIgnoreCase(user.getRola())) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko administrator moze zatwierdzac zwroty.");
		}

		Zwrot zwrot = zwrotRepository.findById(zwrotId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono prosby o zwrot."));
		zwrot.setPrzyznany(true);
		zwrot.setStan("zaakceptowana");
		zwrot.setOtrzymany(true);
		zwrotRepository.save(zwrot);

		releaseSeatsAfterApprovedRefund(zwrot);

		return ResponseEntity.ok("Prosba o zwrot zostala zaakceptowana.");
	}

	private void releaseSeatsAfterApprovedRefund(Zwrot zwrot) {
		Zamowienie zamowienie = zamowienieRepository.findFirstByPlatnId(zwrot.getPlatnId());
		if (zamowienie == null) {
			return;
		}
		User buyer = userRepository.findById(zamowienie.getUserId()).orElse(null);
		List<WystBilet> wystBilety = wystBiletRepository.findByZamIdIn(List.of(zamowienie.getId()));
		for (WystBilet wystBilet : wystBilety) {
			String seatId = wystBilet.getSeatId();
			Bilet bilet = biletRepository.findById(wystBilet.getBiletId()).orElse(null);

			wystBilet.setSeatId(null);
			wystBilet.setStan("zwrocony");
			wystBiletRepository.save(wystBilet);

			if (bilet != null && bilet.getWydarzenieId() != null) {
				Wydarzenie wydarzenie = wydarzenieRepository.findById(bilet.getWydarzenieId()).orElse(null);
				if (buyer != null && wydarzenie != null) {
					notificationService.notifyOrganizerEventRefund(wydarzenie, buyer, bilet.getKlasa());
				}
			}

			if (seatId != null && !seatId.isBlank() && bilet != null && bilet.getWydarzenieId() != null) {
				Wydarzenie wydarzenie = wydarzenieRepository.findById(bilet.getWydarzenieId()).orElse(null);
				String eventTitle = wydarzenie != null ? wydarzenie.getTytul() : null;
				notificationService.notifyObservedSeatFreed(
					bilet.getWydarzenieId(),
					seatId,
					eventTitle,
					bilet.getKlasa()
				);
			}
		}
	}

	@PostMapping("/{zwrotId}/reject")
	public ResponseEntity<String> rejectZwrot(@PathVariable Long zwrotId, Authentication authentication) {
		User user = requireAuthenticatedUser(authentication);
		if (!"ADMIN".equalsIgnoreCase(user.getRola())) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko administrator moze odrzucac zwroty.");
		}

		Zwrot zwrot = zwrotRepository.findById(zwrotId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono prosby o zwrot."));
		zwrot.setPrzyznany(false);
		zwrot.setStan("odrzucona");
		zwrot.setOtrzymany(true);
		zwrotRepository.save(zwrot);

		return ResponseEntity.ok("Prosba o zwrot zostala odrzucona.");
	}

	private ZwrotListItemDto toZwrotListItem(Zwrot zwrot) {
		Zamowienie zamowienie = zamowienieRepository.findFirstByPlatnId(zwrot.getPlatnId());
		User user = zamowienie == null ? null : userRepository.findById(zamowienie.getUserId()).orElse(null);
		WystBilet wystBilet = zamowienie == null ? null : wystBiletRepository.findByZamIdIn(List.of(zamowienie.getId())).stream().findFirst().orElse(null);
		Bilet bilet = wystBilet == null ? null : biletRepository.findById(wystBilet.getBiletId()).orElse(null);
		Wydarzenie wydarzenie = bilet == null ? null : wydarzenieRepository.findById(bilet.getWydarzenieId()).orElse(null);

		return new ZwrotListItemDto(
			zwrot.getId(),
			zwrot.getPlatnId(),
			user != null ? user.getLogin() : "-",
			wydarzenie != null ? wydarzenie.getTytul() : "-",
			bilet != null ? bilet.getKlasa() : "-",
			zwrot.getKwota(),
			zwrot.getWaluta(),
			zwrot.getPowod(),
			zwrot.getStan(),
			zwrot.getOtrzymany(),
			zwrot.getPrzyznany()
		);
	}

	private User requireAuthenticatedUser(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}
		return userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono uzytkownika."));
	}
}
