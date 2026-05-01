package com.eventflow.com.repository;

import com.eventflow.com.model.Bilet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BiletRepository extends JpaRepository<Bilet, Long> {
	List<Bilet> findByWydarzenieId(Long wydarzenieId);
	List<Bilet> findByWydarzenieIdIn(List<Long> wydarzenieIds);
}
