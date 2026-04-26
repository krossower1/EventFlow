package com.eventflow.com.repository;

import com.eventflow.com.model.Personel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonelRepository extends JpaRepository<Personel, Long> {
	List<Personel> findByWydIdOrderByDataZajetDesc(Long wydId);
	boolean existsByWydIdAndUserIdAndRolaIgnoreCase(Long wydId, Long userId, String rola);
}
