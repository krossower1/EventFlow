package com.eventflow.com.repository;

import com.eventflow.com.model.Bilet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BiletRepository extends JpaRepository<Bilet, Long> {
	@Query(value = """
		SELECT b.*
		FROM bilety b
		WHERE b.wydarzenie_id = :wydarzenieId
		""", nativeQuery = true)
	List<Bilet> findByWydarzenieId(@Param("wydarzenieId") Long wydarzenieId);

	@Query(value = """
		SELECT b.*
		FROM bilety b
		WHERE b.wydarzenie_id IN (:wydarzenieIds)
		""", nativeQuery = true)
	List<Bilet> findByWydarzenieIdIn(@Param("wydarzenieIds") List<Long> wydarzenieIds);
}
