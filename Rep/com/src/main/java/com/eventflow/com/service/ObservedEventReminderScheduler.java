package com.eventflow.com.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ObservedEventReminderScheduler {

	private final NotificationService notificationService;

	public ObservedEventReminderScheduler(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@Scheduled(fixedRate = 300_000)
	public void runUpcomingStartReminders() {
		notificationService.sendUpcomingObservedEventStartReminders();
		notificationService.sendUpcomingOrganizerEventStartReminders();
	}
}
