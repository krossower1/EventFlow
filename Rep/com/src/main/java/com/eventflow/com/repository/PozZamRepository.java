package com.eventflow.com.repository;

import com.eventflow.com.model.PozZam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PozZamRepository extends JpaRepository<PozZam, Long> {
	List<PozZam> findByBiletIdIn(List<Long> biletIds);
	Optional<PozZam> findByBiletId(Long biletId);
}
