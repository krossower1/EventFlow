package com.eventflow.com.service;

import com.eventflow.com.model.LoginLog;
import com.eventflow.com.model.SecurityTicket;
import com.eventflow.com.model.SecurityTicketAudit;
import com.eventflow.com.model.SecurityTicketCategory;
import com.eventflow.com.model.SecurityTicketSource;
import com.eventflow.com.model.SecurityTicketStatus;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.LoginLogRepository;
import com.eventflow.com.repository.OrganizatorRepository;
import com.eventflow.com.repository.SecurityTicketAuditRepository;
import com.eventflow.com.repository.SecurityTicketRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.auth.AuthService;
import com.eventflow.com.auth.EmailService;
import com.eventflow.com.controller.dto.SecurityTicketAdminResponse;
import com.eventflow.com.controller.dto.SecurityTicketAuditResponse;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Logika domenowa zgłoszeń bezpieczeństwa (skrzynka administratorów).
 * <p>
 * Odpowiada za: tworzenie zgłoszenia z historii logowań, listę i filtry dla admina,
 * zmianę statusu i przypisanie, wpisy audytu w {@code security_ticket_audits},
 * szybkie akcje na koncie użytkownika oraz opcjonalny e-mail alertowy dla zgłoszeń
 * uznanych za krytyczne (konto organizatora).
 * <p>
 * Uprawnienia ADMIN są weryfikowane tutaj dla operacji wywoływanych z panelu;
 * endpoint zgłoszenia przez użytkownika wywołuje metody z już zweryfikowanym {@code reporter}.
 */
@Service
public class SecurityTicketService {

	private static final Logger log = LoggerFactory.getLogger(SecurityTicketService.class);

	/** Format czasu używany w treściach wpisów audytu (czytelny dla admina). */
	private static final DateTimeFormatter AUDIT_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss", Locale.ROOT);

	private final SecurityTicketRepository ticketRepository;
	private final SecurityTicketAuditRepository auditRepository;
	private final UserRepository userRepository;
	private final LoginLogRepository loginLogRepository;
	private final OrganizatorRepository organizatorRepository;
	private final EmailService emailService;
	private final AuthService authService;

	public SecurityTicketService(
		SecurityTicketRepository ticketRepository,
		SecurityTicketAuditRepository auditRepository,
		UserRepository userRepository,
		LoginLogRepository loginLogRepository,
		OrganizatorRepository organizatorRepository,
		EmailService emailService,
		AuthService authService
	) {
		this.ticketRepository = ticketRepository;
		this.auditRepository = auditRepository;
		this.userRepository = userRepository;
		this.loginLogRepository = loginLogRepository;
		this.organizatorRepository = organizatorRepository;
		this.emailService = emailService;
		this.authService = authService;
	}

	/**
	 * Liczba zgłoszeń w statusie {@link SecurityTicketStatus#NEW} — np. pod badge lub statystykę.
	 */
	public long countNewTickets() {
		return ticketRepository.countByStatus(SecurityTicketStatus.NEW);
	}

	/**
	 * Lista zgłoszeń dla panelu admina z opcjonalnymi filtrami.
	 *
	 * @param admin          musi być ADMIN; inaczej {@link ResponseStatusException} FORBIDDEN
	 * @param status         filtr po statusie lub {@code null} = wszystkie
	 * @param category       filtr po kategorii lub {@code null} = wszystkie
	 * @param affectedUserId filtr po ID konta „ofiary” lub {@code null}
	 * @return rekordy DTO gotowe do serializacji JSON
	 */
	@Transactional(readOnly = true)
	public List<SecurityTicketAdminResponse> listForAdmin(
		User admin,
		SecurityTicketStatus status,
		SecurityTicketCategory category,
		Long affectedUserId
	) {
		requireAdmin(admin);
		return findTickets(status, category, affectedUserId).stream()
			.map(this::toAdminResponse)
			.toList();
	}

	/**
	 * Chronologiczna historia audytu jednego zgłoszenia (komunikaty tekstowe + aktor).
	 * Sprawdza istnienie zgłoszenia, żeby nie zwracać audytu dla obcego ID.
	 */
	@Transactional(readOnly = true)
	public List<SecurityTicketAuditResponse> listAuditsForAdmin(User admin, Long ticketId) {
		requireAdmin(admin);
		ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		return getAuditTrail(ticketId).stream()
			.map(a -> new SecurityTicketAuditResponse(
				a.getId(),
				a.getActorUser() != null ? a.getActorUser().getId() : null,
				a.getActorUser() != null ? a.getActorUser().getLogin() : null,
				a.getMessage(),
				a.getCreatedAt()
			))
			.toList();
	}

	/**
	 * Tworzy zgłoszenie z historii logowań i od razu zwraca ten sam widok co lista admina (jeden round-trip z UI).
	 */
	@Transactional
	public SecurityTicketAdminResponse reportSuspiciousLoginReturningDto(User reporter, Long loginLogId, String extraNote) {
		SecurityTicket ticket = reportSuspiciousLogin(reporter, loginLogId, extraNote);
		return toAdminResponse(ticket);
	}

	/** Mapowanie encji na DTO listy / szczegółów w panelu administracyjnym. */
	private SecurityTicketAdminResponse toAdminResponse(SecurityTicket t) {
		boolean affectedActive = !Boolean.FALSE.equals(t.getAffectedUser().getAktywnosc());
		return new SecurityTicketAdminResponse(
			t.getId(),
			t.getReporterUser() != null ? t.getReporterUser().getId() : null,
			t.getReporterUser() != null ? t.getReporterUser().getLogin() : null,
			t.getAffectedUser().getId(),
			t.getAffectedUser().getLogin(),
			affectedActive,
			t.getSource().name(),
			t.getCategory().name(),
			t.getDescription(),
			t.getStatus().name(),
			t.getAssignedAdmin() != null ? t.getAssignedAdmin().getId() : null,
			t.getAssignedAdmin() != null ? t.getAssignedAdmin().getLogin() : null,
			t.getRelatedLoginLogId(),
			t.getCreatedAt(),
			t.getUpdatedAt()
		);
	}

	/**
	 * Pojedyncze zgłoszenie po ID — np. po aktualizacji statusu, gdy kontroler zwraca świeży stan.
	 */
	@Transactional(readOnly = true)
	public SecurityTicketAdminResponse getForAdmin(User admin, Long ticketId) {
		requireAdmin(admin);
		SecurityTicket t = ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		return toAdminResponse(t);
	}

	/**
	 * Buduje zapytanie JPA Specification: filtry AND, sortowanie malejąco po dacie utworzenia.
	 * Wykorzystywane przez listę admina; same filtry mogą być {@code null} (ignorowane).
	 */
	@Transactional(readOnly = true)
	public List<SecurityTicket> findTickets(
		SecurityTicketStatus status,
		SecurityTicketCategory category,
		Long affectedUserId
	) {
		Specification<SecurityTicket> spec = Specification.where(null);
		if (status != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
		}
		if (category != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category));
		}
		if (affectedUserId != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("affectedUser").get("id"), affectedUserId));
		}
		return ticketRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
	}

	/** Surowa lista encji audytu z repozytorium (bez mapowania na DTO). */
	@Transactional(readOnly = true)
	public List<SecurityTicketAudit> getAuditTrail(Long ticketId) {
		return auditRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
	}

	/**
	 * Zgłoszenie przez użytkownika: powiązanie z konkretnym wpisem {@link LoginLog} należącym do zgłaszającego.
	 * <p>
	 * Ustawia źródło {@link SecurityTicketSource#USER_REPORT}, kategorię {@link SecurityTicketCategory#USER_FLAGGED_LOG},
	 * zapisuje opis z danymi urządzenia/lokalizacji ze wpisu, dodaje pierwszy audyt i ewentualnie wysyła mail krytyczny.
	 *
	 * @param reporter   zalogowany użytkownik (właściciel wpisu historii)
	 * @param loginLogId ID wiersza w {@code login_logs}
	 * @param extraNote  opcjonalna notatka od użytkownika (doklejana do opisu)
	 */
	@Transactional
	public SecurityTicket reportSuspiciousLogin(User reporter, Long loginLogId, String extraNote) {
		LoginLog loginLogRow = loginLogRepository.findByIdAndUser(loginLogId, reporter)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Nie znaleziono wpisu historii logowań."));
		StringBuilder description = new StringBuilder();
		description.append("Użytkownik zgłosił wpis z historii logowań.\n");
		description.append("Data wpisu: ").append(loginLogRow.getLoginTime()).append("\n");
		description.append("Urządzenie: ").append(nullToUnknown(loginLogRow.getDeviceInfo())).append("\n");
		description.append("Lokalizacja: ").append(nullToUnknown(loginLogRow.getLocation())).append("\n");
		description.append("Status techniczny: ").append(loginLogRow.getStatus()).append("\n");
		if (extraNote != null && !extraNote.isBlank()) {
			description.append("Uwagi zgłaszającego: ").append(extraNote.trim());
		}
		SecurityTicket ticket = new SecurityTicket();
		ticket.setReporterUser(reporter);
		ticket.setAffectedUser(reporter);
		ticket.setSource(SecurityTicketSource.USER_REPORT);
		ticket.setCategory(SecurityTicketCategory.USER_FLAGGED_LOG);
		ticket.setDescription(description.toString());
		ticket.setStatus(SecurityTicketStatus.NEW);
		ticket.setRelatedLoginLogId(loginLogRow.getId());
		ticket.setCreatedAt(LocalDateTime.now());
		ticket.setUpdatedAt(LocalDateTime.now());
		ticket = ticketRepository.save(ticket);
		String actorLabel = formatUserLabel(reporter);
		appendAudit(ticket, reporter, "%s utworzył(a) zgłoszenie #%d (zgłoszenie z historii logowań).".formatted(actorLabel, ticket.getId()));
		maybeSendCriticalEmail(ticket);
		return ticket;
	}

	/**
	 * Zmiana statusu zgłoszenia przez admina + wpis audytu (stary i nowy status + czas).
	 * Przy przejściu do {@link SecurityTicketStatus#IN_PROGRESS} bez wcześniejszego przypisania
	 * automatycznie przypisywany jest aktualnie działający admin (żeby było wiadomo, kto „podjął” sprawę).
	 */
	@Transactional
	public SecurityTicket updateStatus(User admin, Long ticketId, SecurityTicketStatus newStatus) {
		requireAdmin(admin);
		SecurityTicket ticket = ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		SecurityTicketStatus old = ticket.getStatus();
		if (newStatus == SecurityTicketStatus.IN_PROGRESS && ticket.getAssignedAdmin() == null) {
			ticket.setAssignedAdmin(admin);
		}
		ticket.setStatus(newStatus);
		ticket.setUpdatedAt(LocalDateTime.now());
		ticketRepository.save(ticket);
		String actorLabel = formatUserLabel(admin);
		appendAudit(ticket, admin, "%s zmienił(a) status zgłoszenia #%d z %s na %s dnia %s."
			.formatted(actorLabel, ticket.getId(), old, newStatus, LocalDateTime.now().format(AUDIT_TIME)));
		return ticket;
	}

	/**
	 * Przypisanie zgłoszenia do administratora (lub {@code null} = cofnięcie przypisania).
	 * Waliduje, że wskazany użytkownik istnieje i ma rolę ADMIN.
	 */
	@Transactional
	public SecurityTicket assign(User admin, Long ticketId, Long assignedAdminId) {
		requireAdmin(admin);
		SecurityTicket ticket = ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		User assignee = null;
		if (assignedAdminId != null) {
			assignee = userRepository.findById(assignedAdminId)
				.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono administratora."));
			if (!"ADMIN".equalsIgnoreCase(assignee.getRola())) {
				throw new ResponseStatusException(BAD_REQUEST, "Można przypisać tylko użytkownika z rolą ADMIN.");
			}
		}
		ticket.setAssignedAdmin(assignee);
		ticket.setUpdatedAt(LocalDateTime.now());
		ticketRepository.save(ticket);
		String actorLabel = formatUserLabel(admin);
		String targetLabel = assignee != null ? formatUserLabel(assignee) : "(nie przypisano)";
		appendAudit(ticket, admin, "%s przypisał(a) zgłoszenie #%d do %s dnia %s."
			.formatted(actorLabel, ticket.getId(), targetLabel, LocalDateTime.now().format(AUDIT_TIME)));
		return ticket;
	}

	/** Skrót: status {@link SecurityTicketStatus#DISMISSED} (fałszywy alarm) z pełnym audytem przez {@link #updateStatus}. */
	@Transactional
	public SecurityTicket quickDismiss(User admin, Long ticketId) {
		return updateStatus(admin, ticketId, SecurityTicketStatus.DISMISSED);
	}

	/**
	 * Szybka akcja: dezaktywacja konta użytkownika objętego zgłoszeniem ({@code aktywnosc = false}).
	 * Zabezpieczenia: nie wolno zablokować siebie ani innego konta z rolą ADMIN.
	 * Status zgłoszenia ustawiany na {@link SecurityTicketStatus#IN_PROGRESS} (sprawa w toku po ingerencji).
	 */
	@Transactional
	public SecurityTicket quickBlockAccount(User admin, Long ticketId) {
		requireAdmin(admin);
		SecurityTicket ticket = ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		User affected = ticket.getAffectedUser();
		if (affected.getId().equals(admin.getId())) {
			throw new ResponseStatusException(BAD_REQUEST, "Nie można zablokować własnego konta.");
		}
		if ("ADMIN".equalsIgnoreCase(affected.getRola())) {
			throw new ResponseStatusException(BAD_REQUEST, "Nie można zablokować konta administratora.");
		}
		if (Boolean.FALSE.equals(affected.getAktywnosc())) {
			throw new ResponseStatusException(BAD_REQUEST, "Konto jest już zawieszone.");
		}
		affected.setAktywnosc(false);
		userRepository.save(affected);
		appendAudit(ticket, admin, "%s wykonał(a) szybką akcję: zawieszenie konta użytkownika %s (zgłoszenie #%d)."
			.formatted(formatUserLabel(admin), affected.getLogin(), ticket.getId()));
		ticket.setStatus(SecurityTicketStatus.IN_PROGRESS);
		if (ticket.getAssignedAdmin() == null) {
			ticket.setAssignedAdmin(admin);
		}
		ticket.setUpdatedAt(LocalDateTime.now());
		ticketRepository.save(ticket);
		return ticket;
	}

	/**
	 * Ponowna aktywacja konta ofiary ({@code aktywnosc = true}), jeśli było zawieszone.
	 * Nie dotyczy reguł „nie blokuj ADMIN” — odblokowanie służy też naprawie stanu w bazie.
	 */
	@Transactional
	public SecurityTicket quickUnblockAccount(User admin, Long ticketId) {
		requireAdmin(admin);
		SecurityTicket ticket = ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		User affected = ticket.getAffectedUser();
		if (!Boolean.FALSE.equals(affected.getAktywnosc())) {
			throw new ResponseStatusException(BAD_REQUEST, "Konto nie jest zawieszone.");
		}
		affected.setAktywnosc(true);
		userRepository.save(affected);
		appendAudit(ticket, admin, "%s wykonał(a) szybką akcję: ponowna aktywacja konta użytkownika %s (zgłoszenie #%d)."
			.formatted(formatUserLabel(admin), affected.getLogin(), ticket.getId()));
		ticket.setStatus(SecurityTicketStatus.IN_PROGRESS);
		if (ticket.getAssignedAdmin() == null) {
			ticket.setAssignedAdmin(admin);
		}
		ticket.setUpdatedAt(LocalDateTime.now());
		ticketRepository.save(ticket);
		return ticket;
	}

	/**
	 * Szybka akcja: wymuszenie resetu hasła dla konta „ofiary” przez mechanizm w {@link AuthService}
	 * (tymczasowe hasło na e-mail użytkownika). Audyt + status jak przy blokadzie.
	 */
	@Transactional
	public SecurityTicket quickForcePasswordReset(User admin, Long ticketId) {
		requireAdmin(admin);
		SecurityTicket ticket = ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		User affected = ticket.getAffectedUser();
		authService.adminForcePasswordReset(affected, admin);
		appendAudit(ticket, admin, "%s wymusił(a) reset hasła dla użytkownika %s (zgłoszenie #%d). Tymczasowe hasło wysłano na email konta."
			.formatted(formatUserLabel(admin), affected.getLogin(), ticket.getId()));
		ticket.setStatus(SecurityTicketStatus.IN_PROGRESS);
		if (ticket.getAssignedAdmin() == null) {
			ticket.setAssignedAdmin(admin);
		}
		ticket.setUpdatedAt(LocalDateTime.now());
		ticketRepository.save(ticket);
		return ticket;
	}

	/**
	 * Trwałe usunięcie zgłoszenia: najpierw wszystkie wpisy audytu (FK), potem wiersz zgłoszenia.
	 */
	@Transactional
	public void deleteTicket(User admin, Long ticketId) {
		requireAdmin(admin);
		SecurityTicket ticket = ticketRepository.findById(ticketId)
			.orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Brak zgłoszenia."));
		auditRepository.deleteAllForTicket(ticket.getId());
		ticketRepository.delete(ticket);
	}

	/** Rzuca {@code 403}, jeśli użytkownik nie jest administratorem. */
	private void requireAdmin(User user) {
		if (user == null || !"ADMIN".equalsIgnoreCase(user.getRola())) {
			throw new ResponseStatusException(FORBIDDEN, "Wymagana rola ADMIN.");
		}
	}

	/** Zapis pojedynczej linii audytu powiązanej ze zgłoszeniem. */
	private void appendAudit(SecurityTicket ticket, User actor, String message) {
		SecurityTicketAudit row = new SecurityTicketAudit();
		row.setTicket(ticket);
		row.setActorUser(actor);
		row.setMessage(message);
		row.setCreatedAt(LocalDateTime.now());
		auditRepository.save(row);
	}

	/**
	 * Etykieta użytkownika w treści audytu: imię i nazwisko lub login + rola.
	 */
	private String formatUserLabel(User u) {
		String role = "ADMIN".equalsIgnoreCase(u.getRola()) ? "ADMIN" : u.getRola() != null ? u.getRola() : "USER";
		String name = (u.getImie() != null ? u.getImie() : "").trim() + " " + (u.getNazwisko() != null ? u.getNazwisko() : "").trim();
		name = name.trim();
		if (name.isEmpty()) {
			return "Użytkownik %s (%s)".formatted(u.getLogin(), role);
		}
		return "Użytkownik %s (%s)".formatted(name.trim(), role);
	}

	/** Zamiana pustych stringów na słowo „nieznane” w opisie zgłoszenia z historii logowań. */
	private String nullToUnknown(String s) {
		return s == null || s.isBlank() ? "nieznane" : s;
	}

	/**
	 * Jednorazowy e-mail na adres z {@code app.security.alerts-email}, jeśli zgłoszenie jest „krytyczne”
	 * ({@link #isCriticalTicket}) i mail nie był jeszcze wysłany.
	 * <p>
	 * Błąd SMTP lub inny runtime przy wysyłce jest łapany — <strong>nie cofa</strong> zapisu zgłoszenia w tej samej transakcji
	 * (wcześniejszy problem z rollbackiem przy wyjątku z maila).
	 */
	private void maybeSendCriticalEmail(SecurityTicket ticket) {
		if (ticket.isCriticalAlertEmailSent()) {
			return;
		}
		if (!isCriticalTicket(ticket)) {
			return;
		}
		try {
			emailService.sendSecurityInboxAlert(
				"EventFlow — nowe krytyczne zgłoszenie bezpieczeństwa #%d".formatted(ticket.getId()),
				"Wpadło nowe zgłoszenie #%d (kategoria: %s, konto: %s). Zaloguj się do panelu administracyjnego, aby je przejrzeć: /admin/security-inbox"
					.formatted(ticket.getId(), ticket.getCategory(), ticket.getAffectedUser().getLogin())
			);
			ticket.setCriticalAlertEmailSent(true);
			ticketRepository.save(ticket);
		} catch (RuntimeException e) {
			log.warn("Nie udało się wysłać maila krytycznego dla zgłoszenia {}: {}", ticket.getId(), e.getMessage());
		}
	}

	/**
	 * Krytyczność wg obecnych reguł produktu: konto dotknięte zgłoszeniem jest powiązane z rekordem organizatora.
	 * Służy wyłącznie do decyzji o wysłaniu opcjonalnego alertu e-mail.
	 */
	private boolean isCriticalTicket(SecurityTicket ticket) {
		Long uid = ticket.getAffectedUser().getId();
		return organizatorRepository.existsByUserId(uid);
	}
}
