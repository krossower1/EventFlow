package com.eventflow.com.repository;

import com.eventflow.com.model.WystBilet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WystBiletRepository extends JpaRepository<WystBilet, Long> {
	List<WystBilet> findByZamIdIn(List<Long> zamIds);
	List<WystBilet> findByBiletIdIn(List<Long> biletIds);
}
