package com.eventflow.com.controller.dto;

public record UpdateOwnProfileRequest(
    String imie,
    String nazwisko,
    String email,
    String telefon
) {
}
