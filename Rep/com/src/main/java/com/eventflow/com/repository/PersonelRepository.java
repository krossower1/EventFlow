package com.eventflow.com.repository;

import com.eventflow.com.model.Personel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonelRepository extends JpaRepository<Personel, Long> {
	@Query(value = """
		SELECT p.*
		FROM personel p
		WHERE p.wyd_id = :wydId
		ORDER BY p.data_zajet DESC
		""", nativeQuery = true)
	List<Personel> findByWydIdOrderByDataZajetDesc(@Param("wydId") Long wydId);

	@Query(value = """
		SELECT COUNT(p.id) > 0
		FROM personel p
		WHERE p.wyd_id = :wydId
		  AND p.user_id = :userId
		  AND LOWER(p.rola) = LOWER(:rola)
		""", nativeQuery = true)
	boolean existsByWydIdAndUserIdAndRolaIgnoreCase(
		@Param("wydId") Long wydId,
		@Param("userId") Long userId,
		@Param("rola") String rola
	);

	@Query(value = """
		SELECT p.*
		FROM personel p
		WHERE p.wyd_id IN (:wydIds)
		""", nativeQuery = true)
	List<Personel> findByWydIdIn(@Param("wydIds") List<Long> wydIds);

	@Query(value = """
		SELECT p.*
		FROM personel p
		WHERE p.user_id = :userId
		""", nativeQuery = true)
	List<Personel> findByUserId(@Param("userId") Long userId);
}
