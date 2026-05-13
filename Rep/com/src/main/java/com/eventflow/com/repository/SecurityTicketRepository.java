package com.eventflow.com.repository;

import com.eventflow.com.model.SecurityTicket;
import com.eventflow.com.model.SecurityTicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Dostęp do tabeli {@code security_tickets}.
 * <p>
 * {@link JpaSpecificationExecutor} umożliwia dynamiczne filtry (status, kategoria, użytkownik) w {@link com.eventflow.com.service.SecurityTicketService#findTickets}.
 */
public interface SecurityTicketRepository extends JpaRepository<SecurityTicket, Long>, JpaSpecificationExecutor<SecurityTicket> {

	/** Liczba zgłoszeń w danym statusie — używana m.in. przez {@code /count-new}. */
	long countByStatus(SecurityTicketStatus status);
}
