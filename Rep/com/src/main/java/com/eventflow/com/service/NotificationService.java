package com.eventflow.com.service;

import com.eventflow.com.controller.dto.UnreadNotificationsCountResponse;
import com.eventflow.com.controller.dto.UserNotificationResponse;
import com.eventflow.com.model.User;
import com.eventflow.com.model.UserNotification;
import com.eventflow.com.model.UserObservedEvent;
import com.eventflow.com.model.Wydarzenie;
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

	private static final String STATUS_AKTYWNY = "AKTYWNY";
	public static final int START_REMINDER_HOURS_BEFORE = 24;

	private final UserRepository userRepository;
	private final UserNotificationRepository userNotificationRepository;
	private final UserObservedEventRepository userObservedEventRepository;
	private final UserFavoriteRepository userFavoriteRepository;
	private final WydarzenieRepository wydarzenieRepository;

	public NotificationService(
		UserRepository userRepository,
		UserNotificationRepository userNotificationRepository,
		UserObservedEventRepository userObservedEventRepository,
		UserFavoriteRepository userFavoriteRepository,
		WydarzenieRepository wydarzenieRepository
	) {
		this.userRepository = userRepository;
		this.userNotificationRepository = userNotificationRepository;
		this.userObservedEventRepository = userObservedEventRepository;
		this.userFavoriteRepository = userFavoriteRepository;
		this.wydarzenieRepository = wydarzenieRepository;
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
