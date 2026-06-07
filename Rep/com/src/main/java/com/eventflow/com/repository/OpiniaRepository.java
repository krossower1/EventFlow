package com.eventflow.com.repository;

import com.eventflow.com.model.Opinia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpiniaRepository extends JpaRepository<Opinia, Long> {
	@Query(value = """
		SELECT o.*
		FROM opinie o
		WHERE o.wyd_id = :wydId
		ORDER BY o.data DESC
		""", nativeQuery = true)
	List<Opinia> findByWydIdOrderByDataDesc(@Param("wydId") Long wydId);

	@Query(value = """
		SELECT o.*
		FROM opinie o
		WHERE o.wyd_id IN (:wydIds)
		""", nativeQuery = true)
	List<Opinia> findByWydIdIn(@Param("wydIds") List<Long> wydIds);

	@Query(value = """
		SELECT o.*
		FROM opinie o
		WHERE o.user_id = :userId
		""", nativeQuery = true)
	List<Opinia> findByUserId(@Param("userId") Long userId);
}
