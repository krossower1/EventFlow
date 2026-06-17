package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.KategoriaDto;
import com.eventflow.com.controller.dto.BiletCreateRequestDto;
import com.eventflow.com.controller.dto.BiletPostepDto;
import com.eventflow.com.controller.dto.KategoriaSystemowaRequestDto;
import com.eventflow.com.controller.dto.OpiniaDto;
import com.eventflow.com.controller.dto.OpiniaRequestDto;
import com.eventflow.com.controller.dto.PersonelDto;
import com.eventflow.com.controller.dto.PersonelRequestDto;
import com.eventflow.com.controller.dto.SalaOptionDto;
import com.eventflow.com.controller.dto.WydarzenieCreateRequestDto;
import com.eventflow.com.controller.dto.WydarzenieStatusUpdateRequestDto;
import com.eventflow.com.controller.dto.WydarzenieDetailDto;
import com.eventflow.com.controller.dto.WydarzenieListItemDto;
import com.eventflow.com.controller.dto.WydarzenieOptionsDto;
import com.eventflow.com.controller.dto.ZgloszenieDto;
import com.eventflow.com.controller.dto.ZgloszenieRequestDto;
import com.eventflow.com.model.Bilet;
import com.eventflow.com.model.Kategoria;
import com.eventflow.com.model.Miejsce;
import com.eventflow.com.model.Opinia;
import com.eventflow.com.model.Organizator;
import com.eventflow.com.model.Personel;
import com.eventflow.com.model.PozZam;
import com.eventflow.com.model.Sala;
import com.eventflow.com.model.SalaMiejsce;
import com.eventflow.com.model.User;
import com.eventflow.com.model.Wydarzenie;
import com.eventflow.com.model.Zgloszenie;
import com.eventflow.com.repository.BiletRepository;
import com.eventflow.com.repository.KategoriaRepository;
import com.eventflow.com.repository.MiejsceRepository;
import com.eventflow.com.repository.OpiniaRepository;
import com.eventflow.com.repository.OrganizatorRepository;
import com.eventflow.com.repository.PersonelRepository;
import com.eventflow.com.repository.PozZamRepository;
import com.eventflow.com.repository.SalaRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import com.eventflow.com.repository.ZgloszenieRepository;
import com.eventflow.com.service.NotificationService;
import com.eventflow.com.service.UserCascadeDeleteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/wydarzenia")
@CrossOrigin(origins = "http://localhost:3000")
public class WydarzenieController {
	private static final String STATUS_AKTYWNY = "AKTYWNY";
	private static final String STATUS_DRAFT = "DRAFT";
	private static final String STATUS_NIEAKTYWNY = "NIEAKTYWNY";

	private final UserRepository userRepository;
	private final OrganizatorRepository organizatorRepository;
	private final MiejsceRepository miejsceRepository;
	private final SalaRepository salaRepository;
	private final KategoriaRepository kategoriaRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final BiletRepository biletRepository;
	private final PozZamRepository pozZamRepository;
	private final OpiniaRepository opiniaRepository;
	private final ZgloszenieRepository zgloszenieRepository;
	private final PersonelRepository personelRepository;
	private final UserCascadeDeleteService userCascadeDeleteService;
	private final NotificationService notificationService;

	public WydarzenieController(
		UserRepository userRepository,
		OrganizatorRepository organizatorRepository,
		MiejsceRepository miejsceRepository,
		SalaRepository salaRepository,
		KategoriaRepository kategoriaRepository,
		WydarzenieRepository wydarzenieRepository,
		BiletRepository biletRepository,
		PozZamRepository pozZamRepository,
		OpiniaRepository opiniaRepository,
		ZgloszenieRepository zgloszenieRepository,
		PersonelRepository personelRepository,
		UserCascadeDeleteService userCascadeDeleteService,
		NotificationService notificationService
	) {
		this.userRepository = userRepository;
		this.organizatorRepository = organizatorRepository;
		this.miejsceRepository = miejsceRepository;
		this.salaRepository = salaRepository;
		this.kategoriaRepository = kategoriaRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.biletRepository = biletRepository;
		this.pozZamRepository = pozZamRepository;
		this.opiniaRepository = opiniaRepository;
		this.zgloszenieRepository = zgloszenieRepository;
		this.personelRepository = personelRepository;
		this.userCascadeDeleteService = userCascadeDeleteService;
		this.notificationService = notificationService;
	}

	@GetMapping("/options")
	public ResponseEntity<WydarzenieOptionsDto> getOptions(Authentication authentication) {
		User user = requireOrgUser(authentication);

		List<Miejsce> mojeMiejsca = miejsceRepository.findByUserId(user.getId());
		List<Long> miejsceIds = mojeMiejsca.stream().map(Miejsce::getId).toList();
		java.util.Map<Long, String> miejsceNameById = mojeMiejsca.stream()
			.collect(java.util.stream.Collectors.toMap(Miejsce::getId, Miejsce::getNazwa));

		List<SalaOptionDto> sale = miejsceIds.isEmpty()
			? List.of()
			: salaRepository.findByMiejsceIdIn(miejsceIds).stream()
			.map(s -> new SalaOptionDto(
				s.getId(),
				s.getNazwa(),
				miejsceNameById.getOrDefault(s.getMiejsceId(), "-"),
				s.getMaPlan(),
				s.getSeats().stream()
					.map(this::toSalaMiejsceDto)
					.toList()
			))
			.toList();

		List<KategoriaDto> kategorieSystemowe = kategoriaRepository.findBySystemowaTrue().stream()
			.map(k -> new KategoriaDto(k.getId(), k.getNazwa(), k.getOpis()))
			.toList();
		List<KategoriaDto> kategorieUzytkownika = kategoriaRepository
			.findByCreatedByUserIdAndSystemowaFalse(user.getId()).stream()
			.map(k -> new KategoriaDto(k.getId(), k.getNazwa(), k.getOpis()))
			.toList();

		return ResponseEntity.ok(new WydarzenieOptionsDto(sale, kategorieSystemowe, kategorieUzytkownika));
	}

	@GetMapping("/kategorie/systemowe")
	public ResponseEntity<List<KategoriaDto>> getSystemKategorie(Authentication authentication) {
		requireAuthenticatedUser(authentication);
		List<KategoriaDto> kategorieSystemowe = kategoriaRepository.findBySystemowaTrue().stream()
			.map(k -> new KategoriaDto(k.getId(), k.getNazwa(), k.getOpis()))
			.toList();
		return ResponseEntity.ok(kategorieSystemowe);
	}

	@PostMapping("/kategorie/systemowe")
	public ResponseEntity<String> createSystemKategoria(
		Authentication authentication,
		@RequestBody KategoriaSystemowaRequestDto request
	) {
		User user = requireAuthenticatedUser(authentication);
		if (!isAdmin(user)) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko ADMIN moze tworzyc systemowe kategorie.");
		}
		if (request.nazwa() == null || request.nazwa().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Nazwa kategorii jest wymagana.");
		}
		Kategoria kategoria = new Kategoria();
		kategoria.setNazwa(request.nazwa().trim());
		kategoria.setOpis(request.opis());
		kategoria.setCreatedByUserId(user.getId());
		kategoria.setSystemowa(true);
		kategoriaRepository.save(kategoria);
		return ResponseEntity.status(CREATED).body("Systemowa kategoria zostala dodana.");
	}

	@GetMapping("/my")
	public ResponseEntity<List<WydarzenieListItemDto>> getMyWydarzenia(Authentication authentication) {
		User user = requireOrgUser(authentication);
		Organizator organizator = organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId())
			.orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "Brak aktywnego profilu organizatora."));

		List<WydarzenieListItemDto> result = wydarzenieRepository.findByOrgId(organizator.getId()).stream()
			.map(this::toListItem)
			.toList();

		return ResponseEntity.ok(result);
	}

	@GetMapping
	public ResponseEntity<List<WydarzenieListItemDto>> getAllWydarzenia(Authentication authentication) {
		requireAuthenticatedUser(authentication);

		List<WydarzenieListItemDto> result = wydarzenieRepository.findAll().stream()
			.sorted(Comparator.comparing(Wydarzenie::getDataRozp, Comparator.nullsLast(LocalDateTime::compareTo)))
			.map(this::toListItem)
			.toList();

		return ResponseEntity.ok(result);
	}

	@GetMapping("/open")
	public ResponseEntity<List<WydarzenieListItemDto>> getOpenWydarzenia(Authentication authentication) {
		User user = requireAuthenticatedUser(authentication);
		LocalDateTime now = LocalDateTime.now();

		List<Wydarzenie> wydarzeniaDoPokazania = new ArrayList<>(
			wydarzenieRepository.findAll().stream()
				.filter(w -> w.getDataZamk() != null && w.getDataZamk().isAfter(now))
				.filter(w -> STATUS_AKTYWNY.equals(normalizeStatus(w.getStatus())))
				.toList()
		);

		if (isOrg(user)) {
			organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId()).ifPresent(organizator ->
				wydarzenieRepository.findByOrgId(organizator.getId()).stream()
					.filter(w -> w.getDataZamk() != null && w.getDataZamk().isAfter(now))
					.filter(w -> STATUS_DRAFT.equals(normalizeStatus(w.getStatus())))
					.filter(w -> wydarzeniaDoPokazania.stream().noneMatch(existing -> existing.getId().equals(w.getId())))
					.forEach(wydarzeniaDoPokazania::add)
			);
		}

		List<WydarzenieListItemDto> result = wydarzeniaDoPokazania.stream()
			.sorted(Comparator.comparing(Wydarzenie::getDataRozp, Comparator.nullsLast(LocalDateTime::compareTo)))
			.map(this::toListItem)
			.toList();

		return ResponseEntity.ok(result);
	}

	@GetMapping("/{id}")
	public ResponseEntity<WydarzenieDetailDto> getWydarzenieDetails(@PathVariable Long id, Authentication authentication) {
		User user = requireAuthenticatedUser(authentication);

		Wydarzenie wydarzenie = wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));

		return ResponseEntity.ok(toDetailItem(wydarzenie, user));
	}

	@PostMapping("/{id}/personel")
	public ResponseEntity<String> addPersonel(
		@PathVariable Long id,
		Authentication authentication,
		@RequestBody PersonelRequestDto request
	) {
		User user = requireAuthenticatedUser(authentication);
		Wydarzenie wydarzenie = wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));
		if (!canManagePersonel(user, wydarzenie)) {
			throw new ResponseStatusException(FORBIDDEN, "Brak uprawnien do zarzadzania personelem.");
		}
		if (request.userId() == null || request.rola() == null || request.rola().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Wybierz uzytkownika i role.");
		}
		User selectedUser = userRepository.findById(request.userId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wybranego uzytkownika."));
		if (personelRepository.countByWydIdAndUserIdAndRolaIgnoreCase(id, request.userId(), request.rola().trim()) > 0) {
			throw new ResponseStatusException(BAD_REQUEST, "Ta rola jest juz przypisana temu uzytkownikowi.");
		}

		Personel personel = new Personel();
		personel.setWydId(id);
		personel.setUserId(selectedUser.getId());
		personel.setRola(request.rola().trim());
		personel.setDataZajet(LocalDateTime.now());
		personelRepository.save(personel);
		return ResponseEntity.ok("Personel zostal dodany.");
	}

	@DeleteMapping("/{wydarzenieId}/personel/{personelId}")
	public ResponseEntity<String> deletePersonel(
		@PathVariable Long wydarzenieId,
		@PathVariable Long personelId,
		Authentication authentication
	) {
		User user = requireAuthenticatedUser(authentication);
		Wydarzenie wydarzenie = wydarzenieRepository.findById(wydarzenieId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));
		Personel personel = personelRepository.findById(personelId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono przypisania personelu."));
		if (!personel.getWydId().equals(wydarzenieId)) {
			throw new ResponseStatusException(BAD_REQUEST, "To przypisanie nie nalezy do tego wydarzenia.");
		}
		boolean canDeleteOwn = personel.getUserId().equals(user.getId());
		if (!canDeleteOwn && !canManagePersonel(user, wydarzenie) && !isAdmin(user)) {
			throw new ResponseStatusException(FORBIDDEN, "Brak uprawnien do usuniecia tej roli.");
		}

		personelRepository.delete(personel);
		return ResponseEntity.ok("Rola personelu zostala anulowana.");
	}

	@DeleteMapping("/{id}")
	@Transactional
	public ResponseEntity<String> deleteWydarzenie(
		@PathVariable Long id,
		Authentication authentication
	) {
		User user = requireAuthenticatedUser(authentication);
		Wydarzenie wydarzenie = wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));
		if (!isAdmin(user) && !canManagePersonel(user, wydarzenie)) {
			throw new ResponseStatusException(FORBIDDEN, "Brak uprawnien do usuniecia wydarzenia.");
		}

		userCascadeDeleteService.deleteWydarzeniaWithDependencies(List.of(id));
		return ResponseEntity.ok("Wydarzenie zostalo usuniete.");
	}

	@PostMapping("/{id}/zgloszenia")
	public ResponseEntity<String> addZgloszenie(
		@PathVariable Long id,
		Authentication authentication,
		@RequestBody ZgloszenieRequestDto request
	) {
		User user = requireAuthenticatedUser(authentication);
		if (!isUser(user)) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko zwykly uzytkownik moze zglaszac wydarzenia.");
		}
		if (request.tytul() == null || request.tytul().isBlank() || request.opis() == null || request.opis().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Wypelnij tytul i opis zgloszenia.");
		}

		wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));

		Zgloszenie zgloszenie = new Zgloszenie();
		zgloszenie.setUserId(user.getId());
		zgloszenie.setWydId(id);
		zgloszenie.setTytul(request.tytul().trim());
		zgloszenie.setOpis(request.opis().trim());
		zgloszenie.setStan("otwarte");
		zgloszenie.setUtworzony(LocalDateTime.now());
		zgloszenie.setZamkniety(null);
		zgloszenieRepository.save(zgloszenie);

		return ResponseEntity.ok("Zgloszenie zostalo zapisane.");
	}

	@PostMapping("/{wydarzenieId}/zgloszenia/{zgloszenieId}/close")
	public ResponseEntity<String> closeZgloszenie(
		@PathVariable Long wydarzenieId,
		@PathVariable Long zgloszenieId,
		Authentication authentication
	) {
		User user = requireAuthenticatedUser(authentication);
		Wydarzenie wydarzenie = wydarzenieRepository.findById(wydarzenieId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));
		if (!canManageZgloszenia(user, wydarzenie)) {
			throw new ResponseStatusException(FORBIDDEN, "Brak uprawnien do zamkniecia zgloszenia.");
		}

		Zgloszenie zgloszenie = zgloszenieRepository.findById(zgloszenieId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono zgloszenia."));
		if (!zgloszenie.getWydId().equals(wydarzenieId)) {
			throw new ResponseStatusException(BAD_REQUEST, "Zgloszenie nie nalezy do tego wydarzenia.");
		}

		zgloszenie.setStan("zamkniete");
		zgloszenie.setZamkniety(LocalDateTime.now());
		zgloszenieRepository.save(zgloszenie);
		return ResponseEntity.ok("Zgloszenie zostalo zamkniete.");
	}

	@PostMapping("/{id}/opinie")
	public ResponseEntity<String> addOpinia(
		@PathVariable Long id,
		Authentication authentication,
		@RequestBody OpiniaRequestDto request
	) {
		User user = requireAuthenticatedUser(authentication);

		if (request.ocena() == null || request.ocena() < 1 || request.ocena() > 5) {
			throw new ResponseStatusException(BAD_REQUEST, "Ocena musi byc w zakresie 1-5.");
		}
		if (request.opis() == null || request.opis().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Opis opinii jest wymagany.");
		}

		Wydarzenie wydarzenie = wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));

		Opinia opinia = new Opinia();
		opinia.setWydId(id);
		opinia.setUserId(user.getId());
		opinia.setOcena(request.ocena());
		opinia.setOpis(request.opis().trim());
		opinia.setData(LocalDateTime.now());
		opiniaRepository.save(opinia);
		notificationService.notifyOrganizerEventReview(wydarzenie, user, request.ocena());

		return ResponseEntity.ok("Opinia zostala dodana.");
	}

	@DeleteMapping("/{wydarzenieId}/opinie/{opiniaId}")
	public ResponseEntity<String> deleteOpinia(
		@PathVariable Long wydarzenieId,
		@PathVariable Long opiniaId,
		Authentication authentication
	) {
		User user = requireAuthenticatedUser(authentication);

		Opinia opinia = opiniaRepository.findById(opiniaId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono opinii."));
		if (!opinia.getWydId().equals(wydarzenieId)) {
			throw new ResponseStatusException(BAD_REQUEST, "Opinia nie nalezy do tego wydarzenia.");
		}
		if (!opinia.getUserId().equals(user.getId()) && !isAdmin(user)) {
			throw new ResponseStatusException(FORBIDDEN, "Mozesz usunac tylko swoja opinie lub jako administrator.");
		}

		opiniaRepository.delete(opinia);
		return ResponseEntity.ok("Opinia zostala usunieta.");
	}

	@PostMapping
	@Transactional
	public ResponseEntity<String> createWydarzenie(
		Authentication authentication,
		@RequestBody WydarzenieCreateRequestDto request
	) {
		User user = requireOrgUser(authentication);
		Organizator organizator = organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId())
			.orElseThrow(() -> new ResponseStatusException(FORBIDDEN, "Brak aktywnego profilu organizatora."));

		if (request.salaId() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Sala jest wymagana.");
		}
		if (request.tytul() == null || request.tytul().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Tytul jest wymagany.");
		}
		if (request.status() == null || request.status().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Status jest wymagany.");
		}
		if (request.dataRozp() == null || request.dataRozp().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Data rozpoczecia jest wymagana.");
		}
		if (request.dataZamk() == null || request.dataZamk().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Data zakonczenia jest wymagana.");
		}

		LocalDateTime dataRozp;
		LocalDateTime dataZamk;
		try {
			dataRozp = LocalDateTime.parse(request.dataRozp());
			dataZamk = LocalDateTime.parse(request.dataZamk());
		} catch (Exception e) {
			throw new ResponseStatusException(BAD_REQUEST, "Nieprawidlowy format daty.");
		}

		String normalizedStatus = normalizeStatus(request.status());
		validateCreateStatus(user, normalizedStatus);

		Sala sala = salaRepository.findById(request.salaId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Wybrana sala nie istnieje."));
		validateBilety(request.bilety(), sala, null);
		Miejsce miejsce = miejsceRepository.findById(sala.getMiejsceId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Miejsce przypisane do sali nie istnieje."));
		if (!miejsce.getUserId().equals(user.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "Mozesz wybrac tylko sale ze swoich miejsc.");
		}

		Long kategoriaId = resolveKategoriaId(request, user);

		Wydarzenie wydarzenie = new Wydarzenie();
		wydarzenie.setOrgId(organizator.getId());
		wydarzenie.setSalaId(sala.getId());
		wydarzenie.setTytul(request.tytul());
		wydarzenie.setOpis(request.opis());
		wydarzenie.setKategoriaId(kategoriaId);
		wydarzenie.setDataUtw(LocalDateTime.now());
		wydarzenie.setStatus(normalizedStatus);
		wydarzenie.setDataRozp(dataRozp);
		wydarzenie.setDataZamk(dataZamk);

		Wydarzenie savedWydarzenie = wydarzenieRepository.save(wydarzenie);
		saveBilety(savedWydarzenie.getId(), request.bilety(), sala);
		notificationService.notifyNewEvent(savedWydarzenie, user.getId());
		return ResponseEntity.status(CREATED).body("Wydarzenie zostalo dodane.");
	}

	@PutMapping("/{id}/status")
	@Transactional
	public ResponseEntity<String> updateWydarzenieStatus(
		@PathVariable Long id,
		@RequestBody WydarzenieStatusUpdateRequestDto request,
		Authentication authentication
	) {
		User user = requireAuthenticatedUser(authentication);
		if (request == null || request.status() == null || request.status().isBlank()) {
			throw new ResponseStatusException(BAD_REQUEST, "Podaj nowy status wydarzenia.");
		}

		Wydarzenie wydarzenie = wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));

		if (!isAdmin(user) && !canManagePersonel(user, wydarzenie)) {
			throw new ResponseStatusException(FORBIDDEN, "Brak uprawnien do zmiany statusu wydarzenia.");
		}

		String newStatus = normalizeStatus(request.status());
		String previousStatus = wydarzenie.getStatus() != null ? normalizeStatus(wydarzenie.getStatus()) : "";

		if (STATUS_NIEAKTYWNY.equals(newStatus) && !isAdmin(user)) {
			throw new ResponseStatusException(FORBIDDEN, "Status NIEAKTYWNY moze nadac tylko administrator.");
		}
		validateCreateStatus(user, newStatus);

		wydarzenie.setStatus(newStatus);
		wydarzenieRepository.save(wydarzenie);

		if (STATUS_NIEAKTYWNY.equals(newStatus) && !STATUS_NIEAKTYWNY.equals(previousStatus)) {
			notificationService.notifyObservedEventEnd(wydarzenie);
		}

		return ResponseEntity.ok("Status wydarzenia zostal zaktualizowany.");
	}

	@PostMapping("/{id}/bilety")
	@Transactional
	public ResponseEntity<String> addBiletyToWydarzenie(
		@PathVariable Long id,
		Authentication authentication,
		@RequestBody List<BiletCreateRequestDto> bilety
	) {
		User user = requireOrgUser(authentication);
		
		Wydarzenie wydarzenie = wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));
		
		// Check if user is the creator of the event
		Organizator organizator = organizatorRepository.findById(wydarzenie.getOrgId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono organizatora wydarzenia."));
		if (!organizator.getUserId().equals(user.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "Mozesz dodawac bilety tylko do swoich wydarzen.");
		}
		
		Sala sala = salaRepository.findById(wydarzenie.getSalaId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono sali wydarzenia."));
		
		validateBilety(bilety, sala, id);
		saveBilety(id, bilety, sala);
		
		return ResponseEntity.ok("Bilety zostaly dodane do wydarzenia.");
	}

	private Long resolveKategoriaId(WydarzenieCreateRequestDto request, User user) {
		boolean createNowa = Boolean.TRUE.equals(request.createNowaKategoria());
		if (createNowa) {
			if (request.nowaKategoriaNazwa() == null || request.nowaKategoriaNazwa().isBlank()) {
				throw new ResponseStatusException(BAD_REQUEST, "Podaj nazwe nowej kategorii.");
			}
			Kategoria kategoria = new Kategoria();
			kategoria.setNazwa(request.nowaKategoriaNazwa());
			kategoria.setOpis(request.nowaKategoriaOpis());
			kategoria.setCreatedByUserId(user.getId());
			kategoria.setSystemowa(false);
			return kategoriaRepository.save(kategoria).getId();
		}

		if (request.kategoriaId() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Wybierz istniejaca kategorie.");
		}
		Kategoria kategoria = kategoriaRepository.findById(request.kategoriaId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Wybrana kategoria nie istnieje."));
		boolean systemowa = Boolean.TRUE.equals(kategoria.getSystemowa());
		boolean userOwn = user.getId().equals(kategoria.getCreatedByUserId());
		if (!systemowa && !userOwn) {
			throw new ResponseStatusException(BAD_REQUEST, "Mozesz wybrac tylko kategorie systemowa lub swoja.");
		}
		return kategoria.getId();
	}

	private WydarzenieListItemDto toListItem(Wydarzenie wydarzenie) {
		List<BiletPostepDto> postepyBiletow = getBiletPostepy(wydarzenie.getId());
		boolean maDostepneBilety = postepyBiletow.stream().anyMatch(item -> item.wszystkie() > item.sprzedane());

		Sala sala = salaRepository.findById(wydarzenie.getSalaId()).orElse(null);
		Miejsce miejsce = sala != null ? miejsceRepository.findById(sala.getMiejsceId()).orElse(null) : null;
		String miejsceNazwa = miejsce != null ? miejsce.getNazwa() : "-";
		String miasto = miejsce != null ? miejsce.getMiasto() : "-";
		String kodPocztowy = miejsce != null ? miejsce.getKodPoczt() : "-";
		String ulica = miejsce != null ? miejsce.getUlica() : "-";

		Organizator organizator = organizatorRepository.findById(wydarzenie.getOrgId()).orElse(null);
		User creator = organizator != null ? userRepository.findById(organizator.getUserId()).orElse(null) : null;
		String creatorLogin = creator != null ? creator.getLogin() : "-";

		List<Opinia> opinie = opiniaRepository.findByWydIdOrderByDataDesc(wydarzenie.getId());
		Double averageRating = opinie.isEmpty() ? null : opinie.stream()
			.mapToInt(Opinia::getOcena)
			.average()
			.orElse(Double.NaN);

		return new WydarzenieListItemDto(
			wydarzenie.getId(),
			wydarzenie.getTytul(),
			normalizeStatus(wydarzenie.getStatus()),
			sala != null ? sala.getNazwa() : "-",
			wydarzenie.getKategoriaId(),
			kategoriaRepository.findById(wydarzenie.getKategoriaId()).map(Kategoria::getNazwa).orElse("-"),
			wydarzenie.getDataRozp(),
			wydarzenie.getDataZamk(),
			maDostepneBilety,
			postepyBiletow,
			miejsceNazwa,
			miasto,
			kodPocztowy,
			ulica,
			creatorLogin,
			averageRating
		);
	}

	private WydarzenieDetailDto toDetailItem(Wydarzenie wydarzenie, User user) {
		List<BiletPostepDto> postepyBiletow = getBiletPostepy(wydarzenie.getId());
		boolean maDostepneBilety = postepyBiletow.stream().anyMatch(item -> item.wszystkie() > item.sprzedane());
		List<ZgloszenieDto> zgloszenia = canManageZgloszenia(user, wydarzenie) ? getZgloszenia(wydarzenie.getId()) : List.of();
		boolean canManagePersonel = canManagePersonel(user, wydarzenie);

		Sala sala = salaRepository.findById(wydarzenie.getSalaId()).orElse(null);
		Miejsce miejsce = sala != null ? miejsceRepository.findById(sala.getMiejsceId()).orElse(null) : null;
		String miejsceNazwa = miejsce != null ? miejsce.getNazwa() : "-";
		String miasto = miejsce != null ? miejsce.getMiasto() : "-";
		String kodPocztowy = miejsce != null ? miejsce.getKodPoczt() : "-";
		String ulica = miejsce != null ? miejsce.getUlica() : "-";

		Organizator organizator = organizatorRepository.findById(wydarzenie.getOrgId()).orElse(null);
		User creator = organizator != null ? userRepository.findById(organizator.getUserId()).orElse(null) : null;
		String creatorLogin = creator != null ? creator.getLogin() : "-";

		List<Opinia> opinie = opiniaRepository.findByWydIdOrderByDataDesc(wydarzenie.getId());
		Double averageRating = opinie.isEmpty() ? null : opinie.stream()
			.mapToInt(Opinia::getOcena)
			.average()
			.orElse(Double.NaN);

		Integer salaPojemnosc = postepyBiletow.stream()
			.mapToInt(BiletPostepDto::wszystkie)
			.sum();

		return new WydarzenieDetailDto(
			wydarzenie.getId(),
			wydarzenie.getTytul(),
			wydarzenie.getOpis(),
			normalizeStatus(wydarzenie.getStatus()),
			sala != null ? sala.getNazwa() : "-",
			kategoriaRepository.findById(wydarzenie.getKategoriaId()).map(Kategoria::getNazwa).orElse("-"),
			wydarzenie.getDataRozp(),
			wydarzenie.getDataZamk(),
			maDostepneBilety,
			canManagePersonel,
			postepyBiletow,
			getPersonel(wydarzenie.getId()),
			getOpinie(wydarzenie.getId()),
			zgloszenia,
			miejsceNazwa,
			miasto,
			kodPocztowy,
			ulica,
			creatorLogin,
			averageRating,
			salaPojemnosc
		);
	}

	private List<BiletPostepDto> getBiletPostepy(Long wydarzenieId) {
		return biletRepository.findByWydarzenieId(wydarzenieId).stream()
			.map(bilet -> {
				int wszystkie = bilet.getIlosc() == null ? 0 : bilet.getIlosc();
				int pozostale = pozZamRepository.findByBiletId(bilet.getId())
					.map(PozZam::getIlosc)
					.orElse(0);
				int sprzedane = Math.max(wszystkie - pozostale, 0);
				String kategoriaBiletu = bilet.getKategoriaBiletu() != null ? bilet.getKategoriaBiletu() : "miejscówka";
				String startSprzedazy = bilet.getStartSprzedazy() != null ? bilet.getStartSprzedazy().toString() : null;
				String koniecSprzedazy = bilet.getKoniecSprzedazy() != null ? bilet.getKoniecSprzedazy().toString() : null;
				return new BiletPostepDto(bilet.getId(), bilet.getKlasa(), kategoriaBiletu, sprzedane, wszystkie, startSprzedazy, koniecSprzedazy);
			})
			.toList();
	}

	private List<OpiniaDto> getOpinie(Long wydarzenieId) {
		return opiniaRepository.findByWydIdOrderByDataDesc(wydarzenieId).stream()
			.map(opinia -> new OpiniaDto(
				opinia.getId(),
				opinia.getUserId(),
				userRepository.findById(opinia.getUserId()).map(User::getLogin).orElse("-"),
				opinia.getOcena(),
				opinia.getOpis(),
				opinia.getData()
			))
			.toList();
	}

	private List<ZgloszenieDto> getZgloszenia(Long wydarzenieId) {
		return zgloszenieRepository.findByWydIdOrderByUtworzonyDesc(wydarzenieId).stream()
			.map(zgloszenie -> new ZgloszenieDto(
				zgloszenie.getId(),
				zgloszenie.getUserId(),
				userRepository.findById(zgloszenie.getUserId()).map(User::getLogin).orElse("-"),
				zgloszenie.getTytul(),
				zgloszenie.getOpis(),
				zgloszenie.getStan(),
				zgloszenie.getUtworzony(),
				zgloszenie.getZamkniety()
			))
			.toList();
	}

	private List<PersonelDto> getPersonel(Long wydarzenieId) {
		return personelRepository.findByWydIdOrderByDataZajetDesc(wydarzenieId).stream()
			.map(item -> {
				User person = userRepository.findById(item.getUserId()).orElse(null);
				return new PersonelDto(
					item.getId(),
					item.getUserId(),
					person != null ? person.getLogin() : "-",
					person != null ? person.getImie() : "-",
					person != null ? person.getNazwisko() : "-",
					item.getRola(),
					item.getDataZajet()
				);
			})
			.toList();
	}

	private void validateBilety(List<BiletCreateRequestDto> bilety, Sala sala, Long wydarzenieId) {
		if (bilety == null || bilety.isEmpty()) {
			throw new ResponseStatusException(BAD_REQUEST, "Dodaj co najmniej jeden typ biletu.");
		}

		boolean hasSalaPlan = Boolean.TRUE.equals(sala.getMaPlan()) && sala.getSeats() != null && !sala.getSeats().isEmpty();
		Set<String> salaSeatIds = hasSalaPlan
			? sala.getSeats().stream().map(SalaMiejsce::getSeatKey).filter(item -> item != null && !item.isBlank()).collect(java.util.stream.Collectors.toSet())
			: Set.of();
		
		Set<String> existingSeatIds = new java.util.HashSet<>();
		if (wydarzenieId != null && hasSalaPlan) {
			List<Bilet> existingBilety = biletRepository.findByWydarzenieId(wydarzenieId);
			for (Bilet existingBilet : existingBilety) {
				if (existingBilet.getSeatIds() != null && !existingBilet.getSeatIds().isBlank()) {
					String[] seats = existingBilet.getSeatIds().split(",");
					for (String seat : seats) {
						existingSeatIds.add(seat.trim());
					}
				}
			}
		}
		
		Set<String> assignedSeatIds = new java.util.HashSet<>(existingSeatIds);

		for (BiletCreateRequestDto bilet : bilety) {
			if (bilet == null
				|| bilet.klasa() == null || bilet.klasa().isBlank()
				|| bilet.cena() == null
				|| bilet.ilosc() == null) {
				throw new ResponseStatusException(BAD_REQUEST, "Wypelnij wszystkie wymagane pola biletu.");
			}
			if (bilet.cena().signum() < 0) {
				throw new ResponseStatusException(BAD_REQUEST, "Cena biletu nie moze byc ujemna.");
			}
			if (bilet.ilosc() <= 0) {
				throw new ResponseStatusException(BAD_REQUEST, "Ilosc biletow musi byc wieksza od zera.");
			}
			if (bilet.startSprzedazy() != null && !bilet.startSprzedazy().isBlank()
				&& bilet.koniecSprzedazy() != null && !bilet.koniecSprzedazy().isBlank()) {
				try {
					LocalDateTime start = LocalDateTime.parse(bilet.startSprzedazy());
					LocalDateTime koniec = LocalDateTime.parse(bilet.koniecSprzedazy());
					if (koniec.isBefore(start)) {
						throw new ResponseStatusException(BAD_REQUEST, "Data konca sprzedazy biletu nie moze byc wczesniejsza niz data startu.");
					}
				} catch (Exception e) {
					throw new ResponseStatusException(BAD_REQUEST, "Nieprawidlowy format daty biletu.");
				}
			}
			if (bilet.waluta() != null && !bilet.waluta().isBlank() && !"PLN".equalsIgnoreCase(bilet.waluta())) {
				throw new ResponseStatusException(BAD_REQUEST, "Waluta biletu musi byc ustawiona na PLN.");
			}
			if (hasSalaPlan) {
				String kategoriaBiletu = bilet.kategoriaBiletu() != null ? bilet.kategoriaBiletu() : "miejscówka";
				if ("miejscówka".equals(kategoriaBiletu)) {
					List<String> seatIds = normalizeSeatIds(bilet.seatIds());
					if (seatIds.isEmpty()) {
						throw new ResponseStatusException(BAD_REQUEST, "Dla miejscówek przypisz co najmniej jedno miejsce do kazdej klasy biletu.");
					}
					if (bilet.ilosc() != seatIds.size()) {
						throw new ResponseStatusException(BAD_REQUEST, "Liczba biletow musi byc rowna liczbie przypisanych miejsc.");
					}
					for (String seatId : seatIds) {
						if (!salaSeatIds.contains(seatId)) {
							throw new ResponseStatusException(BAD_REQUEST, "Wybrane miejsce nie nalezy do planu sali.");
						}
						if (!assignedSeatIds.add(seatId)) {
							throw new ResponseStatusException(BAD_REQUEST, "To miejsce jest juz przypisane do innej klasy biletow.");
						}
					}
				}
			}
		}
	}

	private void saveBilety(Long wydarzenieId, List<BiletCreateRequestDto> bilety, Sala sala) {
		boolean hasSalaPlan = Boolean.TRUE.equals(sala.getMaPlan()) && sala.getSeats() != null && !sala.getSeats().isEmpty();
		for (BiletCreateRequestDto requestBilet : bilety) {
			List<String> seatIds = normalizeSeatIds(requestBilet.seatIds());
			String kategoriaBiletu = requestBilet.kategoriaBiletu() != null ? requestBilet.kategoriaBiletu() : "miejscówka";
			boolean isMiejscowka = "miejscówka".equals(kategoriaBiletu);
			
			Bilet bilet = new Bilet();
			bilet.setWydarzenieId(wydarzenieId);
			bilet.setKlasa(requestBilet.klasa().trim());
			bilet.setCena(requestBilet.cena());
			bilet.setWaluta("PLN");
			bilet.setIlosc(hasSalaPlan && isMiejscowka ? seatIds.size() : requestBilet.ilosc());

			LocalDateTime startSprzedazy = null;
			LocalDateTime koniecSprzedazy = null;
			if (requestBilet.startSprzedazy() != null && !requestBilet.startSprzedazy().isBlank()) {
				try {
					startSprzedazy = LocalDateTime.parse(requestBilet.startSprzedazy());
				} catch (Exception e) {
				}
			}
			if (requestBilet.koniecSprzedazy() != null && !requestBilet.koniecSprzedazy().isBlank()) {
				try {
					koniecSprzedazy = LocalDateTime.parse(requestBilet.koniecSprzedazy());
				} catch (Exception e) {
				}
			}
			bilet.setStartSprzedazy(startSprzedazy);
			bilet.setKoniecSprzedazy(koniecSprzedazy);
			
			bilet.setSeatIds(seatIds.isEmpty() ? null : String.join(",", seatIds));
			bilet.setKategoriaBiletu(kategoriaBiletu);
			Bilet savedBilet = biletRepository.save(bilet);

			PozZam pozZam = new PozZam();
			pozZam.setBiletId(savedBilet.getId());
			pozZam.setIlosc(hasSalaPlan && isMiejscowka ? seatIds.size() : requestBilet.ilosc());
			pozZam.setCena(requestBilet.cena());
			pozZamRepository.save(pozZam);
		}
	}

	private List<String> normalizeSeatIds(List<String> seatIds) {
		if (seatIds == null || seatIds.isEmpty()) {
			return List.of();
		}
		return seatIds.stream()
			.filter(item -> item != null && !item.isBlank())
			.map(String::trim)
			.distinct()
			.toList();
	}

	private com.eventflow.com.controller.dto.SalaMiejsceDto toSalaMiejsceDto(SalaMiejsce seat) {
		return new com.eventflow.com.controller.dto.SalaMiejsceDto(
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

	private void validateCreateStatus(User user, String status) {
		if (STATUS_AKTYWNY.equals(status) || STATUS_DRAFT.equals(status)) {
			return;
		}
		if (STATUS_NIEAKTYWNY.equals(status)) {
			if (!isAdmin(user)) {
				throw new ResponseStatusException(FORBIDDEN, "Status NIEAKTYWNY moze nadac tylko administrator.");
			}
			return;
		}
		throw new ResponseStatusException(BAD_REQUEST, "Dozwolone statusy wydarzenia to: AKTYWNY, DRAFT, NIEAKTYWNY.");
	}

	private String normalizeStatus(String status) {
		if (status == null) {
			return "";
		}

		return switch (status.trim().toUpperCase()) {
			case "AKTYWNY", "AKTYWNE" -> STATUS_AKTYWNY;
			case "DRAFT", "SZKIC" -> STATUS_DRAFT;
			case "NIEAKTYWNY", "NIEAKTYWNE" -> STATUS_NIEAKTYWNY;
			default -> status.trim().toUpperCase();
		};
	}

	private User requireAuthenticatedUser(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}
		return userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono uzytkownika."));
	}

	private User requireOrgUser(Authentication authentication) {
		User user = requireAuthenticatedUser(authentication);
		if (!isOrg(user)) {
			throw new ResponseStatusException(FORBIDDEN, "Tylko konto ORG moze wykonac te akcje.");
		}
		return user;
	}

	private boolean isOrg(User user) {
		return user.getRola() != null && user.getRola().equalsIgnoreCase("ORG");
	}

	private boolean isAdmin(User user) {
		return user.getRola() != null && user.getRola().equalsIgnoreCase("ADMIN");
	}

	private boolean isUser(User user) {
		return user.getRola() != null && user.getRola().equalsIgnoreCase("USER");
	}

	private boolean canManageZgloszenia(User user, Wydarzenie wydarzenie) {
		if (isAdmin(user)) {
			return true;
		}
		if (!isOrg(user)) {
			return false;
		}
		return organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId())
			.map(Organizator::getId)
			.map(id -> id.equals(wydarzenie.getOrgId()))
			.orElse(false);
	}

	private boolean canManagePersonel(User user, Wydarzenie wydarzenie) {
		if (!isOrg(user)) {
			return false;
		}
		return organizatorRepository.findByUserIdAndZweryfikowTrue(user.getId())
			.map(Organizator::getId)
			.map(id -> id.equals(wydarzenie.getOrgId()))
			.orElse(false);
	}
}
