package com.eventflow.com.repository;

import com.eventflow.com.model.Organizator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface OrganizatorRepository extends JpaRepository<Organizator, Long> {
	boolean existsByUserId(Long userId);

	@Query(value = """
		SELECT o.*
		FROM organizator o
		WHERE o.user_id = :userId
		LIMIT 1
		""", nativeQuery = true)
	Optional<Organizator> findByUserId(@Param("userId") Long userId);

	@Query(value = """
		SELECT o.*
		FROM organizator o
		WHERE o.user_id = :userId
		  AND o.zweryfikow = TRUE
		LIMIT 1
		""", nativeQuery = true)
	Optional<Organizator> findByUserIdAndZweryfikowTrue(@Param("userId") Long userId);

	List<Organizator> findAllByOrderByZweryfikowAscDataUtwDesc();
}
