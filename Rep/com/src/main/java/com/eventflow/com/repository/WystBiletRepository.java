package com.eventflow.com.repository;

import com.eventflow.com.model.WystBilet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WystBiletRepository extends JpaRepository<WystBilet, Long> {
	@Query(value = """
		SELECT wb.*
		FROM wyst_bilety wb
		WHERE wb.zam_id IN (:zamIds)
		""", nativeQuery = true)
	List<WystBilet> findByZamIdIn(@Param("zamIds") List<Long> zamIds);

	@Query(value = """
		SELECT wb.*
		FROM wyst_bilety wb
		WHERE wb.bilet_id IN (:biletIds)
		""", nativeQuery = true)
	List<WystBilet> findByBiletIdIn(@Param("biletIds") List<Long> biletIds);
}
