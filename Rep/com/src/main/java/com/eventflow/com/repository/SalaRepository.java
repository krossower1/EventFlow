package com.eventflow.com.repository;

import com.eventflow.com.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaRepository extends JpaRepository<Sala, Long> {
	List<Sala> findByMiejsceId(Long miejsceId);
}
