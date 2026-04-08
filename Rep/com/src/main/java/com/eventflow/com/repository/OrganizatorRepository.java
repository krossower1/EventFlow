package com.eventflow.com.repository;

import com.eventflow.com.model.Organizator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizatorRepository extends JpaRepository<Organizator, Long> {
	boolean existsByUserId(Long userId);
	Optional<Organizator> findByUserId(Long userId);
	Optional<Organizator> findByUserIdAndZweryfikowTrue(Long userId);
}
