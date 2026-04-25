package com.eventflow.com.repository;

import com.eventflow.com.model.Zamowienie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZamowienieRepository extends JpaRepository<Zamowienie, Long> {
	List<Zamowienie> findByUserId(Long userId);
	Zamowienie findFirstByPlatnId(Long platnId);
}
