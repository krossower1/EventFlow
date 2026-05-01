package com.eventflow.com.repository;

import com.eventflow.com.model.Zgloszenie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZgloszenieRepository extends JpaRepository<Zgloszenie, Long> {
	List<Zgloszenie> findByWydIdOrderByUtworzonyDesc(Long wydId);
	List<Zgloszenie> findByWydIdIn(List<Long> wydIds);
	List<Zgloszenie> findByUserId(Long userId);
}
