package com.eventflow.com.controller.dto;

// Payload requestu do zmiany hasła zalogowanego użytkownika.
public record ChangeOwnPasswordRequest(
    String oldPassword,
    String newPassword,
    String confirmNewPassword
) {
}
