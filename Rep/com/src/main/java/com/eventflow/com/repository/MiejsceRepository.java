package com.eventflow.com.repository;

import com.eventflow.com.model.Miejsce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MiejsceRepository extends JpaRepository<Miejsce, Long> {
	List<Miejsce> findByUserId(Long userId);
}
