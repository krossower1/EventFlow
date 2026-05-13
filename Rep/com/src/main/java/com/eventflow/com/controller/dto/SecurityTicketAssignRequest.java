package com.eventflow.com.controller.dto;

/** Body PUT {@code .../security-tickets/{id}/assign}: ID administratora lub {@code null} (cofnięcie przypisania). */
public record SecurityTicketAssignRequest(Long assignedAdminId) {
}
