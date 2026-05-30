package com.eventflow.com.controller.dto;

import java.math.BigDecimal;

public record AddFundsRequestDto(
    BigDecimal amount
) {
}
