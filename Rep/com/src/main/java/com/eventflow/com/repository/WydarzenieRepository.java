package com.eventflow.com.repository;

import com.eventflow.com.model.Wydarzenie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WydarzenieRepository extends JpaRepository<Wydarzenie, Long> {
	@Query(value = """
		SELECT w.*
		FROM wydarzenia w
		WHERE w.org_id = :orgId
		""", nativeQuery = true)
	List<Wydarzenie> findByOrgId(@Param("orgId") Long orgId);

	List<Wydarzenie> findByKategoriaIdIn(List<Long> kategoriaIds);

	@Query(value = """
		SELECT w.*
		FROM wydarzenia w
		WHERE w.data_zamk > :now
		ORDER BY w.data_rozp ASC
		""", nativeQuery = true)
	List<Wydarzenie> findByDataZamkAfterOrderByDataRozpAsc(@Param("now") LocalDateTime now);

	/**
	 * Liczba wydarzeń o podanym statusie na całej platformie — używana jako licznik KPI „łącznie wydarzeń”
	 * oraz jako spójnik z wykresem kategorii, gdy nie stosujemy filtra {@code org_id} (admin / widok globalny).
	 */
	@Query(value = """
		SELECT COUNT(w.id)
		FROM wydarzenia w
		WHERE w.status = :status
		""", nativeQuery = true)
	long countByStatus(@Param("status") String status);

	/**
	 * Jak {@link #countByStatus(String)}, lecz tylko dla jednego organizatora — identyczny filtr {@code org_id}
	 * jak w zapytaniu agregującym kategorie, żeby suma wydarzeń i rozkład segmentów donut odnosiły się
	 * do tego samego zbioru rekordów.
	 */
	@Query(value = """
		SELECT COUNT(w.id)
		FROM wydarzenia w
		WHERE w.status = :status AND w.org_id = :orgId
		""", nativeQuery = true)
	long countByStatusAndOrgId(@Param("status") String status, @Param("orgId") Long orgId);

	/**
	 * Agregacja pod wykres pierścieniowy (i listę kategorii na froncie): dla każdej nazwy kategorii zwraca
	 * liczbę wydarzeń w statusie {@code AKTYWNY}. JOIN {@code wydarzenia}–{@code kategorie} zapewnia
	 * czytelną etykietę segmentu. Sortowanie malejące po liczbie ułatwia ewentualne dalsze cięcie do TOP N po stronie UI.
	 */
	@Query(value = """
		SELECT k.nazwa, COUNT(w.id)
		FROM wydarzenia w
		INNER JOIN kategorie k ON w.kategoria_id = k.id
		WHERE w.status = :status
		GROUP BY k.id, k.nazwa
		ORDER BY COUNT(w.id) DESC
		""", nativeQuery = true)
	List<Object[]> countActiveEventsByCategoryAll(@Param("status") String status);

	/**
	 * Odpowiednik {@link #countActiveEventsByCategoryAll(String)} z dodatkowym warunkiem {@code w.org_id = :orgId}.
	 * Zwraca ten sam kształt wierszy (nazwa kategorii, liczba), aby front mógł użyć jednej logiki rysowania donut
	 * niezależnie od tego, czy użytkownik widzi całą platformę, czy tylko własne wydarzenia jako organizator.
	 */
	@Query(value = """
		SELECT k.nazwa, COUNT(w.id)
		FROM wydarzenia w
		INNER JOIN kategorie k ON w.kategoria_id = k.id
		WHERE w.status = :status AND w.org_id = :orgId
		GROUP BY k.id, k.nazwa
		ORDER BY COUNT(w.id) DESC
		""", nativeQuery = true)
	List<Object[]> countActiveEventsByCategoryForOrg(@Param("status") String status, @Param("orgId") Long orgId);

	List<Wydarzenie> findByOrgStartReminderSentAtIsNull();

	@Query(value = """
		SELECT w.*
		FROM wydarzenia w
		WHERE w.sala_id IN (:salaIds)
		""", nativeQuery = true)
	List<Wydarzenie> findBySalaIdIn(@Param("salaIds") List<Long> salaIds);
}
