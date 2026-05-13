package com.eventflow.com.repository;

import com.eventflow.com.model.LoginLog;
import com.eventflow.com.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
	// Zwraca najnowsze wpisy historii logowań konkretnego użytkownika z limitem.
	List<LoginLog> findByUserOrderByLoginTimeDesc(User user, Pageable pageable);

	Optional<LoginLog> findByIdAndUser(Long id, User user);
}
