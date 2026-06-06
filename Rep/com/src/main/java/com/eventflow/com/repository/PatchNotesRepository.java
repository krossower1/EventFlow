package com.eventflow.com.repository;

import com.eventflow.com.model.PatchNotes;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatchNotesRepository extends JpaRepository<PatchNotes, Long> {
}
