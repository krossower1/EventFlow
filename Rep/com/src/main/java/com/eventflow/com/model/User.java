package com.eventflow.com.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // bigint unsigned -> Long

    private String imie;
    private String nazwisko;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String login;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String haslo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String salt;

    @Column(columnDefinition = "TEXT")
    private String platnosc;

    private String rola;

    @Column(name = "data_utw")
    private LocalDateTime dataUtw;

    private Boolean aktywnosc; // tinyint(1) -> Boolean
}
