package com.eventflow.com.controller.dto;

/** Body PUT {@code .../security-tickets/{id}/status}: pole {@code status} = nazwa {@link com.eventflow.com.model.SecurityTicketStatus}. */
public record SecurityTicketStatusUpdateRequest(String status) {
}
