package com.eventflow.com.repository;

import com.eventflow.com.model.Zamowienie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZamowienieRepository extends JpaRepository<Zamowienie, Long> {
}
