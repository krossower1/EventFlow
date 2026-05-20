package com.eventflow.com.service;

import com.eventflow.com.model.Bilet;
import com.eventflow.com.model.Kategoria;
import com.eventflow.com.model.Miejsce;
import com.eventflow.com.model.Opinia;
import com.eventflow.com.model.Organizator;
import com.eventflow.com.model.Personel;
import com.eventflow.com.model.PozZam;
import com.eventflow.com.model.User;
import com.eventflow.com.model.Wydarzenie;
import com.eventflow.com.model.WystBilet;
import com.eventflow.com.model.Zamowienie;
import com.eventflow.com.model.Zgloszenie;
import com.eventflow.com.model.Zwrot;
import com.eventflow.com.repository.BiletRepository;
import com.eventflow.com.repository.KategoriaRepository;
import com.eventflow.com.repository.MiejsceRepository;
import com.eventflow.com.repository.OpiniaRepository;
import com.eventflow.com.repository.OrganizatorRepository;
import com.eventflow.com.repository.PersonelRepository;
import com.eventflow.com.repository.PlatnoscRepository;
import com.eventflow.com.repository.PozZamRepository;
import com.eventflow.com.repository.SalaRepository;
import com.eventflow.com.repository.UserNotificationRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import com.eventflow.com.repository.WystBiletRepository;
import com.eventflow.com.repository.ZamowienieRepository;
import com.eventflow.com.repository.ZgloszenieRepository;
import com.eventflow.com.repository.ZwrotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserCascadeDeleteService {
	private final UserRepository userRepository;
	private final OrganizatorRepository organizatorRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final BiletRepository biletRepository;
	private final PozZamRepository pozZamRepository;
	private final ZamowienieRepository zamowienieRepository;
	private final WystBiletRepository wystBiletRepository;
	private final PlatnoscRepository platnoscRepository;
	private final ZwrotRepository zwrotRepository;
	private final PersonelRepository personelRepository;
	private final OpiniaRepository opiniaRepository;
	private final ZgloszenieRepository zgloszenieRepository;
	private final MiejsceRepository miejsceRepository;
	private final SalaRepository salaRepository;
	private final KategoriaRepository kategoriaRepository;
	private final UserNotificationRepository userNotificationRepository;

	public UserCascadeDeleteService(
		UserRepository userRepository,
		OrganizatorRepository organizatorRepository,
		WydarzenieRepository wydarzenieRepository,
		BiletRepository biletRepository,
		PozZamRepository pozZamRepository,
		ZamowienieRepository zamowienieRepository,
		WystBiletRepository wystBiletRepository,
		PlatnoscRepository platnoscRepository,
		ZwrotRepository zwrotRepository,
		PersonelRepository personelRepository,
		OpiniaRepository opiniaRepository,
		ZgloszenieRepository zgloszenieRepository,
		MiejsceRepository miejsceRepository,
		SalaRepository salaRepository,
		KategoriaRepository kategoriaRepository,
		UserNotificationRepository userNotificationRepository
	) {
		this.userRepository = userRepository;
		this.organizatorRepository = organizatorRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.biletRepository = biletRepository;
		this.pozZamRepository = pozZamRepository;
		this.zamowienieRepository = zamowienieRepository;
		this.wystBiletRepository = wystBiletRepository;
		this.platnoscRepository = platnoscRepository;
		this.zwrotRepository = zwrotRepository;
		this.personelRepository = personelRepository;
		this.opiniaRepository = opiniaRepository;
		this.zgloszenieRepository = zgloszenieRepository;
		this.miejsceRepository = miejsceRepository;
		this.salaRepository = salaRepository;
		this.kategoriaRepository = kategoriaRepository;
		this.userNotificationRepository = userNotificationRepository;
	}

	@Transactional
	public void deleteUserWithDependencies(User user) {
		deleteUserOwnedResourcesIfOrg(user);
		deleteUserPurchasedTickets(user.getId());
		deleteSimpleUserLinks(user.getId());
		userRepository.delete(user);
	}

	@Transactional
	public void deleteWydarzeniaWithDependencies(List<Long> wydarzenieIds) {
		deleteEventsCascade(wydarzenieIds);
	}

	private void deleteUserOwnedResourcesIfOrg(User user) {
		if (user.getRola() == null || !user.getRola().equalsIgnoreCase("ORG")) {
			return;
		}

		organizatorRepository.findByUserId(user.getId()).ifPresent(organizator -> {
			List<Long> eventIds = wydarzenieRepository.findByOrgId(organizator.getId()).stream()
				.map(Wydarzenie::getId)
				.toList();
			deleteEventsCascade(eventIds);
			organizatorRepository.delete(organizator);
		});

		List<Long> miejsceIds = miejsceRepository.findByUserId(user.getId()).stream()
			.map(Miejsce::getId)
			.toList();
		if (!miejsceIds.isEmpty()) {
			salaRepository.deleteAllByIdInBatch(
				salaRepository.findByMiejsceIdIn(miejsceIds).stream().map(item -> item.getId()).toList()
			);
			miejsceRepository.deleteAllByIdInBatch(miejsceIds);
		}

		List<Long> kategoriaIds = kategoriaRepository.findByCreatedByUserId(user.getId()).stream()
			.map(Kategoria::getId)
			.toList();
		if (!kategoriaIds.isEmpty()) {
			// Jeśli po skasowaniu wydarzeń organizatora jakaś kategoria nadal jest używana
			// przez cudze wydarzenie, nie usuwamy jej aby nie naruszyć spójności.
			Set<Long> usedCategoryIds = wydarzenieRepository.findByKategoriaIdIn(kategoriaIds).stream()
				.map(Wydarzenie::getKategoriaId)
				.collect(Collectors.toSet());
			List<Long> removableCategoryIds = kategoriaIds.stream()
				.filter(id -> !usedCategoryIds.contains(id))
				.toList();
			if (!removableCategoryIds.isEmpty()) {
				kategoriaRepository.deleteAllByIdInBatch(removableCategoryIds);
			}
		}
	}

	private void deleteSimpleUserLinks(Long userId) {
		userNotificationRepository.deleteByUserId(userId);

		List<Long> personelIds = personelRepository.findByUserId(userId).stream()
			.map(Personel::getId)
			.toList();
		if (!personelIds.isEmpty()) {
			personelRepository.deleteAllByIdInBatch(personelIds);
		}

		List<Long> opinieIds = opiniaRepository.findByUserId(userId).stream()
			.map(Opinia::getId)
			.toList();
		if (!opinieIds.isEmpty()) {
			opiniaRepository.deleteAllByIdInBatch(opinieIds);
		}

		List<Long> zgloszenieIds = zgloszenieRepository.findByUserId(userId).stream()
			.map(Zgloszenie::getId)
			.toList();
		if (!zgloszenieIds.isEmpty()) {
			zgloszenieRepository.deleteAllByIdInBatch(zgloszenieIds);
		}
	}

	private void deleteEventsCascade(List<Long> eventIds) {
		if (eventIds == null || eventIds.isEmpty()) {
			return;
		}

		List<Long> personelIds = personelRepository.findByWydIdIn(eventIds).stream()
			.map(Personel::getId)
			.toList();
		if (!personelIds.isEmpty()) {
			personelRepository.deleteAllByIdInBatch(personelIds);
		}

		List<Long> opiniaIds = opiniaRepository.findByWydIdIn(eventIds).stream()
			.map(Opinia::getId)
			.toList();
		if (!opiniaIds.isEmpty()) {
			opiniaRepository.deleteAllByIdInBatch(opiniaIds);
		}

		List<Long> zgloszenieIds = zgloszenieRepository.findByWydIdIn(eventIds).stream()
			.map(Zgloszenie::getId)
			.toList();
		if (!zgloszenieIds.isEmpty()) {
			zgloszenieRepository.deleteAllByIdInBatch(zgloszenieIds);
		}

		List<Long> biletIds = biletRepository.findByWydarzenieIdIn(eventIds).stream()
			.map(Bilet::getId)
			.toList();
		deleteBiletyCascade(biletIds);

		wydarzenieRepository.deleteAllByIdInBatch(eventIds);
	}

	private void deleteBiletyCascade(List<Long> biletIds) {
		if (biletIds == null || biletIds.isEmpty()) {
			return;
		}

		List<Long> pozZamIds = pozZamRepository.findByBiletIdIn(biletIds).stream()
			.map(PozZam::getId)
			.toList();

		List<Zamowienie> zamowieniaPowiazaneZPoz = pozZamIds.isEmpty()
			? List.of()
			: zamowienieRepository.findByPozZamIdIn(pozZamIds);

		List<Long> zamowienieIdsFromPoz = zamowieniaPowiazaneZPoz.stream()
			.map(Zamowienie::getId)
			.toList();

		List<Long> extraZamowienieIdsFromTickets = wystBiletRepository.findByBiletIdIn(biletIds).stream()
			.map(WystBilet::getZamId)
			.toList();

		Set<Long> allZamowienieIds = new LinkedHashSet<>(zamowienieIdsFromPoz);
		allZamowienieIds.addAll(extraZamowienieIdsFromTickets);
		deleteOrdersByIds(List.copyOf(allZamowienieIds));

		if (!pozZamIds.isEmpty()) {
			pozZamRepository.deleteAllByIdInBatch(pozZamIds);
		}
		biletRepository.deleteAllByIdInBatch(biletIds);
	}

	private void deleteUserPurchasedTickets(Long userId) {
		List<Long> zamowienieIds = zamowienieRepository.findByUserId(userId).stream()
			.map(Zamowienie::getId)
			.toList();
		deleteOrdersByIds(zamowienieIds);
	}

	private void deleteOrdersByIds(List<Long> zamowienieIds) {
		if (zamowienieIds == null || zamowienieIds.isEmpty()) {
			return;
		}

		List<Zamowienie> zamowienia = zamowienieRepository.findAllById(zamowienieIds);
		List<Long> wystBiletIds = wystBiletRepository.findByZamIdIn(zamowienieIds).stream()
			.map(WystBilet::getId)
			.toList();
		if (!wystBiletIds.isEmpty()) {
			wystBiletRepository.deleteAllByIdInBatch(wystBiletIds);
		}

		List<Long> paymentIds = zamowienia.stream()
			.map(Zamowienie::getPlatnId)
			.filter(id -> id != null)
			.distinct()
			.toList();
		if (!paymentIds.isEmpty()) {
			List<Long> zwrotIds = zwrotRepository.findByPlatnIdIn(paymentIds).stream()
				.map(Zwrot::getId)
				.toList();
			if (!zwrotIds.isEmpty()) {
				zwrotRepository.deleteAllByIdInBatch(zwrotIds);
			}
		}

		zamowienieRepository.deleteAllByIdInBatch(zamowienieIds);
		if (!paymentIds.isEmpty()) {
			platnoscRepository.deleteAllByIdInBatch(paymentIds);
		}
	}
}
