package com.eventflow.com.service;

import com.eventflow.com.controller.dto.UnreadNotificationsCountResponse;
import com.eventflow.com.controller.dto.UserNotificationResponse;
import com.eventflow.com.model.Organizator;
import com.eventflow.com.model.Bilet;
import com.eventflow.com.model.Organizator;
import com.eventflow.com.model.PozZam;
import com.eventflow.com.model.SecurityTicket;
import com.eventflow.com.model.User;
import com.eventflow.com.model.UserNotification;
import com.eventflow.com.model.UserObservedEvent;
import com.eventflow.com.model.Wydarzenie;
import com.eventflow.com.model.Zwrot;
import com.eventflow.com.repository.OrganizatorRepository;
import com.eventflow.com.repository.PozZamRepository;
import com.eventflow.com.repository.BiletRepository;
import com.eventflow.com.repository.UserFavoriteRepository;
import com.eventflow.com.repository.UserNotificationRepository;
import com.eventflow.com.repository.UserObservedEventRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.repository.WydarzenieRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.function.Predicate;

@Service
public class NotificationService {

	public static final String TYPE_ADMIN_LOGIN = "ADMIN_LOGIN";
	public static final String TYPE_NEW_EVENT = "NEW_EVENT";
	public static final String TYPE_FAVORITE_LOGIN = "FAVORITE_LOGIN";
	public static final String TYPE_OBSERVED_EVENT_END = "OBSERVED_EVENT_END";
	public static final String TYPE_OBSERVED_EVENT_START = "OBSERVED_EVENT_START";
	public static final String TYPE_OBSERVED_SEAT_FREED = "OBSERVED_SEAT_FREED";
	/** Typ powiadomienia ADMIN: nowy wniosek o zwrot. */
	public static final String TYPE_NEW_REFUND_REQUEST = "NEW_REFUND_REQUEST";
	/** Typ powiadomienia ADMIN: nowy wniosek o rolę organizatora. */
	public static final String TYPE_NEW_ORGANIZER_REQUEST = "NEW_ORGANIZER_REQUEST";
	/** Typ powiadomienia ADMIN: nowe zgłoszenie bezpieczeństwa. */
	public static final String TYPE_NEW_SECURITY_REPORT = "NEW_SECURITY_REPORT";
	/** Typ powiadomienia ORG: dołączenie uczestnika do wydarzenia. */
	public static final String TYPE_ORG_EVENT_JOIN = "ORG_EVENT_JOIN";
	/** Typ powiadomienia ORG: wykupienie wszystkich biletów. */
	public static final String TYPE_ORG_EVENT_SOLD_OUT = "ORG_EVENT_SOLD_OUT";
	/** Typ powiadomienia ORG: nowa opinia o wydarzeniu. */
	public static final String TYPE_ORG_EVENT_REVIEW = "ORG_EVENT_REVIEW";
	/** Typ powiadomienia ORG: zbliżający się start wydarzenia organizatora. */
	public static final String TYPE_ORG_EVENT_START = "ORG_EVENT_START";
	/** Typ powiadomienia ORG: zwrot biletu na wydarzenie. */
	public static final String TYPE_ORG_EVENT_REFUND = "ORG_EVENT_REFUND";

	private static final String STATUS_AKTYWNY = "AKTYWNY";
	public static final int START_REMINDER_HOURS_BEFORE = 24;

	private final UserRepository userRepository;
	private final UserNotificationRepository userNotificationRepository;
	private final UserObservedEventRepository userObservedEventRepository;
	private final UserFavoriteRepository userFavoriteRepository;
	private final WydarzenieRepository wydarzenieRepository;
	private final OrganizatorRepository organizatorRepository;
	private final BiletRepository biletRepository;
	private final PozZamRepository pozZamRepository;

	public NotificationService(
		UserRepository userRepository,
		UserNotificationRepository userNotificationRepository,
		UserObservedEventRepository userObservedEventRepository,
		UserFavoriteRepository userFavoriteRepository,
		WydarzenieRepository wydarzenieRepository,
		OrganizatorRepository organizatorRepository,
		BiletRepository biletRepository,
		PozZamRepository pozZamRepository
	) {
		this.userRepository = userRepository;
		this.userNotificationRepository = userNotificationRepository;
		this.userObservedEventRepository = userObservedEventRepository;
		this.userFavoriteRepository = userFavoriteRepository;
		this.wydarzenieRepository = wydarzenieRepository;
		this.organizatorRepository = organizatorRepository;
		this.biletRepository = biletRepository;
		this.pozZamRepository = pozZamRepository;
	}

	@Transactional
	public void notifyAdminLogin(User adminUser) {
		if (adminUser == null || adminUser.getId() == null || !"ADMIN".equalsIgnoreCase(adminUser.getRola())) {
			return;
		}
		String message = "Administrator " + buildUserLabel(adminUser) + " zalogował się do systemu.";
		LocalDateTime now = LocalDateTime.now();
		userRepository.findAll().stream()
			.filter(user -> user.getId() != null && !user.getId().equals(adminUser.getId()))
			.filter(this::isAdminLoginNotificationEnabled)
			.forEach(recipient -> saveNotification(recipient.getId(), TYPE_ADMIN_LOGIN, message, now));
	}

	@Transactional
	public void notifyNewEvent(Wydarzenie wydarzenie, Long creatorUserId) {
		if (wydarzenie == null || wydarzenie.getId() == null) {
			return;
		}
		String message = "Dodano nowe wydarzenie: " + eventTitle(wydarzenie) + ".";
		LocalDateTime now = LocalDateTime.now();
		userRepository.findAll().stream()
			.filter(user -> user.getId() != null && !user.getId().equals(creatorUserId))
			.filter(this::isNewEventNotificationEnabled)
			.forEach(recipient -> saveNotification(recipient.getId(), TYPE_NEW_EVENT, message, now));
	}

	@Transactional
	public void notifyFavoriteLogin(User loggedInUser) {
		if (loggedInUser == null || loggedInUser.getId() == null) {
			return;
		}
		String message = buildUserLabel(loggedInUser) + " zalogował się do systemu.";
		LocalDateTime now = LocalDateTime.now();
		userFavoriteRepository.findByFavoriteUserId(loggedInUser.getId()).stream()
			.map(favorite -> userRepository.findById(favorite.getUserId()).orElse(null))
			.filter(user -> user != null && user.getId() != null)
			.filter(this::isFavoriteLoginNotificationEnabled)
			.forEach(recipient -> saveNotification(recipient.getId(), TYPE_FAVORITE_LOGIN, message, now));
	}

	@Transactional
	public void notifyObservedEventEnd(Wydarzenie wydarzenie) {
		if (wydarzenie == null || wydarzenie.getId() == null) {
			return;
		}
		String message = "Wydarzenie, które obserwujesz, zostało zakończone: " + eventTitle(wydarzenie) + ".";
		notifyObservedUsers(wydarzenie.getId(), TYPE_OBSERVED_EVENT_END, message, this::isObservedEventEndEnabled);
	}

	@Transactional
	public void notifyObservedSeatFreed(Long wydarzenieId, String seatId, String eventTitle, String ticketClass) {
		if (wydarzenieId == null || seatId == null || seatId.isBlank()) {
			return;
		}
		String title = eventTitle != null && !eventTitle.isBlank() ? eventTitle.trim() : ("Wydarzenie #" + wydarzenieId);
		String classLabel = ticketClass != null && !ticketClass.isBlank() ? ticketClass.trim() : "bilet";
		String message = "Zwolniono miejsce " + seatId.trim() + " (" + classLabel + ") na wydarzeniu: " + title + ".";
		notifyObservedUsers(wydarzenieId, TYPE_OBSERVED_SEAT_FREED, message, this::isObservedSeatFreedEnabled);
	}

	@Transactional
	public void notifyNewRefundRequest(Zwrot zwrot) {
		if (zwrot == null || zwrot.getId() == null) {
			return;
		}
		String amount = zwrot.getKwota() != null ? zwrot.getKwota().toPlainString() : "?";
		String currency = zwrot.getWaluta() != null && !zwrot.getWaluta().isBlank() ? zwrot.getWaluta().trim() : "";
		String reason = zwrot.getPowod() != null && !zwrot.getPowod().isBlank() ? " Powód: " + zwrot.getPowod().trim() + "." : "";
		String message = "Nowy wniosek o zwrot #" + zwrot.getId() + ": " + amount + " " + currency + "." + reason;
		notifyAdmins(TYPE_NEW_REFUND_REQUEST, message, this::isNewRefundRequestEnabled);
	}

	/** Tworzy powiadomienie dla administratorów o nowym wniosku organizatora. */
	@Transactional
	public void notifyNewOrganizerRequest(Organizator organizator, User requester) {
		if (organizator == null || organizator.getId() == null) {
			return;
		}
		String requesterLabel = requester != null ? buildUserLabel(requester) : ("użytkownik #" + organizator.getUserId());
		String company = organizator.getFirma() != null && !organizator.getFirma().isBlank()
			? " Firma: " + organizator.getFirma().trim() + "."
			: "";
		String message = "Nowy wniosek o rolę organizatora od " + requesterLabel + "." + company;
		notifyAdmins(TYPE_NEW_ORGANIZER_REQUEST, message, this::isNewOrganizerRequestEnabled);
	}

	/** Tworzy powiadomienie dla administratorów o nowym ticketcie bezpieczeństwa. */
	@Transactional
	public void notifyNewSecurityReport(SecurityTicket ticket) {
		if (ticket == null || ticket.getId() == null) {
			return;
		}
		String category = ticket.getCategory() != null ? ticket.getCategory().name() : "UNKNOWN";
		String message = "Nowe zgłoszenie bezpieczeństwa #" + ticket.getId() + " (" + category + ").";
		notifyAdmins(TYPE_NEW_SECURITY_REPORT, message, this::isNewSecurityReportEnabled);
	}

	/** Powiadomienie ORG: uczestnik dołączył do wydarzenia (zakup biletu). */
	@Transactional
	public void notifyOrganizerEventJoin(Wydarzenie wydarzenie, User buyer, int quantity) {
		if (wydarzenie == null || wydarzenie.getId() == null || buyer == null || buyer.getId() == null || quantity <= 0) {
			return;
		}
		if (isOrganizerUser(wydarzenie, buyer.getId())) {
			return;
		}
		String message = buildUserLabel(buyer) + " dołączył do wydarzenia " + eventTitle(wydarzenie)
			+ " (bilety: " + quantity + ").";
		notifyOrganizer(wydarzenie.getOrgId(), TYPE_ORG_EVENT_JOIN, message, this::isOrgEventJoinEnabled);
	}

	/** Powiadomienie ORG: wszystkie pule biletów wydarzenia są wyczerpane (jednorazowo). */
	@Transactional
	public void notifyOrganizerEventSoldOutIfNeeded(Wydarzenie wydarzenie) {
		if (wydarzenie == null || wydarzenie.getId() == null || wydarzenie.getOrgSoldOutNotifiedAt() != null) {
			return;
		}
		if (!isEventFullySoldOut(wydarzenie.getId())) {
			return;
		}
		String message = "Wszystkie bilety na wydarzenie " + eventTitle(wydarzenie) + " zostały wykupione.";
		notifyOrganizer(wydarzenie.getOrgId(), TYPE_ORG_EVENT_SOLD_OUT, message, this::isOrgEventSoldOutEnabled);
		wydarzenie.setOrgSoldOutNotifiedAt(LocalDateTime.now());
		wydarzenieRepository.save(wydarzenie);
	}

	/** Powiadomienie ORG: nowa opinia o wydarzeniu. */
	@Transactional
	public void notifyOrganizerEventReview(Wydarzenie wydarzenie, User reviewer, int rating) {
		if (wydarzenie == null || wydarzenie.getId() == null || reviewer == null || reviewer.getId() == null) {
			return;
		}
		if (isOrganizerUser(wydarzenie, reviewer.getId())) {
			return;
		}
		String message = buildUserLabel(reviewer) + " dodał opinię (" + rating + "/5) do wydarzenia "
			+ eventTitle(wydarzenie) + ".";
		notifyOrganizer(wydarzenie.getOrgId(), TYPE_ORG_EVENT_REVIEW, message, this::isOrgEventReviewEnabled);
	}

	/** Powiadomienie ORG: zaakceptowany zwrot biletu. */
	@Transactional
	public void notifyOrganizerEventRefund(Wydarzenie wydarzenie, User buyer, String ticketClass) {
		if (wydarzenie == null || wydarzenie.getId() == null || buyer == null || buyer.getId() == null) {
			return;
		}
		String classLabel = ticketClass != null && !ticketClass.isBlank() ? ticketClass.trim() : "bilet";
		String message = buildUserLabel(buyer) + " zwrócił " + classLabel + " na wydarzenie " + eventTitle(wydarzenie) + ".";
		notifyOrganizer(wydarzenie.getOrgId(), TYPE_ORG_EVENT_REFUND, message, this::isOrgEventRefundEnabled);
	}

	/**
	 * Scheduler: przypomnienie organizatorowi o starcie w ciągu {@link #START_REMINDER_HOURS_BEFORE} h.
	 */
	@Transactional
	public void sendUpcomingOrganizerEventStartReminders() {
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime windowEnd = now.plusHours(START_REMINDER_HOURS_BEFORE);
		List<Wydarzenie> pending = wydarzenieRepository.findByOrgStartReminderSentAtIsNull();

		for (Wydarzenie wydarzenie : pending) {
			if (wydarzenie.getDataRozp() == null || wydarzenie.getOrgId() == null) {
				continue;
			}
			if (!STATUS_AKTYWNY.equalsIgnoreCase(normalizeStatus(wydarzenie.getStatus()))) {
				continue;
			}
			LocalDateTime start = wydarzenie.getDataRozp();
			if (start.isBefore(now) || start.isAfter(windowEnd)) {
				continue;
			}
			User organizer = resolveOrganizerUser(wydarzenie.getOrgId());
			if (organizer == null || organizer.getId() == null || !isOrgEventStartEnabled(organizer)) {
				continue;
			}
			String message = "Zbliża się start Twojego wydarzenia: " + eventTitle(wydarzenie)
				+ " (" + formatDateTime(start) + ").";
			saveNotification(organizer.getId(), TYPE_ORG_EVENT_START, message, now);
			wydarzenie.setOrgStartReminderSentAt(now);
			wydarzenieRepository.save(wydarzenie);
		}
	}

	/**
	 * Scheduler: przypomnienie o starcie w ciągu {@link #START_REMINDER_HOURS_BEFORE} h (tylko wydarzenia AKTYWNE).
	 */
	@Transactional
	public void sendUpcomingObservedEventStartReminders() {
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime windowEnd = now.plusHours(START_REMINDER_HOURS_BEFORE);
		List<UserObservedEvent> pending = userObservedEventRepository.findByStartReminderSentAtIsNull();

		for (UserObservedEvent observed : pending) {
			Wydarzenie wydarzenie = wydarzenieRepository.findById(observed.getWydarzenieId()).orElse(null);
			if (wydarzenie == null || wydarzenie.getDataRozp() == null) {
				continue;
			}
			if (!STATUS_AKTYWNY.equalsIgnoreCase(normalizeStatus(wydarzenie.getStatus()))) {
				continue;
			}
			LocalDateTime start = wydarzenie.getDataRozp();
			if (start.isBefore(now) || start.isAfter(windowEnd)) {
				continue;
			}
			User user = userRepository.findById(observed.getUserId()).orElse(null);
			if (!isObservedEventStartEnabled(user)) {
				continue;
			}
			String message = "Zbliża się start obserwowanego wydarzenia: " + eventTitle(wydarzenie)
				+ " (" + formatDateTime(start) + ").";
			saveNotification(observed.getUserId(), TYPE_OBSERVED_EVENT_START, message, now);
			observed.setStartReminderSentAt(now);
			userObservedEventRepository.save(observed);
		}
	}

	public List<UserNotificationResponse> getNotificationsForUser(Long userId, int limit) {
		int safeLimit = Math.max(1, Math.min(limit, 100));
		return userNotificationRepository
			.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt")))
			.stream()
			.map(this::toResponse)
			.toList();
	}

	public UnreadNotificationsCountResponse getUnreadCountForUser(Long userId) {
		return new UnreadNotificationsCountResponse(userNotificationRepository.countByUserIdAndReadFalse(userId));
	}

	@Transactional
	public UserNotificationResponse markAsRead(Long userId, Long notificationId) {
		UserNotification notification = userNotificationRepository.findByIdAndUserId(notificationId, userId)
			.orElseThrow(() -> new RuntimeException("Nie znaleziono powiadomienia"));
		notification.setRead(true);
		return toResponse(userNotificationRepository.save(notification));
	}

	@Transactional
	public void markAllAsRead(Long userId) {
		List<UserNotification> unread = userNotificationRepository.findByUserIdAndReadFalse(userId);
		for (UserNotification notification : unread) {
			notification.setRead(true);
		}
		userNotificationRepository.saveAll(unread);
	}

	@Transactional
	public void deleteNotification(Long userId, Long notificationId) {
		UserNotification notification = userNotificationRepository.findByIdAndUserId(notificationId, userId)
			.orElseThrow(() -> new RuntimeException("Nie znaleziono powiadomienia"));
		userNotificationRepository.delete(notification);
	}

	@Transactional
	public void deleteAllForUser(Long userId) {
		userNotificationRepository.deleteByUserId(userId);
	}

	private void notifyObservedUsers(Long wydarzenieId, String type, String message, Predicate<User> preferenceFilter) {
		LocalDateTime now = LocalDateTime.now();
		userObservedEventRepository.findByWydarzenieId(wydarzenieId).stream()
			.map(observed -> userRepository.findById(observed.getUserId()).orElse(null))
			.filter(user -> user != null && user.getId() != null)
			.filter(preferenceFilter)
			.forEach(recipient -> saveNotification(recipient.getId(), type, message, now));
	}

	/** Wysyła komunikat do wszystkich ADMIN z włączoną odpowiednią preferencją. */
	private void notifyAdmins(String type, String message, Predicate<User> preferenceFilter) {
		LocalDateTime now = LocalDateTime.now();
		userRepository.findAll().stream()
			.filter(user -> user.getId() != null)
			.filter(user -> "ADMIN".equalsIgnoreCase(user.getRola()))
			.filter(preferenceFilter)
			.forEach(recipient -> saveNotification(recipient.getId(), type, message, now));
	}

	private void notifyOrganizer(Long orgId, String type, String message, Predicate<User> preferenceFilter) {
		if (orgId == null) {
			return;
		}
		User organizer = resolveOrganizerUser(orgId);
		if (organizer == null || !preferenceFilter.test(organizer)) {
			return;
		}
		saveNotification(organizer.getId(), type, message, LocalDateTime.now());
	}

	private User resolveOrganizerUser(Long orgId) {
		Organizator organizator = organizatorRepository.findById(orgId).orElse(null);
		if (organizator == null || organizator.getUserId() == null) {
			return null;
		}
		return userRepository.findById(organizator.getUserId()).orElse(null);
	}

	private boolean isOrganizerUser(Wydarzenie wydarzenie, Long userId) {
		if (wydarzenie == null || wydarzenie.getOrgId() == null || userId == null) {
			return false;
		}
		return organizatorRepository.findById(wydarzenie.getOrgId())
			.map(org -> userId.equals(org.getUserId()))
			.orElse(false);
	}

	private boolean isEventFullySoldOut(Long wydarzenieId) {
		List<Bilet> bilety = biletRepository.findByWydarzenieId(wydarzenieId);
		if (bilety.isEmpty()) {
			return false;
		}
		for (Bilet bilet : bilety) {
			PozZam pozZam = pozZamRepository.findByBiletId(bilet.getId()).orElse(null);
			if (pozZam == null || pozZam.getIlosc() == null || pozZam.getIlosc() > 0) {
				return false;
			}
		}
		return true;
	}

	private void saveNotification(Long userId, String type, String message, LocalDateTime createdAt) {
		UserNotification notification = new UserNotification();
		notification.setUserId(userId);
		notification.setType(type);
		notification.setMessage(message);
		notification.setCreatedAt(createdAt);
		notification.setRead(false);
		userNotificationRepository.save(notification);
	}

	private boolean isAdminLoginNotificationEnabled(User user) {
		return user.getNotifyAdminLogin() == null || Boolean.TRUE.equals(user.getNotifyAdminLogin());
	}

	private boolean isNewEventNotificationEnabled(User user) {
		return user.getNotifyNewEvent() == null || Boolean.TRUE.equals(user.getNotifyNewEvent());
	}

	private boolean isFavoriteLoginNotificationEnabled(User user) {
		return Boolean.TRUE.equals(user.getNotifyFavoriteLogin());
	}

	private boolean isObservedEventEndEnabled(User user) {
		return user.getNotifyObservedEventEnd() == null || Boolean.TRUE.equals(user.getNotifyObservedEventEnd());
	}

	private boolean isObservedEventStartEnabled(User user) {
		return user == null || user.getNotifyObservedEventStart() == null || Boolean.TRUE.equals(user.getNotifyObservedEventStart());
	}

	private boolean isObservedSeatFreedEnabled(User user) {
		return user.getNotifyObservedSeatFreed() == null || Boolean.TRUE.equals(user.getNotifyObservedSeatFreed());
	}

	private boolean isNewRefundRequestEnabled(User user) {
		return user.getNotifyNewRefundRequest() == null || Boolean.TRUE.equals(user.getNotifyNewRefundRequest());
	}

	/** Preferencja ADMIN: powiadom o nowym wniosku o rolę organizatora. */
	private boolean isNewOrganizerRequestEnabled(User user) {
		return user.getNotifyNewOrganizerRequest() == null || Boolean.TRUE.equals(user.getNotifyNewOrganizerRequest());
	}

	/** Preferencja ADMIN: powiadom o nowym zgłoszeniu bezpieczeństwa. */
	private boolean isNewSecurityReportEnabled(User user) {
		return user.getNotifyNewSecurityReport() == null || Boolean.TRUE.equals(user.getNotifyNewSecurityReport());
	}

	private boolean isOrgEventJoinEnabled(User user) {
		return user == null || user.getNotifyOrgEventJoin() == null || Boolean.TRUE.equals(user.getNotifyOrgEventJoin());
	}

	private boolean isOrgEventSoldOutEnabled(User user) {
		return user == null || user.getNotifyOrgEventSoldOut() == null || Boolean.TRUE.equals(user.getNotifyOrgEventSoldOut());
	}

	private boolean isOrgEventReviewEnabled(User user) {
		return user == null || user.getNotifyOrgEventReview() == null || Boolean.TRUE.equals(user.getNotifyOrgEventReview());
	}

	private boolean isOrgEventStartEnabled(User user) {
		return user == null || user.getNotifyOrgEventStart() == null || Boolean.TRUE.equals(user.getNotifyOrgEventStart());
	}

	private boolean isOrgEventRefundEnabled(User user) {
		return user == null || user.getNotifyOrgEventRefund() == null || Boolean.TRUE.equals(user.getNotifyOrgEventRefund());
	}

	private UserNotificationResponse toResponse(UserNotification notification) {
		return new UserNotificationResponse(
			notification.getId(),
			notification.getType(),
			notification.getMessage(),
			notification.getCreatedAt(),
			Boolean.TRUE.equals(notification.getRead())
		);
	}

	private String buildUserLabel(User user) {
		String login = user.getLogin() != null ? user.getLogin() : "nieznany";
		String imie = user.getImie() != null ? user.getImie().trim() : "";
		String nazwisko = user.getNazwisko() != null ? user.getNazwisko().trim() : "";
		String fullName = (imie + " " + nazwisko).trim();
		if (fullName.isEmpty()) {
			return login;
		}
		return login + " (" + fullName + ")";
	}

	private String eventTitle(Wydarzenie wydarzenie) {
		if (wydarzenie.getTytul() != null && !wydarzenie.getTytul().isBlank()) {
			return wydarzenie.getTytul().trim();
		}
		return "Wydarzenie #" + wydarzenie.getId();
	}

	private String formatDateTime(LocalDateTime value) {
		return value.toString().replace('T', ' ');
	}

	private String normalizeStatus(String status) {
		if (status == null) {
			return "";
		}
		return switch (status.trim().toUpperCase()) {
			case "AKTYWNE" -> STATUS_AKTYWNY;
			default -> status.trim().toUpperCase();
		};
	}
}
