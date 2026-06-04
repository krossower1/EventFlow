package com.eventflow.com.controller.dto;

public record UpdatePaymentMethodDto(
    String paymentMethod,
    String bankAccountNumber
) {
}
