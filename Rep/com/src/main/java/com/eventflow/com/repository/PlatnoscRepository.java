package com.eventflow.com.repository;

import com.eventflow.com.model.Platnosc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlatnoscRepository extends JpaRepository<Platnosc, Long> {
}
