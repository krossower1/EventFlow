package com.eventflow.com.repository;

import com.eventflow.com.model.Kategoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KategoriaRepository extends JpaRepository<Kategoria, Long> {
	List<Kategoria> findByCreatedByUserId(Long userId);
}
