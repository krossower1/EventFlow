package com.eventflow.com.repository;

import com.eventflow.com.model.Miejsce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MiejsceRepository extends JpaRepository<Miejsce, Long> {
	@Query(value = """
		SELECT m.*
		FROM miejsca m
		WHERE m.user_id = :userId
		""", nativeQuery = true)
	List<Miejsce> findByUserId(@Param("userId") Long userId);
}
