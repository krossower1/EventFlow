package com.eventflow.com.repository;

import com.eventflow.com.model.Zgloszenie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZgloszenieRepository extends JpaRepository<Zgloszenie, Long> {
	@Query(value = """
		SELECT z.*
		FROM zgloszenia z
		WHERE z.wyd_id = :wydId
		ORDER BY z.utworzony DESC
		""", nativeQuery = true)
	List<Zgloszenie> findByWydIdOrderByUtworzonyDesc(@Param("wydId") Long wydId);

	@Query(value = """
		SELECT z.*
		FROM zgloszenia z
		WHERE z.wyd_id IN (:wydIds)
		""", nativeQuery = true)
	List<Zgloszenie> findByWydIdIn(@Param("wydIds") List<Long> wydIds);

	@Query(value = """
		SELECT z.*
		FROM zgloszenia z
		WHERE z.user_id = :userId
		""", nativeQuery = true)
	List<Zgloszenie> findByUserId(@Param("userId") Long userId);
}
