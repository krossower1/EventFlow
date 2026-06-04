package com.eventflow.com.controller.dto;

import java.math.BigDecimal;

public record WalletDto(
    BigDecimal balance,
    String bankAccountNumber,
    String paymentMethod
) {
}
