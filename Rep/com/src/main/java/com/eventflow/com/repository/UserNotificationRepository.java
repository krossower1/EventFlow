package com.eventflow.com.repository;

import com.eventflow.com.model.UserNotification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
	List<UserNotification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

	long countByUserIdAndReadFalse(Long userId);

	Optional<UserNotification> findByIdAndUserId(Long id, Long userId);

	List<UserNotification> findByUserIdAndReadFalse(Long userId);

	void deleteByIdAndUserId(Long id, Long userId);

	void deleteByUserId(Long userId);
}