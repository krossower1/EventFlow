package com.eventflow.com.repository;

import com.eventflow.com.model.SalaMiejsce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaMiejsceRepository extends JpaRepository<SalaMiejsce, Long> {
	@Query(value = """
		SELECT sm.*
		FROM sala_miejsca sm
		WHERE sm.sala_id = :salaId
		""", nativeQuery = true)
	List<SalaMiejsce> findBySalaId(@Param("salaId") Long salaId);

	@Modifying
	@Query(value = """
		DELETE FROM sala_miejsca
		WHERE sala_id = :salaId
		""", nativeQuery = true)
	void deleteBySalaId(@Param("salaId") Long salaId);
}
