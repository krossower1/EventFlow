package com.eventflow.com.controller.dto;

/**
 * Body POST {@code /api/users/me/security-tickets/report-login}.
 *
 * @param loginLogId wymagane — ID wpisu z {@code login_logs} należącego do zalogowanego użytkownika
 * @param note       opcjonalna wiadomość od zgłaszającego (doklejana do opisu zgłoszenia)
 */
public record ReportSuspiciousLoginRequest(Long loginLogId, String note) {
}
