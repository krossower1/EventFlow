package com.eventflow.com.controller.dto;

import java.util.List;

public record PatchNotesResponse(
	String dateLabel,
	List<String> items
) {
}
