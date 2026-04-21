package com.eventflow.com.repository;

import com.eventflow.com.model.WystBilet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WystBiletRepository extends JpaRepository<WystBilet, Long> {
}
