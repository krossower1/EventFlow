package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.KategoriaDto;
import com.eventflow.com.controller.dto.MiejsceOptionDto;
import com.eventflow.com.controller.dto.BiletCreateRequestDto;
import com.eventflow.com.controller.dto.BiletPostepDto;
import com.eventflow.com.controller.dto.OpiniaDto;
import com.eventflow.com.controller.dto.OpiniaRequestDto;
import com.eventflow.com.controller.dto.PersonelDto;
import com.eventflow.com.controller.dto.PersonelRequestDto;
import com.eventflow.com.controller.dto.WydarzenieCreateRequestDto;
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
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import com.eventflow.com.repository.ZgloszenieRepository;
import com.eventflow.com.service.UserCascadeDeleteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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
	private final KategoriaRepository kategoriaRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final BiletRepository biletRepository;
	private final PozZamRepository pozZamRepository;
	private final OpiniaRepository opiniaRepository;
	private final ZgloszenieRepository zgloszenieRepository;
	private final PersonelRepository personelRepository;
	private final UserCascadeDeleteService userCascadeDeleteService;

	public WydarzenieController(
		UserRepository userRepository,
		OrganizatorRepository organizatorRepository,
		MiejsceRepository miejsceRepository,
		KategoriaRepository kategoriaRepository,
		WydarzenieRepository wydarzenieRepository,
		BiletRepository biletRepository,
		PozZamRepository pozZamRepository,
		OpiniaRepository opiniaRepository,
		ZgloszenieRepository zgloszenieRepository,
		PersonelRepository personelRepository,
		UserCascadeDeleteService userCascadeDeleteService
	) {
		this.userRepository = userRepository;
		this.organizatorRepository = organizatorRepository;
		this.miejsceRepository = miejsceRepository;
		this.kategoriaRepository = kategoriaRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.biletRepository = biletRepository;
		this.pozZamRepository = pozZamRepository;
		this.opiniaRepository = opiniaRepository;
		this.zgloszenieRepository = zgloszenieRepository;
		this.personelRepository = personelRepository;
		this.userCascadeDeleteService = userCascadeDeleteService;
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
			wydarzenieRepository.findByDataZamkAfterOrderByDataRozpAsc(now).stream()
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
		if (personelRepository.existsByWydIdAndUserIdAndRolaIgnoreCase(id, request.userId(), request.rola().trim())) {
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

		wydarzenieRepository.findById(id)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono wydarzenia."));

		Opinia opinia = new Opinia();
		opinia.setWydId(id);
		opinia.setUserId(user.getId());
		opinia.setOcena(request.ocena());
		opinia.setOpis(request.opis().trim());
		opinia.setData(LocalDateTime.now());
		opiniaRepository.save(opinia);

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

		if (request.miejsceId() == null || request.tytul() == null || request.tytul().isBlank()
			|| request.rola() == null || request.rola().isBlank()
			|| request.status() == null || request.status().isBlank()
			|| request.dataRozp() == null || request.dataZamk() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Wypelnij wymagane pola wydarzenia.");
		}

		String normalizedStatus = normalizeStatus(request.status());
		validateCreateStatus(user, normalizedStatus);
		validateBilety(request.bilety());

		Miejsce miejsce = miejsceRepository.findById(request.miejsceId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Wybrane miejsce nie istnieje."));
		if (!miejsce.getUserId().equals(user.getId())) {
			throw new ResponseStatusException(FORBIDDEN, "Mozesz wybrac tylko swoje miejsce.");
		}

		Long kategoriaId = resolveKategoriaId(request, user);

		Wydarzenie wydarzenie = new Wydarzenie();
		wydarzenie.setOrgId(organizator.getId());
		wydarzenie.setMiejsceId(miejsce.getId());
		wydarzenie.setTytul(request.tytul());
		wydarzenie.setOpis(request.opis());
		wydarzenie.setKategoriaId(kategoriaId);
		wydarzenie.setRola(request.rola());
		wydarzenie.setDataUtw(LocalDateTime.now());
		wydarzenie.setStatus(normalizedStatus);
		wydarzenie.setDataRozp(request.dataRozp());
		wydarzenie.setDataZamk(request.dataZamk());

		Wydarzenie savedWydarzenie = wydarzenieRepository.save(wydarzenie);
		saveBilety(savedWydarzenie.getId(), request.bilety());
		return ResponseEntity.status(CREATED).body("Wydarzenie zostalo dodane.");
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
			return kategoriaRepository.save(kategoria).getId();
		}

		if (request.kategoriaId() == null) {
			throw new ResponseStatusException(BAD_REQUEST, "Wybierz istniejaca kategorie.");
		}
		return kategoriaRepository.findById(request.kategoriaId())
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Wybrana kategoria nie istnieje."))
			.getId();
	}

	private WydarzenieListItemDto toListItem(Wydarzenie wydarzenie) {
		List<BiletPostepDto> postepyBiletow = getBiletPostepy(wydarzenie.getId());
		boolean maDostepneBilety = postepyBiletow.stream().anyMatch(item -> item.wszystkie() > item.sprzedane());

		return new WydarzenieListItemDto(
			wydarzenie.getId(),
			wydarzenie.getTytul(),
			normalizeStatus(wydarzenie.getStatus()),
			miejsceRepository.findById(wydarzenie.getMiejsceId()).map(Miejsce::getNazwa).orElse("-"),
			kategoriaRepository.findById(wydarzenie.getKategoriaId()).map(Kategoria::getNazwa).orElse("-"),
			wydarzenie.getDataRozp(),
			wydarzenie.getDataZamk(),
			maDostepneBilety,
			postepyBiletow
		);
	}

	private WydarzenieDetailDto toDetailItem(Wydarzenie wydarzenie, User user) {
		List<BiletPostepDto> postepyBiletow = getBiletPostepy(wydarzenie.getId());
		boolean maDostepneBilety = postepyBiletow.stream().anyMatch(item -> item.wszystkie() > item.sprzedane());
		List<ZgloszenieDto> zgloszenia = canManageZgloszenia(user, wydarzenie) ? getZgloszenia(wydarzenie.getId()) : List.of();
		boolean canManagePersonel = canManagePersonel(user, wydarzenie);

		return new WydarzenieDetailDto(
			wydarzenie.getId(),
			wydarzenie.getTytul(),
			wydarzenie.getOpis(),
			normalizeStatus(wydarzenie.getStatus()),
			miejsceRepository.findById(wydarzenie.getMiejsceId()).map(Miejsce::getNazwa).orElse("-"),
			kategoriaRepository.findById(wydarzenie.getKategoriaId()).map(Kategoria::getNazwa).orElse("-"),
			wydarzenie.getDataRozp(),
			wydarzenie.getDataZamk(),
			maDostepneBilety,
			canManagePersonel,
			postepyBiletow,
			getPersonel(wydarzenie.getId()),
			getOpinie(wydarzenie.getId()),
			zgloszenia
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
				return new BiletPostepDto(bilet.getId(), bilet.getKlasa(), sprzedane, wszystkie);
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

	private void validateBilety(List<BiletCreateRequestDto> bilety) {
		if (bilety == null || bilety.isEmpty()) {
			throw new ResponseStatusException(BAD_REQUEST, "Dodaj co najmniej jeden typ biletu.");
		}

		for (BiletCreateRequestDto bilet : bilety) {
			if (bilet == null
				|| bilet.klasa() == null || bilet.klasa().isBlank()
				|| bilet.cena() == null
				|| bilet.ilosc() == null
				|| bilet.startSprzedazy() == null
				|| bilet.koniecSprzedazy() == null) {
				throw new ResponseStatusException(BAD_REQUEST, "Wypelnij wszystkie wymagane pola biletu.");
			}
			if (bilet.cena().signum() < 0) {
				throw new ResponseStatusException(BAD_REQUEST, "Cena biletu nie moze byc ujemna.");
			}
			if (bilet.ilosc() <= 0) {
				throw new ResponseStatusException(BAD_REQUEST, "Ilosc biletow musi byc wieksza od zera.");
			}
			if (bilet.koniecSprzedazy().isBefore(bilet.startSprzedazy())) {
				throw new ResponseStatusException(BAD_REQUEST, "Data konca sprzedazy biletu nie moze byc wczesniejsza niz data startu.");
			}
			if (bilet.waluta() != null && !bilet.waluta().isBlank() && !"PLN".equalsIgnoreCase(bilet.waluta())) {
				throw new ResponseStatusException(BAD_REQUEST, "Waluta biletu musi byc ustawiona na PLN.");
			}
		}
	}

	private void saveBilety(Long wydarzenieId, List<BiletCreateRequestDto> bilety) {
		for (BiletCreateRequestDto requestBilet : bilety) {
			Bilet bilet = new Bilet();
			bilet.setWydarzenieId(wydarzenieId);
			bilet.setKlasa(requestBilet.klasa().trim());
			bilet.setCena(requestBilet.cena());
			bilet.setWaluta("PLN");
			bilet.setIlosc(requestBilet.ilosc());
			bilet.setStartSprzedazy(requestBilet.startSprzedazy());
			bilet.setKoniecSprzedazy(requestBilet.koniecSprzedazy());
			Bilet savedBilet = biletRepository.save(bilet);

			PozZam pozZam = new PozZam();
			pozZam.setBiletId(savedBilet.getId());
			pozZam.setIlosc(requestBilet.ilosc());
			pozZam.setCena(requestBilet.cena());
			pozZamRepository.save(pozZam);
		}
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
