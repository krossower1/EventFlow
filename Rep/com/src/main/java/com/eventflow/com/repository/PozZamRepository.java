package com.eventflow.com.repository;

import com.eventflow.com.model.PozZam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PozZamRepository extends JpaRepository<PozZam, Long> {
	@Query(value = """
		SELECT pz.*
		FROM poz_zam pz
		WHERE pz.bilet_id IN (:biletIds)
		""", nativeQuery = true)
	List<PozZam> findByBiletIdIn(@Param("biletIds") List<Long> biletIds);

	@Query(value = """
		SELECT pz.*
		FROM poz_zam pz
		WHERE pz.bilet_id = :biletId
		LIMIT 1
		""", nativeQuery = true)
	Optional<PozZam> findByBiletId(@Param("biletId") Long biletId);
}
