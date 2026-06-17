package com.eventflow.com.repository;

import com.eventflow.com.model.UserObservedEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Dostęp do tabeli {@code user_observed_events} — lista obserwowanych wydarzeń per użytkownik.
 */
public interface UserObservedEventRepository extends JpaRepository<UserObservedEvent, Long> {
	/** Wszystkie obserwowane wydarzenia użytkownika, od najnowszego dodania. */
	List<UserObservedEvent> findByUserIdOrderByCreatedAtDesc(Long userId);

	/** Sprawdzenie, czy dany użytkownik już obserwuje konkretne wydarzenie (np. przed POST). */
	Optional<UserObservedEvent> findByUserIdAndWydarzenieId(Long userId, Long wydarzenieId);

	/** Usunięcie wszystkich wpisów użytkownika (np. przy kaskadowym usuwaniu konta). */
	void deleteByUserId(Long userId);

	void deleteByWydarzenieId(Long wydarzenieId);

	List<UserObservedEvent> findByWydarzenieId(Long wydarzenieId);

	List<UserObservedEvent> findByStartReminderSentAtIsNull();
}
