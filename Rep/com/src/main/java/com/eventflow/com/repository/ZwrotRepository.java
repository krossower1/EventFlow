package com.eventflow.com.repository;

import com.eventflow.com.model.Zwrot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZwrotRepository extends JpaRepository<Zwrot, Long> {
	@Query(value = """
		SELECT z.*
		FROM zwroty z
		WHERE z.platn_id = :platnId
		LIMIT 1
		""", nativeQuery = true)
	Optional<Zwrot> findByPlatnId(@Param("platnId") Long platnId);

	@Query(value = """
		SELECT z.*
		FROM zwroty z
		WHERE z.platn_id IN (:platnIds)
		""", nativeQuery = true)
	List<Zwrot> findByPlatnIdIn(@Param("platnIds") List<Long> platnIds);

	List<Zwrot> findAllByOrderByIdDesc();
}
