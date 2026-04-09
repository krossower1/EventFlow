package com.eventflow.com.repository;

import com.eventflow.com.model.Wydarzenie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WydarzenieRepository extends JpaRepository<Wydarzenie, Long> {
	List<Wydarzenie> findByOrgId(Long orgId);
	List<Wydarzenie> findByDataZamkAfterOrderByDataRozpAsc(LocalDateTime now);
}
