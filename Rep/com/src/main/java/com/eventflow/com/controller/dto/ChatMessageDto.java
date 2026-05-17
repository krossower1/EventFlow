package com.eventflow.com.controller.dto;

import java.time.LocalDateTime;

public record ChatMessageDto(
	Long id,
	Long senderId,
	Long receiverId,
	String content,
	LocalDateTime sentAt
) {
}
