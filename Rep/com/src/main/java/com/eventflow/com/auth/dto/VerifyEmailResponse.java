package com.eventflow.com.auth.dto;

public record VerifyEmailResponse(
    boolean success,
    String message
) {
}
