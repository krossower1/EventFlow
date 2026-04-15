package com.eventflow.com.repository;

import com.eventflow.com.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLogin(String login);
    Optional<User> findByEmail(String email);
    boolean existsByLogin(String login);
    boolean existsByEmail(String email);
}
