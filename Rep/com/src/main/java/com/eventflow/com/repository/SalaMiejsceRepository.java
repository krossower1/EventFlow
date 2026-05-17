package com.eventflow.com.repository;

import com.eventflow.com.model.SalaMiejsce;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalaMiejsceRepository extends JpaRepository<SalaMiejsce, Long> {
	List<SalaMiejsce> findBySalaId(Long salaId);
	void deleteBySalaId(Long salaId);
}
