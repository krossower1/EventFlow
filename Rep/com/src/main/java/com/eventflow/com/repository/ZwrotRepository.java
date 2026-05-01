package com.eventflow.com.repository;

import com.eventflow.com.model.Zwrot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZwrotRepository extends JpaRepository<Zwrot, Long> {
	Optional<Zwrot> findByPlatnId(Long platnId);
	List<Zwrot> findByPlatnIdIn(List<Long> platnIds);
	List<Zwrot> findAllByOrderByIdDesc();
}
