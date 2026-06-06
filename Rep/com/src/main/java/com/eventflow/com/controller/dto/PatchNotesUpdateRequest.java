package com.eventflow.com.controller.dto;

import java.util.List;

public record PatchNotesUpdateRequest(
	String dateLabel,
	List<String> items
) {
}
