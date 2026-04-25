package com.eventflow.com.repository;

import com.eventflow.com.model.Opinia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpiniaRepository extends JpaRepository<Opinia, Long> {
	List<Opinia> findByWydIdOrderByDataDesc(Long wydId);
}
