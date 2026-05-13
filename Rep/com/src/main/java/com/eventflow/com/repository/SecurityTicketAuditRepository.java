package com.eventflow.com.repository;

import com.eventflow.com.model.SecurityTicketAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Dostęp do tabeli {@code security_ticket_audits}.
 */
public interface SecurityTicketAuditRepository extends JpaRepository<SecurityTicketAudit, Long> {
	/** Historia audytu jednego zgłoszenia, rosnąco po czasie (czytelny timeline). */
	List<SecurityTicketAudit> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

	/**
	 * Usuwa wszystkie audyty dla zgłoszenia przed usunięciem samego zgłoszenia (porządek przy FK / czystość danych).
	 * {@code clearAutomatically = true} — odświeżenie persistence context po DELETE.
	 */
	@Modifying(clearAutomatically = true)
	@Query("delete from SecurityTicketAudit a where a.ticket.id = :ticketId")
	void deleteAllForTicket(@Param("ticketId") Long ticketId);
}
