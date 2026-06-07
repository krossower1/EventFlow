package com.eventflow.com.repository;

import com.eventflow.com.model.Sala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaRepository extends JpaRepository<Sala, Long> {
	@Query(value = """
		SELECT s.*
		FROM sale s
		WHERE s.miejsce_id = :miejsceId
		""", nativeQuery = true)
	List<Sala> findByMiejsceId(@Param("miejsceId") Long miejsceId);

	@Query(value = """
		SELECT s.*
		FROM sale s
		WHERE s.miejsce_id IN (:miejsceIds)
		""", nativeQuery = true)
	List<Sala> findByMiejsceIdIn(@Param("miejsceIds") List<Long> miejsceIds);

	@Query(value = """
		SELECT COUNT(s.id)
		FROM sale s
		WHERE s.miejsce_id = :miejsceId
		""", nativeQuery = true)
	long countByMiejsceId(@Param("miejsceId") Long miejsceId);
}
